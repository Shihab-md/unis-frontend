import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getDriveAuthUrl = async () => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}integrations/google-drive/auth-url`, authHeaders());
  return res.data;
};

export const getDriveStatus = async () => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}integrations/google-drive/status`, authHeaders());
  return res.data;
};

export const disconnectDrive = async () => {
  const base = await getBaseUrl();
  const res = await axios.delete(`${base}integrations/google-drive/disconnect`, authHeaders());
  return res.data;
};

export const uploadPaymentProofToDrive = async (file) => {
  const base = await getBaseUrl();
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post(`${base}integrations/google-drive/upload-proof`, form, {
    headers: {
      ...authHeaders().headers,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // {success,fileId,viewUrl,downloadUrl,fileName}
};