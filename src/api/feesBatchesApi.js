import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchSentBatches = async ({ schoolId, acYear, status = "ALL" }) => {
  const base = await getBaseUrl();
  const url = new URL(`fees/batches/sent/${schoolId}/${acYear}/${status}`, base).toString();

  const res = await axios.get(url, { headers: authHeaders() });
  return res.data;
};
