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

const Form = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tr, direction, fontFamily } = useLanguage();
  const isRtl = direction === "rtl";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
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

    setSaving(true);
    setUploadProgress(0);
    setUploadingFile(Boolean(form.file));
    try {
      let uploadToken = "";
      let driveFileId = "";

      if (form.file) {
        const session = isEdit
          ? await demoTutorialApi.createReplacementUploadSession(id, {
              file: form.file,
              ...metadataPayload,
            })
          : await demoTutorialApi.createUploadSession({
              file: form.file,
              ...metadataPayload,
            });

        const uploaded = await demoTutorialApi.uploadInChunksThroughServer({
          uploadToken: session.uploadToken,
          file: form.file,
          chunkSize: session.uploadChunkBytes,
          onUploadProgress: (progressEvent) => {
            const total = Number(progressEvent?.total || form.file?.size || 0);
            if (!total) return;
            setUploadProgress(
              Math.min(
                100,
                Math.round((Number(progressEvent.loaded || 0) * 100) / total)
              )
            );
          },
        });

        uploadToken = session.uploadToken || "";
        driveFileId = uploaded?.id || session.driveFileId || "";
        if (!uploadToken || !driveFileId) {
          throw new Error("Unable to upload Demo - Tutorial file.");
        }
        setUploadProgress(0);
        setUploadingFile(false);
      }

      const payload = {
        ...metadataPayload,
        ...(uploadToken ? { uploadToken, driveFileId } : {}),
      };

      if (isEdit) await demoTutorialApi.update(id, payload);
      else await demoTutorialApi.create(payload);

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
      setSaving(false);
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  if (!isSuperadmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen p-3 md:p-5">
        <div
          className="demo-tutorial-card-pattern mx-auto mt-3 max-w-4xl rounded-lg border p-8 text-center text-sm text-slate-500 shadow"
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
      <div className="demo-tutorial-card-pattern rounded-lg border p-5 shadow-lg">
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
                  {tr("Only selected roles can see this item in the list and download it. Superadmin always has access.")}
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

          {saving && uploadProgress > 0 ? (
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                <span>{tr("Uploading...")}</span><span>{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-blue-700 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white shadow hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (uploadingFile ? tr("Uploading...") : tr("Saving...")) : isEdit ? tr("Update Demo - Tutorial") : tr("Add Demo - Tutorial")}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Form;
