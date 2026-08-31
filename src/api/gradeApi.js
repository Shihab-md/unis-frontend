import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const baseUrl = async () => `${(await getBaseUrl()).toString()}grade`;

export const fetchGrades = async () => {
  const response = await axios.get(await baseUrl(), authConfig());
  return response.data;
};

export const fetchGrade = async (id) => {
  const response = await axios.get(`${await baseUrl()}/${id}`, authConfig());
  return response.data;
};

export const createGrade = async (payload) => {
  const response = await axios.post(`${await baseUrl()}/add`, payload, authConfig());
  return response.data;
};

export const updateGrade = async (id, payload) => {
  const response = await axios.put(`${await baseUrl()}/${id}`, payload, authConfig());
  return response.data;
};

export const deleteGrade = async (id) => {
  const response = await axios.delete(`${await baseUrl()}/${id}`, authConfig());
  return response.data;
};
