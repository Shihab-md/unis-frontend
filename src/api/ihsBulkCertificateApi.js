import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

export const createBulkIhsCertificates = async (payload, options = {}) => {
  const base = await getBaseUrl();
  const timeout = Number(options?.timeout || 180000);

  const res = await axios.post(
    `${base}certificate-bulk-ihs/create`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      timeout,
    }
  );

  return res.data;
};