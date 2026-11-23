import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";
const headers = (expectedYear) => ({ Authorization: `Bearer ${localStorage.getItem("token")}`,
  ...(expectedYear ? { "X-Expected-Academic-Year": expectedYear } : {}) });
export async function fetchStudentYearEndReport(filters, { signal } = {}) {
  const base = await getBaseUrl();
  const response = await axios.get(`${base}report/student-year-end`, { params: filters, signal, headers: headers(), timeout: 65000 });
  return response.data.report;
}
export async function fetchStudentYearEndStudents(filters, { signal, expectedYear } = {}) {
  const base = await getBaseUrl();
  const response = await axios.get(`${base}report/student-year-end/students`, { params: filters, signal, headers: headers(expectedYear), timeout: 65000 });
  return response.data;
}
export async function downloadStudentYearEndReport(filters, expectedYear) {
  const base = await getBaseUrl();
  const response = await axios.get(`${base}report/student-year-end/export`, { params: filters,
    headers: headers(expectedYear), responseType: "blob", timeout: 65000 });
  const url = window.URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Student_Year_End_Report.xlsx`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.URL.revokeObjectURL(url);
}
export async function studentYearEndError(error, fallback) {
  let data = error?.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    try { data = JSON.parse(await data.text()); } catch { data = null; }
  }
  return data?.error || fallback;
}
