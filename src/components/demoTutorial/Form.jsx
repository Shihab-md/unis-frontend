import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRegTimesCircle } from "react-icons/fa";
import { demoTutorialApi } from "../../api/demoTutorialApi";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  handleRightClickAndFullScreen,
  showSwalAlert,
} from "../../utils/CommonHelper";
import { translateDemoTutorialMessage } from "./translateMessage";

const ROLE_VALUES = [
  "hquser",
  "supervisor",
  "admin",
  "employee",
  "teacher",
  "usthadh",
  "student",
  "parent",
  "warden",
  "staff",
  "guest",
];

const ACCEPTED_FILE_TYPES = ".pdf,.mp4,.webm,.mov,.m4v,application/pdf,video/mp4,video/webm,video/quicktime,video/x-m4v";

const formatBytes = (value) => {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const Form = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tr, direction, fontFamily } = useLanguage();
  const isRtl = direction === "rtl";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState({ loaded: 0, total: 0, percent: 0 });
  const [form, setForm] = useState({
    title: "",
    description: "",
    visibleRoles: [],
    file: null,
  });
  const [currentFileName, setCurrentFileName] = useState("");

  const isSuperadmin = String(user?.role || "").toLowerCase() === "superadmin";

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  useEffect(() => {
    if (!isSuperadmin) {
      showSwalAlert(tr("Error!"), tr("Only Superadmin can add or edit Demo - Tutorial files."), "error");
      navigate("/dashboard/demo-tutorial", { replace: true });
    }
  }, [isSuperadmin, navigate, tr]);

  useEffect(() => {
    if (!isEdit || !isSuperadmin) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await demoTutorialApi.detail(id);
        if (!active) return;
        const item = data?.item || {};
        setForm({
          title: item.title || "",
          description: item.description || "",
          visibleRoles: Array.isArray(item.visibleRoles) ? item.visibleRoles : [],
          file: null,
        });
        setCurrentFileName(item.driveFileName || item.originalFileName || "");
      } catch (error) {
        if (active) {
          const message = translateDemoTutorialMessage(
            tr,
            error?.response?.data?.error || "Unable to load Demo - Tutorial file."
          );
          showSwalAlert(tr("Error!"), message, "error");
          navigate("/dashboard/demo-tutorial", { replace: true });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id, isEdit, isSuperadmin, navigate, tr]);

  const roleOptions = useMemo(
    () => ROLE_VALUES.map((value) => ({ value, label: t(`roles.${value}`, value) })),
    [t]
  );

  const toggleRole = (role) => {
    setForm((current) => ({
      ...current,
      visibleRoles: current.visibleRoles.includes(role)
        ? current.visibleRoles.filter((value) => value !== role)
        : [...current.visibleRoles, role],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    if (!title) {
      showSwalAlert(tr("Info!"), tr("Title is required."), "info");
      return;
    }
    if (!form.visibleRoles.length) {
      showSwalAlert(tr("Info!"), tr("Select at least one role that can view this file."), "info");
      return;
    }
    if (!isEdit && !form.file) {
      showSwalAlert(tr("Info!"), tr("PDF or video file is required."), "info");
      return;
    }

    const metadataPayload = {
      title,
      description: form.description.trim(),
      visibleRoles: form.visibleRoles,
    };
    const selectedFile = form.file;
    const selectedFileSize = Number(selectedFile?.size || 0);
    let succeeded = false;

    setSaving(true);
    setUploadStage(selectedFile ? "preparing" : "saving");
    setUploadProgress({ loaded: 0, total: selectedFileSize, percent: 0 });

    try {
      let uploadToken = "";
      let driveFileId = "";

      if (selectedFile) {
        const session = isEdit
          ? await demoTutorialApi.createReplacementUploadSession(id, {
              file: selectedFile,
              ...metadataPayload,
            })
          : await demoTutorialApi.createUploadSession({
              file: selectedFile,
              ...metadataPayload,
            });

        setUploadStage("uploading");
        const uploaded = await demoTutorialApi.uploadInChunksThroughServer({
          uploadToken: session.uploadToken,
          file: selectedFile,
          chunkSize: session.uploadChunkBytes,
          onUploadProgress: (progressEvent) => {
            const total = Number(progressEvent?.total || selectedFileSize || 0);
            const loaded = Math.min(total, Number(progressEvent?.loaded || 0));
            const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((loaded * 100) / total))) : 0;
            setUploadProgress({ loaded, total, percent });
          },
        });

        uploadToken = session.uploadToken || "";
        driveFileId = uploaded?.id || session.driveFileId || "";
        if (!uploadToken || !driveFileId) {
          throw new Error("Unable to upload Demo - Tutorial file.");
        }
        setUploadProgress({ loaded: selectedFileSize, total: selectedFileSize, percent: 100 });
        setUploadStage("saving");
      }

      const payload = {
        ...metadataPayload,
        ...(uploadToken ? { uploadToken, driveFileId } : {}),
      };

      if (isEdit) await demoTutorialApi.update(id, payload);
      else await demoTutorialApi.create(payload);

      setUploadStage("completed");
      if (selectedFileSize > 0) {
        setUploadProgress({ loaded: selectedFileSize, total: selectedFileSize, percent: 100 });
      }
      await sleep(400);
      succeeded = true;
      showSwalAlert(
        tr("Success!"),
        isEdit ? tr("Successfully Updated!") : tr("Successfully Added!"),
        "success"
      );
      navigate("/dashboard/demo-tutorial");
    } catch (error) {
      const message = translateDemoTutorialMessage(
        tr,
        error?.response?.data?.error || error?.message || "Unable to save Demo - Tutorial file."
      );
      showSwalAlert(tr("Error!"), message, "error");
    } finally {
      if (!succeeded) {
        setSaving(false);
        setUploadStage("idle");
        setUploadProgress({ loaded: 0, total: 0, percent: 0 });
      }
    }
  };

  if (!isSuperadmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen p-3 md:p-5">
        <div
          className="mx-auto mt-3 max-w-4xl rounded-lg border bg-white p-8 text-center text-sm text-slate-500 shadow"
          dir={direction}
          style={{ fontFamily }}
        >
          {tr("Loading...")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl p-3 md:p-5" dir={direction} style={{ fontFamily }}>
      <div className="rounded-lg border bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between rounded-lg bg-teal-700 px-4 py-3 text-white shadow">
          <div>
            <h1 className="text-base font-semibold md:text-xl">
              {isEdit ? tr("Edit Demo - Tutorial") : tr("Add Demo - Tutorial")}
            </h1>
            <p className="mt-0.5 text-[11px] text-teal-100 md:text-xs">
              {tr("PDF/video files are stored privately in UNIS/Demo-Tutorial on Google Drive.")}
            </p>
          </div>
          <Link to="/dashboard/demo-tutorial" aria-label={tr("Close")} title={tr("Close")}>
            <FaRegTimesCircle className="rounded-full bg-white text-2xl text-red-700" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {tr("Title")} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              maxLength={160}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className={`mt-1 w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 ${isRtl ? "text-right" : "text-left"}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">{tr("Description")}</label>
            <textarea
              value={form.description}
              maxLength={3000}
              rows={5}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className={`mt-1 w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 ${isRtl ? "text-right" : "text-left"}`}
            />
            <div className={`mt-1 text-[10px] text-slate-400 ${isRtl ? "text-left" : "text-right"}`}>{form.description.length}/3000</div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-slate-700">
                  {tr("Visible To Roles")} <span className="text-red-700">*</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {tr("Only selected roles can see, view and download this item. Superadmin always has access.")}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, visibleRoles: [...ROLE_VALUES] }))}
                  className="rounded border border-blue-300 px-2 py-1 text-[11px] text-blue-700"
                >
                  {tr("Select All")}
                </button>
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, visibleRoles: [] }))}
                  className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-600"
                >
                  {tr("Clear")}
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {roleOptions.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.visibleRoles.includes(option.value)}
                    onChange={() => toggleRole(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {isEdit ? tr("Replace File (optional)") : tr("Upload File")}
              {!isEdit ? <span className="text-red-700"> *</span> : null}
            </label>
            {isEdit && currentFileName ? (
              <div className="mt-1 break-all rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                {tr("Current file: {{fileName}}", { fileName: currentFileName })}
              </div>
            ) : null}
            <input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              required={!isEdit}
              onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
              className="mt-2 block w-full rounded-md border border-slate-300 p-2 text-sm"
            />
            <div className="mt-1 text-[11px] text-slate-500">{tr("Allowed: PDF, MP4, WEBM, MOV, M4V.")}</div>
          </div>

          {saving && uploadStage !== "idle" ? (
            <div className={`rounded-lg border p-3 ${uploadStage === "completed" ? "border-emerald-200 bg-emerald-50" : "border-blue-100 bg-blue-50"}`} role="status" aria-live="polite">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className={`font-semibold ${uploadStage === "completed" ? "text-emerald-700" : "text-blue-700"}`}>
                  {uploadStage === "preparing"
                    ? tr("Preparing...")
                    : uploadStage === "uploading"
                      ? tr("Uploading...")
                      : uploadStage === "saving"
                        ? tr("Saving...")
                        : tr("Completed")}
                </span>
                {uploadStage === "uploading" && uploadProgress.total > 0 ? (
                  <span className="text-slate-600">
                    {formatBytes(uploadProgress.loaded)} / {formatBytes(uploadProgress.total)} • {uploadProgress.percent}%
                  </span>
                ) : uploadStage === "completed" ? (
                  <span className="font-semibold text-emerald-700">100%</span>
                ) : null}
              </div>

              {uploadStage === "uploading" || uploadStage === "completed" ? (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full transition-[width] duration-200 ${uploadStage === "completed" ? "bg-emerald-600" : "bg-blue-700"}`}
                    style={{ width: `${uploadStage === "completed" ? 100 : uploadProgress.percent}%` }}
                  />
                </div>
              ) : (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />
                </div>
              )}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white shadow hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? uploadStage === "preparing"
                ? tr("Preparing...")
                : uploadStage === "uploading"
                  ? `${tr("Uploading...")} ${uploadProgress.percent}%`
                  : uploadStage === "completed"
                    ? tr("Completed")
                    : tr("Saving...")
              : isEdit
                ? tr("Update Demo - Tutorial")
                : tr("Add Demo - Tutorial")}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Form;
