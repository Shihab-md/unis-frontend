import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchInspectionReports = async (params = {}) => {
  const res = await axios.get(`${getBaseUrl()}/inspection-report`, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchMyInspectionReports = async () => {
  const res = await axios.get(`${getBaseUrl()}/inspection-report/my`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchInspectionReportById = async (id) => {
  const res = await axios.get(`${getBaseUrl()}/inspection-report/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const addInspectionReport = async (formData) => {
  const res = await axios.post(`${getBaseUrl()}/inspection-report/add`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};