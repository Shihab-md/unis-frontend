import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
export async function getDatabaseBackupStatus() {
  const base = await getBaseUrl();
  return (await axios.get(`${base}database-backup/status`, { headers: headers(), timeout: 50000 })).data;
}

export async function createDatabaseBackup(requestId) {
  const base = await getBaseUrl();
  return (await axios.post(`${base}database-backup/now`, { requestId }, { headers: headers(), timeout: 290000 })).data;
}
