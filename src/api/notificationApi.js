import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const url = async (path) => `${(await getBaseUrl()).toString()}notifications${path}`;

const cleanParams = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  return query.toString();
};

export const notificationApi = {
  list: async ({
    page = 1,
    limit = 20,
    unreadOnly = false,
    readStatus = "all",
    kind = "all",
    resourceType = "all",
    dateFrom = "",
    dateTo = "",
    search = "",
  } = {}) => {
    const query = cleanParams({
      page,
      limit,
      unreadOnly,
      readStatus,
      kind,
      resourceType,
      dateFrom,
      dateTo,
      search,
    });

    return (await axios.get(await url(`/?${query}`), { headers: headers() })).data;
  },

  unreadCount: async () =>
    (await axios.get(await url("/unread-count"), { headers: headers() })).data,

  markRead: async (id) =>
    (await axios.patch(await url(`/${id}/read`), {}, { headers: headers() })).data,

  markAllRead: async () =>
    (await axios.patch(await url("/read-all"), {}, { headers: headers() })).data,

  sendMessage: async (payload) =>
    (await axios.post(await url("/send"), payload, { headers: headers() })).data,

  sentList: async ({
    page = 1,
    limit = 20,
    search = "",
    targetRole = "all",
    schoolId = "all",
    deliveryStatus = "all",
    dateFrom = "",
    dateTo = "",
  } = {}) => {
    const query = cleanParams({
      page,
      limit,
      search,
      targetRole,
      schoolId,
      deliveryStatus,
      dateFrom,
      dateTo,
    });

    return (await axios.get(await url(`/sent?${query}`), { headers: headers() })).data;
  },

  // Kept for mobile/browser push registration compatibility.
  webPublicKey: async () =>
    (await axios.get(await url("/web/public-key"), { headers: headers() })).data,

  webSubscribe: async (subscription) =>
    (
      await axios.post(
        await url("/web/subscribe"),
        { subscription },
        { headers: headers() }
      )
    ).data,

  webUnsubscribe: async (endpoint) =>
    (
      await axios.delete(await url("/web/unsubscribe"), {
        headers: headers(),
        data: { endpoint },
      })
    ).data,
};
