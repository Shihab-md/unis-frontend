import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchInspectionReports = async (params = {}) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}inspection-report`, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchMyInspectionReports = async () => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}inspection-report/my`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchInspectionReportById = async (id) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}inspection-report/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const addInspectionReport = async (formData) => {
  const base = (await getBaseUrl()).toString();
  const res = await axios.post(`${base}inspection-report/add`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};