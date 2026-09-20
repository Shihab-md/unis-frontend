import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const buildUrl = async (path = "") => `${(await getBaseUrl()).toString()}demo-tutorial${path}`;

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

  create: async (formData, onUploadProgress) =>
    (
      await axios.post(await buildUrl("/"), formData, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      })
    ).data,

  update: async (id, formData, onUploadProgress) =>
    (
      await axios.put(await buildUrl(`/${id}`), formData, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      })
    ).data,

  remove: async (id) =>
    (
      await axios.delete(await buildUrl(`/${id}`), {
        headers: authHeaders(),
      })
    ).data,

  download: async (id, fallbackFileName = "") => {
    const response = await axios.get(await buildUrl(`/${id}/download`), {
      headers: authHeaders(),
      responseType: "blob",
    });

    return {
      blob: response.data,
      fileName: parseFilename(response.headers?.["content-disposition"] || "") || fallbackFileName,
    };
  },
};
