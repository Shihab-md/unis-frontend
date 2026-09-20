import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaDownload,
  FaEdit,
  FaFilePdf,
  FaPlus,
  FaSearch,
  FaTrash,
  FaVideo,
} from "react-icons/fa";
import { demoTutorialApi } from "../../api/demoTutorialApi";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  handleRightClickAndFullScreen,
  showConfirmationSwalAlert,
  showSwalAlert,
} from "../../utils/CommonHelper";
import { translateDemoTutorialMessage } from "./translateMessage";

const formatBytes = (value) => {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const FileIcon = ({ kind }) =>
  kind === "VIDEO" ? (
    <FaVideo className="text-purple-700" />
  ) : (
    <FaFilePdf className="text-red-700" />
  );

const List = () => {
  const { user } = useAuth();
  const { t, tr, direction, fontFamily } = useLanguage();
  const isSuperadmin = String(user?.role || "").toLowerCase() === "superadmin";
  const isRtl = direction === "rtl";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [downloadingId, setDownloadingId] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await demoTutorialApi.list({ page, limit: 20, search });
      setItems(Array.isArray(data?.items) ? data.items : []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      const message = translateDemoTutorialMessage(
        tr,
        error?.response?.data?.error || "Unable to load Demo - Tutorial files."
      );
      showSwalAlert(tr("Error!"), message, "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, tr]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const roleLabels = useMemo(
    () => ({
      hquser: t("roles.hquser", "HQ User"),
      supervisor: t("roles.supervisor", "Supervisor"),
      admin: t("roles.admin", "Admin"),
      employee: t("roles.employee", "Employee"),
      teacher: t("roles.teacher", "Teacher"),
      usthadh: t("roles.usthadh", "Usthadh"),
      student: t("roles.student", "Student"),
      parent: t("roles.parent", "Parent"),
      warden: t("roles.warden", "Warden"),
      staff: t("roles.staff", "Staff"),
      guest: t("roles.guest", "Guest"),
    }),
    [t]
  );

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDownload = async (item) => {
    if (!item?._id || downloadingId) return;

    const expectedTotal = Number(item.fileSize || 0);
    setDownloadingId(item._id);
    setDownloadProgress({
      id: item._id,
      loaded: 0,
      total: Number.isFinite(expectedTotal) && expectedTotal > 0 ? expectedTotal : 0,
      percent: 0,
    });

    try {
      const { blob, fileName } = await demoTutorialApi.download({
        id: item._id,
        fallbackFileName: item.driveFileName || item.originalFileName || "",
        fileSize: item.fileSize,
        mimeType: item.mimeType,
        onProgress: (loaded, total) => {
          const safeLoaded = Number(loaded || 0);
          const safeTotal = Number(total || expectedTotal || 0);
          const percent =
            safeTotal > 0
              ? Math.min(100, Math.max(0, Math.round((safeLoaded / safeTotal) * 100)))
              : 0;
          setDownloadProgress({
            id: item._id,
            loaded: safeLoaded,
            total: safeTotal,
            percent,
          });
        },
      });

      setDownloadProgress({
        id: item._id,
        loaded: expectedTotal > 0 ? expectedTotal : Number(blob?.size || 0),
        total: expectedTotal > 0 ? expectedTotal : Number(blob?.size || 0),
        percent: 100,
      });

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName || item.driveFileName || item.originalFileName || "tutorial-file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      setDownloadingId("");
      window.setTimeout(() => {
        setDownloadProgress((current) =>
          current?.id === item._id && current?.percent === 100 ? null : current
        );
      }, 800);
    } catch (error) {
      let message = "Unable to download this file.";
      const responseData = error?.response?.data;
      if (responseData instanceof Blob) {
        try {
          const parsed = JSON.parse(await responseData.text());
          message = parsed?.error || message;
        } catch {
          // Keep safe fallback.
        }
      } else if (responseData?.error) {
        message = responseData.error;
      }
      setDownloadingId("");
      setDownloadProgress(null);
      showSwalAlert(tr("Error!"), translateDemoTutorialMessage(tr, message), "error");
    }
  };

  const handleDelete = async (item) => {
    if (!isSuperadmin || !item?._id || deletingId) return;
    const result = await showConfirmationSwalAlert(
      tr("Are you sure to Delete?"),
      tr("The file will also be deleted from Google Drive."),
      "question"
    );
    if (!result?.isConfirmed) return;

    setDeletingId(item._id);
    try {
      await demoTutorialApi.remove(item._id);
      showSwalAlert(tr("Success!"), tr("Successfully Deleted!"), "success");
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadItems();
    } catch (error) {
      const message = translateDemoTutorialMessage(
        tr,
        error?.response?.data?.error || "Unable to delete this file."
      );
      showSwalAlert(tr("Error!"), message, "error");
    } finally {
      setDeletingId("");
    }
  };

  const renderRoles = (item) => {
    if (!isSuperadmin) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {(item.visibleRoles || []).map((role) => (
          <span key={role} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {roleLabels[role] || role}
          </span>
        ))}
      </div>
    );
  };

  const renderDownloadProgress = (item) => {
    if (!downloadProgress || downloadProgress.id !== item?._id) return null;

    const percent = Math.min(100, Math.max(0, Number(downloadProgress.percent || 0)));
    const loadedText = formatBytes(downloadProgress.loaded);
    const totalText = formatBytes(downloadProgress.total);

    return (
      <div className="mt-2" role="status" aria-live="polite">
        <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-medium text-blue-700">
          <span>{tr("Download")} {percent}%</span>
          {loadedText && totalText ? <span className="text-slate-500">{loadedText} / {totalText}</span> : null}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-700 transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-3 md:p-5" dir={direction} style={{ fontFamily }}>
      <div className="demo-tutorial-card-pattern rounded-lg border p-4 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800 md:text-xl">{tr("Demo - Tutorial")}</h1>
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              {tr("Download demo and tutorial PDF/video files available for your role.")}
            </p>
          </div>

          {isSuperadmin ? (
            <Link
              to="/dashboard/demo-tutorial/add"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-800"
            >
              <FaPlus /> {tr("Add New")}
            </Link>
          ) : null}
        </div>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <FaSearch
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? "right-3" : "left-3"}`}
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={tr("Search title or description")}
              className={`w-full rounded-md border border-slate-300 py-2 text-sm outline-none focus:border-blue-500 ${
                isRtl ? "pl-3 pr-9 text-right" : "pl-9 pr-3 text-left"
              }`}
            />
          </div>
          <button type="submit" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
            {tr("Search")}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="demo-tutorial-card-pattern mt-5 rounded-lg border p-8 text-center text-sm text-slate-500 shadow">{tr("Loading...")}</div>
      ) : items.length === 0 ? (
        <div className="demo-tutorial-card-pattern mt-5 rounded-lg border p-8 text-center text-sm text-slate-500 shadow">
          {tr("No Demo - Tutorial files are available for your role.")}
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3 md:hidden">
            {items.map((item) => (
              <div key={item._id} className="demo-tutorial-card-pattern rounded-lg border p-4 shadow-md">
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">{tr("Title")}</div>
                    <div className="mt-0.5 break-words text-sm font-semibold text-slate-800">{item.title}</div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500">{tr("Description")}</div>
                    <div className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                      {item.description || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500">{tr("File")}</div>
                    <div className="mt-1 flex items-start gap-2">
                      <div className="mt-0.5 shrink-0 text-lg"><FileIcon kind={item.fileKind} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="break-all text-xs text-slate-700">
                          {item.driveFileName || item.originalFileName}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {tr(item.fileKind === "VIDEO" ? "Video" : "PDF")}
                          {formatBytes(item.fileSize) ? ` • ${formatBytes(item.fileSize)}` : ""}
                        </div>
                        {renderDownloadProgress(item)}
                      </div>
                    </div>
                  </div>

                  {isSuperadmin ? (
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">{tr("Visible To")}</div>
                      {renderRoles(item)}
                    </div>
                  ) : null}

                  <div className="border-t pt-3">
                    <div className="mb-2 text-[11px] font-medium text-slate-500">{tr("Action")}</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        disabled={Boolean(downloadingId)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        title={tr("Download")}
                      >
                        <FaDownload /> {downloadingId === item._id
                          ? `${tr("Download")} ${downloadProgress?.id === item._id ? `${downloadProgress.percent}%` : "..."}`
                          : tr("Download")}
                      </button>
                      {isSuperadmin ? (
                        <>
                          <Link
                            to={`/dashboard/demo-tutorial/edit/${item._id}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white"
                            title={tr("Edit")}
                          >
                            <FaEdit /> {tr("Edit")}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={Boolean(deletingId)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                            title={tr("Delete")}
                          >
                            <FaTrash /> {deletingId === item._id ? "..." : tr("Delete")}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 hidden overflow-x-auto rounded-lg border bg-white shadow-lg md:block">
            <table className={`w-full min-w-[900px] table-fixed text-sm ${isRtl ? "text-right" : "text-left"}`}>
              <colgroup>
                {isSuperadmin ? (
                  <>
                    <col className="w-[40%]" />
                    <col className="w-[25%]" />
                    <col className="w-[23%]" />
                    <col className="w-[12%]" />
                  </>
                ) : (
                  <>
                    <col className="w-[50%]" />
                    <col className="w-[35%]" />
                    <col className="w-[15%]" />
                  </>
                )}
              </colgroup>
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">{tr("Title / Description")}</th>
                  <th className="px-4 py-3">{tr("File")}</th>
                  {isSuperadmin ? <th className="px-4 py-3">{tr("Visible To")}</th> : null}
                  <th className="px-4 py-3 text-center">{tr("Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item._id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-3 break-words">
                      <div className="break-words font-semibold text-slate-800">{item.title}</div>
                      {item.description ? (
                        <div className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">{item.description}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileIcon kind={item.fileKind} />
                        <span className="min-w-0 break-all text-xs text-slate-700">
                          {item.driveFileName || item.originalFileName}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {tr(item.fileKind === "VIDEO" ? "Video" : "PDF")}{formatBytes(item.fileSize) ? ` • ${formatBytes(item.fileSize)}` : ""}
                      </div>
                      {renderDownloadProgress(item)}
                    </td>
                    {isSuperadmin ? <td className="px-4 py-3">{renderRoles(item)}</td> : null}
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          disabled={Boolean(downloadingId)}
                          className="rounded-md bg-blue-700 p-2 text-white disabled:opacity-50"
                          title={tr("Download")}
                        >
                          <span className="inline-flex items-center gap-1">
                            <FaDownload />
                            {downloadingId === item._id && downloadProgress?.id === item._id ? (
                              <span className="text-[10px] font-semibold">{downloadProgress.percent}%</span>
                            ) : null}
                          </span>
                        </button>
                        {isSuperadmin ? (
                          <>
                            <Link
                              to={`/dashboard/demo-tutorial/edit/${item._id}`}
                              className="rounded-md bg-amber-600 p-2 text-white"
                              title={tr("Edit")}
                            >
                              <FaEdit />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={Boolean(deletingId)}
                              className="rounded-md bg-red-700 p-2 text-white disabled:opacity-50"
                              title={tr("Delete")}
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pagination.totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {tr("Previous")}
          </button>
          <span className="text-xs text-slate-600">
            {tr("Page {{page}} of {{totalPages}} • {{total}} file(s)", {
              page: pagination.page,
              totalPages: pagination.totalPages,
              total: pagination.total,
            })}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {tr("Next")}
          </button>
        </div>
      ) : null}
      </div>
    </div>
  );
};

export default List;
