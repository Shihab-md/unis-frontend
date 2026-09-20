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

const uploadDirectlyToGoogleDrive = ({
  sessionUrl,
  file,
  mimeType,
  onUploadProgress,
}) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sessionUrl, true);
    xhr.setRequestHeader("Content-Type", mimeType || file?.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (typeof onUploadProgress === "function") {
        onUploadProgress({ loaded: event.loaded, total: event.total || file?.size || 0 });
      }
    };

    xhr.onerror = () => reject(new Error("Unable to upload Demo - Tutorial file."));
    xhr.onabort = () => reject(new Error("Unable to upload Demo - Tutorial file."));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error("Unable to upload Demo - Tutorial file."));
        return;
      }

      try {
        const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        resolve(data);
      } catch {
        reject(new Error("Unable to upload Demo - Tutorial file."));
      }
    };

    xhr.send(file);
  });

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

  uploadDirectlyToGoogleDrive,

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
    });

    return {
      blob: response.data,
      fileName:
        parseFilename(response.headers?.["content-disposition"] || "") ||
        fallbackFileName,
    };
  },
};
