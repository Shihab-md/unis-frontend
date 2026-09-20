import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const buildUrl = async (path = "") =>
  `${(await getBaseUrl()).toString()}demo-tutorial${path}`;

const parseFilename = (contentDisposition = "") => {
  const utf = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf?.[1]) {
    try {
      return decodeURIComponent(utf[1]);
    } catch {
      return utf[1];
    }
  }

  const basic = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return basic?.[1] || "";
};

const fileHeadBase64 = async (file) => {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
};

const buildUploadSessionPayload = async ({ file, title, description, visibleRoles }) => ({
  title: String(title || "").trim(),
  description: String(description || "").trim(),
  visibleRoles,
  fileName: file?.name || "",
  mimeType: file?.type || "",
  fileSize: Number(file?.size || 0),
  signatureBase64: file ? await fileHeadBase64(file) : "",
});

const DEFAULT_UPLOAD_CHUNK_BYTES = 2 * 1024 * 1024;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const uploadInChunksThroughServer = async ({
  uploadToken,
  file,
  chunkSize = DEFAULT_UPLOAD_CHUNK_BYTES,
  onUploadProgress,
}) => {
  const total = Number(file?.size || 0);
  const size = Number(chunkSize || DEFAULT_UPLOAD_CHUNK_BYTES);
  if (!uploadToken || !file || !Number.isSafeInteger(total) || total <= 0) {
    throw new Error("Unable to upload Demo - Tutorial file.");
  }
  if (!Number.isSafeInteger(size) || size <= 0 || size > DEFAULT_UPLOAD_CHUNK_BYTES) {
    throw new Error("Unable to upload Demo - Tutorial file.");
  }

  let start = 0;
  while (start < total) {
    const endExclusive = Math.min(total, start + size);
    const endInclusive = endExclusive - 1;
    const chunk = file.slice(start, endExclusive);
    let response = null;
    let lastError = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await axios.put(await buildUrl("/upload-chunk"), chunk, {
          headers: {
            ...authHeaders(),
            "Content-Type": "application/octet-stream",
            "Content-Range": `bytes ${start}-${endInclusive}/${total}`,
            "X-Demo-Upload-Token": uploadToken,
          },
          onUploadProgress: (event) => {
            if (typeof onUploadProgress !== "function") return;
            const loadedInChunk = Math.min(
              Number(event?.loaded || 0),
              Number(chunk.size || 0)
            );
            onUploadProgress({
              loaded: Math.min(total, start + loadedInChunk),
              total,
            });
          },
        });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        const status = Number(error?.response?.status || 0);
        if ((status >= 400 && status < 500) || attempt === 2) break;
        await sleep(500 * 2 ** attempt);
      }
    }

    if (lastError || !response?.data?.success) {
      throw lastError || new Error("Unable to upload Demo - Tutorial file.");
    }

    const data = response.data;
    if (data.completed) {
      if (typeof onUploadProgress === "function") {
        onUploadProgress({ loaded: total, total });
      }
      if (!data.driveFileId) {
        throw new Error("Unable to upload Demo - Tutorial file.");
      }
      return { id: data.driveFileId };
    }

    const nextOffset = Number(data.nextOffset);
    if (
      !Number.isSafeInteger(nextOffset) ||
      nextOffset <= start ||
      nextOffset > total
    ) {
      throw new Error("Upload session expired or is invalid. Please try again.");
    }

    start = nextOffset;
    if (typeof onUploadProgress === "function") {
      onUploadProgress({ loaded: start, total });
    }
  }

  throw new Error("Unable to upload Demo - Tutorial file.");
};

const DOWNLOAD_CHUNK_BYTES = 2 * 1024 * 1024;

const downloadInChunks = async ({ id, fileSize, mimeType, onProgress }) => {
  const total = Number(fileSize || 0);
  if (!Number.isSafeInteger(total) || total <= 0) {
    throw new Error("Unable to download Demo - Tutorial file.");
  }

  const parts = [];
  let downloaded = 0;
  for (let start = 0; start < total; start += DOWNLOAD_CHUNK_BYTES) {
    const end = Math.min(total - 1, start + DOWNLOAD_CHUNK_BYTES - 1);
    const query = new URLSearchParams({
      start: String(start),
      end: String(end),
    });
    const response = await axios.get(
      await buildUrl(`/${id}/download-chunk?${query.toString()}`),
      {
        headers: authHeaders(),
        responseType: "arraybuffer",
      }
    );
    parts.push(response.data);
    downloaded += Number(response.data?.byteLength || 0);
    if (typeof onProgress === "function") onProgress(downloaded, total);
  }

  if (downloaded !== total) {
    throw new Error("Unable to download Demo - Tutorial file.");
  }

  return new Blob(parts, { type: mimeType || "application/octet-stream" });
};

export const demoTutorialApi = {
  list: async ({ page = 1, limit = 20, search = "" } = {}) => {
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (String(search || "").trim()) query.set("search", String(search).trim());

    return (
      await axios.get(await buildUrl(`/?${query.toString()}`), {
        headers: authHeaders(),
      })
    ).data;
  },

  detail: async (id) =>
    (
      await axios.get(await buildUrl(`/${id}`), {
        headers: authHeaders(),
      })
    ).data,

  createUploadSession: async ({ file, title, description, visibleRoles }) => {
    const payload = await buildUploadSessionPayload({
      file,
      title,
      description,
      visibleRoles,
    });
    return (
      await axios.post(await buildUrl("/upload-session"), payload, {
        headers: authHeaders(),
      })
    ).data;
  },

  createReplacementUploadSession: async (
    id,
    { file, title, description, visibleRoles }
  ) => {
    const payload = await buildUploadSessionPayload({
      file,
      title,
      description,
      visibleRoles,
    });
    return (
      await axios.post(await buildUrl(`/${id}/upload-session`), payload, {
        headers: authHeaders(),
      })
    ).data;
  },

  uploadInChunksThroughServer,

  create: async (payload) =>
    (
      await axios.post(await buildUrl("/"), payload, {
        headers: authHeaders(),
      })
    ).data,

  update: async (id, payload) =>
    (
      await axios.put(await buildUrl(`/${id}`), payload, {
        headers: authHeaders(),
      })
    ).data,

  remove: async (id) =>
    (
      await axios.delete(await buildUrl(`/${id}`), {
        headers: authHeaders(),
      })
    ).data,

  download: async ({
    id,
    fallbackFileName = "",
    fileSize = 0,
    mimeType = "",
    onProgress,
  }) => {
    const numericSize = Number(fileSize || 0);
    if (Number.isSafeInteger(numericSize) && numericSize > DOWNLOAD_CHUNK_BYTES) {
      return {
        blob: await downloadInChunks({
          id,
          fileSize: numericSize,
          mimeType,
          onProgress,
        }),
        fileName: fallbackFileName,
      };
    }

    const response = await axios.get(await buildUrl(`/${id}/download`), {
      headers: authHeaders(),
      responseType: "blob",
      onDownloadProgress: (event) => {
        if (typeof onProgress !== "function") return;
        const loaded = Number(event?.loaded || 0);
        const reportedTotal = Number(event?.total || 0);
        const total = reportedTotal > 0 ? reportedTotal : numericSize;
        onProgress(loaded, total > 0 ? total : loaded);
      },
    });

    if (typeof onProgress === "function") {
      const actualSize = Number(response.data?.size || numericSize || 0);
      if (actualSize > 0) onProgress(actualSize, numericSize > 0 ? numericSize : actualSize);
    }

    return {
      blob: response.data,
      fileName:
        parseFilename(response.headers?.["content-disposition"] || "") ||
        fallbackFileName,
    };
  },
};
