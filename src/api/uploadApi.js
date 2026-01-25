import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const uploadProofFile = async (file) => {
  const base = await getBaseUrl();
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post(`${base}upload/proof`, form, {
    ...authHeaders(),
    headers: { ...authHeaders().headers, "Content-Type": "multipart/form-data" },
  });

  return res.data?.url;
};
