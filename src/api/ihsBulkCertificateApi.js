import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

export const createBulkIhsCertificates = async (payload) => {
  const base = await getBaseUrl();

  const res = await axios.post(
    `${base}certificate-bulk-ihs/create`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};