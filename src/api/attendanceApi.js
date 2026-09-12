import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const buildUrl = async (path, params = null) => {
  const base = (await getBaseUrl()).toString();
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      query.set(key, String(value));
    }
  });
  const suffix = query.toString();
  return `${base}attendance/${path}${suffix ? `?${suffix}` : ""}`;
};

export const attendanceGet = async (path, params = {}) =>
  axios.get(await buildUrl(path, params), { headers: authHeaders() });

export const attendancePost = async (path, body = {}) =>
  axios.post(await buildUrl(path), body, { headers: authHeaders() });

export const attendancePatch = async (path, body = {}) =>
  axios.patch(await buildUrl(path), body, { headers: authHeaders() });
