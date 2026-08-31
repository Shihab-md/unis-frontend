import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const toQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      qs.set(key, value);
    }
  });
  return qs.toString();
};

export const fetchMarksheetOptions = async () => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/options`, authConfig());
  return res.data;
};

export const fetchMarksheetEntryStudents = async (params) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/entry-students?${toQuery(params)}`, authConfig());
  return res.data;
};

export const saveBulkMarksheet = async (payload) => {
  const base = await getBaseUrl();
  const res = await axios.post(`${base}marksheet/bulk-save`, payload, authConfig());
  return res.data;
};

export const fetchMarksheetExams = async (params = {}) => {
  const base = await getBaseUrl();
  const query = toQuery(params);
  const res = await axios.get(`${base}marksheet/${query ? `?${query}` : ""}`, authConfig());
  return res.data;
};

export const fetchMarksheetExam = async (id) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/${id}`, authConfig());
  return res.data;
};

export const fetchConsolidatedStudents = async (params = {}) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/consolidated-students?${toQuery(params)}`, authConfig());
  return res.data;
};

export const fetchConsolidatedMarksheet = async (params = {}) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/consolidated?${toQuery(params)}`, authConfig());
  return res.data;
};

export const printMarksheetExamPdf = async (id) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/print/${id}`, authConfig());
  return res.data;
};

export const printConsolidatedMarksheetPdf = async (params = {}) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/print-consolidated?${toQuery(params)}`, authConfig());
  return res.data;
};

export const requestOfficialMarksheetPdf = async (id) => {
  const base = await getBaseUrl();
  const res = await axios.post(`${base}marksheet/${id}/pdf-request`, {}, authConfig());
  return res.data;
};

export const fetchOfficialMarksheetPdfFiles = async (id) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/${id}/pdf-files`, authConfig());
  return res.data;
};

export const downloadOfficialCombinedMarksheetPdf = async (id) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/${id}/pdf-combined`, { ...authConfig(), responseType: "blob" });
  return res;
};

export const downloadOfficialStudentMarksheetPdf = async (id, recordId) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}marksheet/${id}/pdf-student/${recordId}`, { ...authConfig(), responseType: "blob" });
  return res;
};
