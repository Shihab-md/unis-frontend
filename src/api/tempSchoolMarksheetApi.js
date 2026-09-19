import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

export const getTempSchoolMarksheetTemplateInfo = async (options = {}) => {
  const base = await getBaseUrl();
  const timeout = Number(options?.timeout || 60000);

  const response = await axios.get(`${base}temp-school-marksheet/template-info`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    timeout,
  });

  return response.data;
};

export const createTempSchoolMarksheets = async (payload, options = {}) => {
  const base = await getBaseUrl();
  const timeout = Number(options?.timeout || 180000);

  const response = await axios.post(
    `${base}temp-school-marksheet/create`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      timeout,
    }
  );

  return response.data;
};
