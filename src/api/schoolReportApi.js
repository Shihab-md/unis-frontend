import axios from 'axios';
import { getBaseUrl } from '../utils/CommonHelper';
export async function fetchSchoolListReport(filters, { signal } = {}) {
  const base = await getBaseUrl();
  const response = await axios.get(`${base}school/list-report`, { params: filters, signal, timeout: 65000,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  return response.data.report;
}
