import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";
export async function taRequest(method, path = "", data, options = {}) {
  const base = await getBaseUrl();
  return axios({ method, url: `${base}travel-claims${path}`, data,
    timeout: 65000, ...options,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, ...(options.headers || {}) },
  });
}
