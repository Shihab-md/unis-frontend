import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaCompress,
  FaDownload,
  FaExpand,
  FaFilePdf,
  FaMinus,
  FaPlus,
  FaVideo,
} from "react-icons/fa";
import { demoTutorialApi } from "../../api/demoTutorialApi";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  handleRightClickAndFullScreen,
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

const getDownloadErrorMessage = async (error) => {
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
  } else if (error?.message) {
    message = error.message;
  }
  return message;
};

const Viewer = () => {
  const { id } = useParams();
  const { tr, direction, fontFamily } = useLanguage();
  const isRtl = direction === "rtl";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerError, setViewerError] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [previewProgress, setPreviewProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfFitWidth, setPdfFitWidth] = useState(true);
  const [viewerExpanded, setViewerExpanded] = useState(false);

  const pdfBlobRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  useEffect(() => {
    if (!viewerExpanded) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setViewerExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewerExpanded]);

  useEffect(() => {
    let active = true;
    let localPdfUrl = "";

    const loadViewer = async () => {
      setLoading(true);
      setViewerError("");
      setPreviewProgress(0);
      setStreamUrl("");
      setPdfUrl("");
      setPlaybackRate(1);
      setPdfPage(1);
      setPdfZoom(100);
      setPdfFitWidth(true);
      pdfBlobRef.current = null;

      try {
        const detail = await demoTutorialApi.detail(id);
        if (!active) return;
        const currentItem = detail?.item;
        if (!currentItem?._id) throw new Error("Demo - Tutorial file not found.");
        setItem(currentItem);

        if (currentItem.fileKind === "VIDEO") {
          const session = await demoTutorialApi.createViewSession(currentItem._id);
          if (!active) return;
          setStreamUrl(session.streamUrl || "");
          setPreviewProgress(100);
        } else if (currentItem.fileKind === "PDF") {
          const { blob } = await demoTutorialApi.download({
            id: currentItem._id,
            fallbackFileName: currentItem.driveFileName || currentItem.originalFileName || "tutorial.pdf",
            fileSize: currentItem.fileSize,
            mimeType: currentItem.mimeType || "application/pdf",
            onProgress: (loaded, total) => {
              if (!active) return;
              const safeLoaded = Number(loaded || 0);
              const safeTotal = Number(total || currentItem.fileSize || 0);
              setPreviewProgress(safeTotal > 0 ? Math.min(100, Math.max(0, Math.round((safeLoaded / safeTotal) * 100))) : 0);
            },
          });
          if (!active) return;
          pdfBlobRef.current = blob;
          localPdfUrl = window.URL.createObjectURL(blob);
          setPdfUrl(localPdfUrl);
          setPreviewProgress(100);
        } else {
          throw new Error("Unable to load Demo - Tutorial file.");
        }
      } catch (error) {
        if (!active) return;
        setViewerError(translateDemoTutorialMessage(
          tr,
          error?.response?.data?.error || error?.message || "Unable to load Demo - Tutorial file."
        ));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadViewer();
    return () => {
      active = false;
      if (localPdfUrl) window.URL.revokeObjectURL(localPdfUrl);
    };
  }, [id, tr]);

  const pdfViewerUrl = useMemo(() => {
    if (!pdfUrl) return "";
    const view = pdfFitWidth ? "view=FitH" : `zoom=${pdfZoom}`;
    return `${pdfUrl}#page=${pdfPage}&${view}&toolbar=1&navpanes=0&scrollbar=1`;
  }, [pdfFitWidth, pdfPage, pdfUrl, pdfZoom]);

  const saveBlob = (blob, fileName) => {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || "tutorial-file";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
  };

  const handleDownload = async () => {
    if (!item?._id || downloading) return;
    setDownloading(true);
    setDownloadProgress(0);
    try {
      const fileName = item.driveFileName || item.originalFileName || "tutorial-file";
      if (item.fileKind === "PDF" && pdfBlobRef.current) {
        setDownloadProgress(100);
        saveBlob(pdfBlobRef.current, fileName);
        return;
      }
      const { blob, fileName: responseFileName } = await demoTutorialApi.download({
        id: item._id,
        fallbackFileName: fileName,
        fileSize: item.fileSize,
        mimeType: item.mimeType,
        onProgress: (loaded, total) => {
          const safeLoaded = Number(loaded || 0);
          const safeTotal = Number(total || item.fileSize || 0);
          setDownloadProgress(safeTotal > 0 ? Math.min(100, Math.max(0, Math.round((safeLoaded / safeTotal) * 100))) : 0);
        },
      });
      setDownloadProgress(100);
      saveBlob(blob, responseFileName || fileName);
    } catch (error) {
      const message = await getDownloadErrorMessage(error);
      showSwalAlert(tr("Error!"), translateDemoTutorialMessage(tr, message), "error");
      setDownloadProgress(0);
    } finally {
      setDownloading(false);
    }
  };

  const handlePlaybackRate = (event) => {
    const next = Number(event.target.value || 1);
    setPlaybackRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  const handlePdfZoom = (directionValue) => {
    const current = pdfFitWidth ? 100 : pdfZoom;
    const next = Math.min(200, Math.max(50, current + directionValue * 25));
    setPdfFitWidth(false);
    setPdfZoom(next);
  };

  const fileName = item?.driveFileName || item?.originalFileName || "";
  const toolbarButton = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-3 md:p-5" dir={direction} style={{ fontFamily }}>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Link to="/dashboard/demo-tutorial" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900">
                <FaArrowLeft className={isRtl ? "rotate-180" : ""} /> {tr("Back")}
              </Link>
              <h1 className="break-words text-lg font-semibold text-slate-800 md:text-xl">{item?.title || tr("Demo - Tutorial")}</h1>
              {item ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    {item.fileKind === "VIDEO" ? <FaVideo className="shrink-0 text-purple-700" /> : <FaFilePdf className="shrink-0 text-red-700" />}
                    <span className="break-all">{fileName}</span>
                  </span>
                  {formatBytes(item.fileSize) ? <span>{formatBytes(item.fileSize)}</span> : null}
                </div>
              ) : null}
            </div>
            {item ? (
              <button type="button" onClick={handleDownload} disabled={downloading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                <FaDownload /> {downloading ? `${tr("Download")} ${downloadProgress}%` : tr("Download")}
              </button>
            ) : null}
          </div>
          {downloading ? (
            <div className="mt-3" role="status" aria-live="polite">
              <div className="mb-1 text-xs font-medium text-blue-700">{tr("Download")} {downloadProgress}%</div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-700 transition-[width] duration-200" style={{ width: `${downloadProgress}%` }} /></div>
            </div>
          ) : null}
        </div>

        <div className={viewerExpanded ? "fixed inset-0 z-[100] flex flex-col bg-white" : "mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"}>
          {!loading && !viewerError && item ? (
            <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 md:px-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                {item.fileKind === "VIDEO" ? <FaVideo className="text-purple-700" /> : <FaFilePdf className="text-red-700" />}
                {tr(item.fileKind === "VIDEO" ? "Video" : "PDF")}
              </div>
              {item.fileKind === "VIDEO" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <span>{tr("Playback Speed")}</span>
                    <select value={playbackRate} onChange={handlePlaybackRate} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-blue-500">
                      {[0.5, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}×</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => setViewerExpanded((current) => !current)} className={toolbarButton} title={tr(viewerExpanded ? "Exit Full Screen" : "Full Screen")}>
                    {viewerExpanded ? <FaCompress /> : <FaExpand />} <span className="hidden sm:inline">{tr(viewerExpanded ? "Exit Full Screen" : "Full Screen")}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <button type="button" onClick={() => setPdfPage((current) => Math.max(1, current - 1))} disabled={pdfPage <= 1} className={toolbarButton} title={tr("Previous")}><FaChevronLeft className={isRtl ? "rotate-180" : ""} /><span className="hidden sm:inline">{tr("Previous")}</span></button>
                  <label className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-600">
                    <span>{tr("Page")}</span>
                    <input type="number" min="1" value={pdfPage} onChange={(event) => setPdfPage(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} className="w-12 bg-transparent text-center font-semibold text-slate-800 outline-none" aria-label={tr("Page")} />
                  </label>
                  <button type="button" onClick={() => setPdfPage((current) => current + 1)} className={toolbarButton} title={tr("Next")}><span className="hidden sm:inline">{tr("Next")}</span><FaChevronRight className={isRtl ? "rotate-180" : ""} /></button>
                  <span className="mx-0.5 hidden h-6 w-px bg-slate-300 sm:block" />
                  <button type="button" onClick={() => handlePdfZoom(-1)} disabled={!pdfFitWidth && pdfZoom <= 50} className={toolbarButton} title={tr("Zoom Out")}><FaMinus /></button>
                  <button type="button" onClick={() => setPdfFitWidth(true)} className={`${toolbarButton} ${pdfFitWidth ? "border-blue-300 bg-blue-50 text-blue-700" : ""}`} title={tr("Fit Width")}><span>{pdfFitWidth ? tr("Fit Width") : `${pdfZoom}%`}</span></button>
                  <button type="button" onClick={() => handlePdfZoom(1)} disabled={!pdfFitWidth && pdfZoom >= 200} className={toolbarButton} title={tr("Zoom In")}><FaPlus /></button>
                  <button type="button" onClick={() => setViewerExpanded((current) => !current)} className={toolbarButton} title={tr(viewerExpanded ? "Exit Full Screen" : "Full Screen")}>
                    {viewerExpanded ? <FaCompress /> : <FaExpand />} <span className="hidden sm:inline">{tr(viewerExpanded ? "Exit Full Screen" : "Full Screen")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 p-6 text-sm text-slate-600">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
              <div>{tr("Loading...")}</div>
              {previewProgress > 0 ? <div className="w-full max-w-sm"><div className="mb-1 text-center text-xs text-blue-700">{previewProgress}%</div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-700 transition-[width] duration-200" style={{ width: `${previewProgress}%` }} /></div></div> : null}
            </div>
          ) : viewerError ? (
            <div className="flex min-h-[45vh] items-center justify-center p-6 text-center text-sm text-red-700">{viewerError}</div>
          ) : item?.fileKind === "VIDEO" && streamUrl ? (
            <div className={`flex items-center justify-center bg-black p-0 ${viewerExpanded ? "min-h-0 flex-1" : "min-h-[50vh] md:p-4"}`}>
              <video ref={videoRef} key={streamUrl} className={viewerExpanded ? "h-full max-h-[calc(100vh-52px)] w-full bg-black object-contain" : "max-h-[75vh] w-full max-w-6xl bg-black"} src={streamUrl} controls playsInline preload="metadata" onLoadedMetadata={(event) => { event.currentTarget.playbackRate = playbackRate; }} onError={() => setViewerError(tr("Unable to load Demo - Tutorial file."))}>{tr("Unable to load Demo - Tutorial file.")}</video>
            </div>
          ) : item?.fileKind === "PDF" && pdfViewerUrl ? (
            <iframe title={item.title || tr("Demo - Tutorial")} src={pdfViewerUrl} className={viewerExpanded ? "min-h-0 flex-1 w-full bg-white" : "h-[72vh] min-h-[520px] w-full bg-white md:h-[78vh]"} />
          ) : (
            <div className="flex min-h-[45vh] items-center justify-center p-6 text-center text-sm text-red-700">{tr("Unable to load Demo - Tutorial file.")}</div>
          )}
        </div>

        {item?.description ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow md:p-5">
            <h2 className="text-sm font-semibold text-blue-700">{tr("Description")}</h2>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Viewer;
