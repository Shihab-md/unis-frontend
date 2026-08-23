import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const buildUrl = async (path = "") => `${(await getBaseUrl()).toString()}helpdesk${path}`;

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  const text = query.toString();
  return text ? `?${text}` : "";
};

export const helpDeskApi = {
  list: async ({ page = 1, limit = 20, status = "", category = "", priority = "", search = "" } = {}) =>
    (
      await axios.get(
        await buildUrl(
          buildQueryString({ page, limit, status, category, priority, search })
        ),
        { headers: headers() }
      )
    ).data,

  unreadCount: async () =>
    (await axios.get(await buildUrl("/unread-count"), { headers: headers() })).data,

  create: async (payload) =>
    (await axios.post(await buildUrl(""), payload, { headers: headers() })).data,

  detail: async (id) =>
    (await axios.get(await buildUrl(`/${id}`), { headers: headers() })).data,

  reply: async (id, payload) =>
    (await axios.post(await buildUrl(`/${id}/reply`), payload, { headers: headers() })).data,

  updateStatus: async (id, status) =>
    (await axios.patch(await buildUrl(`/${id}/status`), { status }, { headers: headers() })).data,
};
