import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}` });
const url = async (path) => `${(await getBaseUrl()).toString()}notifications${path}`;

export const notificationApi = {
  list: async ({ page = 1, limit = 20, unreadOnly = false } = {}) => (await axios.get(await url(`/?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`), { headers: headers() })).data,
  unreadCount: async () => (await axios.get(await url('/unread-count'), { headers: headers() })).data,
  markRead: async (id) => (await axios.patch(await url(`/${id}/read`), {}, { headers: headers() })).data,
  markAllRead: async () => (await axios.patch(await url('/read-all'), {}, { headers: headers() })).data,
  webPublicKey: async () => (await axios.get(await url('/web/public-key'), { headers: headers() })).data,
  webSubscribe: async (subscription) => (await axios.post(await url('/web/subscribe'), { subscription }, { headers: headers() })).data,
  webUnsubscribe: async (endpoint) => (await axios.delete(await url('/web/unsubscribe'), { headers: headers(), data: { endpoint } })).data,
  sendTest: async () => (await axios.post(await url('/test'), {}, { headers: headers() })).data,
};
