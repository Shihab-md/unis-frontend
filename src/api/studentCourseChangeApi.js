import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";
export async function studentCourseRequest(method, studentId, suffix = "", data, { signal } = {}) {
  const base = await getBaseUrl();
  return axios({ method, url: `${base}student/${studentId}/course-change${suffix}`, data, signal, timeout: 65000,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
}
