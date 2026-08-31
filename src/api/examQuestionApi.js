import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const toQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") qs.set(key, value);
  });
  return qs.toString();
};

const endpoint = async (path = "") => `${(await getBaseUrl()).toString()}exam-questions${path}`;

export const fetchExamQuestionOptions = async () => {
  const response = await axios.get(await endpoint("/options"), { headers: authHeaders() });
  return response.data;
};

export const fetchExamQuestions = async (params = {}) => {
  const query = toQuery(params);
  const response = await axios.get(`${await endpoint("/")}${query ? `?${query}` : ""}`, { headers: authHeaders() });
  return response.data;
};

export const createExamQuestion = async (formData) => {
  const response = await axios.post(await endpoint("/"), formData, {
    headers: authHeaders(),
  });
  return response.data;
};

export const updateExamQuestion = async (id, formData) => {
  const response = await axios.put(await endpoint(`/${id}`), formData, {
    headers: authHeaders(),
  });
  return response.data;
};

export const deleteExamQuestion = async (id) => {
  const response = await axios.delete(await endpoint(`/${id}`), { headers: authHeaders() });
  return response.data;
};

export const fetchExamQuestionDownloads = async (id) => {
  const response = await axios.get(await endpoint(`/${id}/downloads`), { headers: authHeaders() });
  return response.data;
};

const extractBlobError = async (error, fallback) => {
  try {
    if (error?.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const json = JSON.parse(text);
      return json?.error || fallback;
    }
  } catch {
    // Ignore malformed blob error payload.
  }
  return error?.response?.data?.error || error?.message || fallback;
};

export const fetchExamQuestionFile = async (id, mode = "download") => {
  try {
    const response = await axios.get(await endpoint(`/${id}/file?mode=${mode === "inline" ? "inline" : "download"}`), {
      headers: authHeaders(),
      responseType: "blob",
    });
    return response;
  } catch (error) {
    const message = await extractBlobError(error, "Unable to load Question Paper PDF.");
    const wrapped = new Error(message);
    wrapped.response = error?.response;
    throw wrapped;
  }
};
