import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationApi } from "../../api/notificationApi";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import { LinkIcon } from "../../utils/CommonHelper";

const safePath = (path) =>
  typeof path === "string" &&
    path.startsWith("/dashboard") &&
    !path.startsWith("//")
    ? path
    : "/dashboard/notifications";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const TARGET_ROLE_OPTIONS = [
  { value: "superadmin", label: "Superadmin" },
  { value: "hquser", label: "HQ User" },
  { value: "supervisor", label: "Muavin" },
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "usthadh", label: "Usthadh" },
  { value: "warden", label: "Warden" },
  { value: "staff", label: "Staff" },
  { value: "employee", label: "Employee" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
];

const getRoleLabel = (role) => {
  return TARGET_ROLE_OPTIONS.find((item) => item.value === role)?.label || role;
};

const getBroadcastNiswanText = (broadcast) => {
  if (broadcast?.selectAllSchools) return "All Niswans";

  const niswans = Array.isArray(broadcast?.targetNiswans)
    ? broadcast.targetNiswans
    : [];

  if (niswans.length === 0) return "-";

  return niswans
    .map((school) => {
      const code = school?.code || "";
      const name = school?.nameEnglish || "";
      return `${code}${code && name ? " : " : ""}${name}`.trim();
    })
    .filter(Boolean)
    .join(", ");
};

const NOTIFICATION_PAGE_SIZE = 20;

const PaginationFooter = ({
  page,
  total,
  limit = NOTIFICATION_PAGE_SIZE,
  loading = false,
  onPageChange,
  label = "records",
}) => {
  const safeTotal = Math.max(0, Number(total || 0));
  const safeLimit = Math.max(1, Number(limit || NOTIFICATION_PAGE_SIZE));
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
  const currentPage = Math.min(Math.max(Number(page || 1), 1), totalPages);
  const start = safeTotal === 0 ? 0 : (currentPage - 1) * safeLimit + 1;
  const end = Math.min(currentPage * safeLimit, safeTotal);

  if (safeTotal <= safeLimit) {
    return safeTotal > 0 ? (
      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-center text-[11px] font-semibold text-slate-500 md:flex-row md:items-center md:justify-between md:text-left">
        <span>Showing {start}-{end} of {safeTotal} {label}</span>
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-center text-[11px] font-semibold text-slate-600 md:flex-row md:items-center md:justify-between md:text-left">
      <span>
        Showing {start}-{end} of {safeTotal} {label}
      </span>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={loading || currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="rounded-md bg-white px-3 py-1 text-[11px] font-bold text-pink-700 shadow-sm">
          Page {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={loading || currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRole = String(user?.role || "").toLowerCase();
  const isSuperAdmin = userRole === "superadmin";

  const [items, setItems] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? "sent" : "received");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [receivedLoading, setReceivedLoading] = useState(true);
  const [sentLoading, setSentLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [sentPage, setSentPage] = useState(1);
  const [sentTotal, setSentTotal] = useState(0);

  const [showSendForm, setShowSendForm] = useState(false);
  const [schools, setSchools] = useState([]);
  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [targetRoles, setTargetRoles] = useState([]);
  const [selectAllSchools, setSelectAllSchools] = useState(true);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);

  const safeSchools = Array.isArray(schools) ? schools : [];
  const readCount = Math.max(0, Number(allCount || 0) - Number(unreadCount || 0));

  const loadReceived = useCallback(async (pageToLoad = receivedPage) => {
    if (isSuperAdmin) {
      setItems([]);
      setUnreadCount(0);
      setAllCount(0);
      setReceivedTotal(0);
      setReceivedLoading(false);
      return;
    }

    setReceivedLoading(true);

    try {
      const data = await notificationApi.list({
        page: pageToLoad,
        limit: NOTIFICATION_PAGE_SIZE,
        unreadOnly,
      });

      setItems(data?.notifications || []);
      setUnreadCount(Number(data?.unreadCount || 0));
      setAllCount(Number(data?.allCount ?? data?.total ?? 0));
      setReceivedTotal(Number(data?.total || 0));
    } catch (error) {
      setMessage(
        error?.response?.data?.error || "Unable to load notifications."
      );
    } finally {
      setReceivedLoading(false);
    }
  }, [isSuperAdmin, receivedPage, unreadOnly]);

  const loadSent = useCallback(async (pageToLoad = sentPage) => {
    if (!isSuperAdmin) return;

    setSentLoading(true);

    try {
      const data = await notificationApi.sentList({
        page: pageToLoad,
        limit: NOTIFICATION_PAGE_SIZE,
      });

      setBroadcasts(data?.broadcasts || []);
      setSentTotal(Number(data?.total || 0));
    } catch (error) {
      setMessage(
        error?.response?.data?.error ||
        "Unable to load sent notification history."
      );
    } finally {
      setSentLoading(false);
    }
  }, [isSuperAdmin, sentPage]);

  useEffect(() => {
    loadReceived();
  }, [loadReceived]);

  useEffect(() => {
    if (isSuperAdmin) {
      setActiveTab("sent");
      loadSent();
    } else {
      setActiveTab("received");
    }
  }, [isSuperAdmin, loadSent]);

  useEffect(() => {
    const loadSchools = async () => {
      if (!isSuperAdmin) return;

      try {
        const schoolData = await getSchoolsFromCache();
        setSchools(Array.isArray(schoolData) ? schoolData : []);
      } catch {
        setSchools([]);
      }
    };

    loadSchools();
  }, [isSuperAdmin]);

  const selectedRoleCount = targetRoles.length;

  const selectedSchoolCount = selectAllSchools
    ? safeSchools.length
    : selectedSchoolIds.length;

  const selectedRoleLabels = useMemo(() => {
    return targetRoles.map((role) => getRoleLabel(role)).join(", ");
  }, [targetRoles]);

  const filteredItems = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      return [item?.title, item?.message, item?.type, item?.resourceType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [items, searchText]);

  const filteredBroadcasts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return broadcasts;

    return broadcasts.filter((broadcast) => {
      return [
        broadcast?.title,
        broadcast?.message,
        Array.isArray(broadcast?.targetRoles)
          ? broadcast.targetRoles.map((role) => getRoleLabel(role)).join(" ")
          : "",
        getBroadcastNiswanText(broadcast),
        broadcast?.createdByName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [broadcasts, searchText]);

  const openItem = async (item) => {
    if (!item.readAt) {
      await notificationApi.markRead(item._id).catch(() => null);
      await loadReceived(receivedPage);
    }

    navigate(safePath(item.webPath));
  };

  const markAll = async () => {
    if (isSuperAdmin) return;

    setBusy(true);
    setMessage("");

    try {
      await notificationApi.markAllRead();
      setReceivedPage(1);
      await loadReceived(1);
    } catch (error) {
      setMessage(
        error?.response?.data?.error ||
        "Unable to mark notifications as read."
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleRole = (role) => {
    setTargetRoles((prev) =>
      prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role]
    );
  };

  const selectAllRoles = () => {
    setTargetRoles(TARGET_ROLE_OPTIONS.map((role) => role.value));
  };

  const clearRoles = () => {
    setTargetRoles([]);
  };

  const clearSendForm = () => {
    setSendTitle("");
    setSendMessage("");
    setTargetRoles([]);
    setSelectAllSchools(true);
    setSelectedSchoolIds([]);
  };

  const handleSchoolSelection = (event) => {
    const values = Array.from(event.target.selectedOptions || []).map(
      (option) => option.value
    );

    setSelectedSchoolIds(values);
  };

  const handleSendNotification = async (event) => {
    event.preventDefault();

    if (!isSuperAdmin || busy) return;

    const title = sendTitle.trim();
    const body = sendMessage.trim();

    if (!title) {
      setMessage("Notification title is required.");
      return;
    }

    if (!body) {
      setMessage("Notification message is required.");
      return;
    }

    if (targetRoles.length === 0) {
      setMessage("Please select at least one target role.");
      return;
    }

    if (!selectAllSchools && selectedSchoolIds.length === 0) {
      setMessage(
        "Please select at least one Niswan or choose Select All Niswans."
      );
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Send Notification?",
      html: `
        <div style="text-align:left; font-size:13px; line-height:1.7;">
          <b>Title:</b> ${escapeHtml(title)}<br/>
          <b>Target Roles:</b> ${escapeHtml(selectedRoleLabels || "-")}<br/>
          <b>Niswan Scope:</b> ${selectAllSchools
          ? "All Niswans"
          : `${selectedSchoolCount} selected Niswan(s)`
        }<br/><br/>
          <span style="color:#b91c1c; font-weight:600;">
            Are you sure you want to send this notification?
          </span>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Send",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
      background: "url(/bg_card.png)",
    });

    if (!confirmResult.isConfirmed) return;

    setBusy(true);
    setMessage("");

    try {
      const result = await notificationApi.sendMessage({
        title,
        message: body,
        targetRoles,
        selectAllSchools,
        schoolIds: selectAllSchools ? [] : selectedSchoolIds,
      });

      setMessage(
        `Notification sent successfully. Sent: ${result?.sentCount || 0
        }, Failed: ${result?.failedCount || 0}.`
      );

      clearSendForm();
      setShowSendForm(false);
      setActiveTab("sent");
      setSentPage(1);

      await Promise.all([loadReceived(1), loadSent(1)]);
    } catch (error) {
      setMessage(
        error?.response?.data?.error || "Unable to send notification."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-3">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
          Notifications
        </h3>
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center mt-5 mb-3">
          <div className="flex items-center justify-center gap-3 rounded-lg bg-white/80 border border-slate-200 shadow-lg p-2">
            <div className="mr-1">
              {LinkIcon("/dashboard", "Back")}
            </div>

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={isSuperAdmin ? "Search sent notifications..." : "Search notifications..."}
              className="w-[190px] md:w-[320px] rounded-md border border-gray-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-teal-500"
            />

            {isSuperAdmin ? (
              <div
                className="ml-1"
                onClick={(event) => {
                  event.preventDefault();
                  setShowSendForm(true);
                  setActiveTab("sent");
                  setMessage("");
                }}
              >
                {LinkIcon("#", "Add")}
              </div>
            ) : null}
          </div>
        </div>

        {message ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm whitespace-pre-line text-center md:text-left">
            {message}
          </div>
        ) : null}

        {isSuperAdmin && showSendForm ? (
          <form
            onSubmit={handleSendNotification}
            className="mb-5 rounded-xl border border-pink-200 bg-white/95 p-4 shadow-lg"
          >
            <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold text-pink-700">Send Notification</p>
                <p className="text-[11px] text-slate-500">
                  Select target roles and Niswan scope. Users will receive it in notification bell and list page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSendForm(false)}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={sendTitle}
                  onChange={(event) => setSendTitle(event.target.value)}
                  maxLength={140}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  placeholder="Example: Important announcement"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {sendTitle.length}/140
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Target Roles <span className="text-red-600">*</span>
                </label>

                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllRoles}
                    className="rounded-md border border-teal-500 px-2 py-1 text-[11px] font-semibold text-teal-700"
                  >
                    Select All Roles
                  </button>

                  <button
                    type="button"
                    onClick={clearRoles}
                    className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TARGET_ROLE_OPTIONS.map((role) => (
                    <label
                      key={role.value}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={targetRoles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
                      />
                      {role.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={sendMessage}
                  onChange={(event) => setSendMessage(event.target.value)}
                  maxLength={500}
                  rows={5}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 focus:border-teal-500 focus:outline-none"
                  placeholder="Type notification message here..."
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {sendMessage.length}/500
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    Target Niswans <span className="text-red-600">*</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                    <input
                      type="checkbox"
                      checked={selectAllSchools}
                      onChange={(event) => {
                        setSelectAllSchools(event.target.checked);
                        if (event.target.checked) setSelectedSchoolIds([]);
                      }}
                    />
                    Select All Niswans
                  </label>
                </div>

                <select
                  multiple
                  disabled={selectAllSchools}
                  value={selectedSchoolIds}
                  onChange={handleSchoolSelection}
                  className="h-44 w-full rounded-md border border-slate-300 px-3 py-2 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {safeSchools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.code} : {school.nameEnglish}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-[10px] text-slate-400">
                  Hold Ctrl key to select multiple Niswans. If Select All is checked, selected roles will be targeted across all Niswans.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Selected Roles:</span>{" "}
                {selectedRoleLabels || "-"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-700">Niswan Scope:</span>{" "}
                {selectAllSchools
                  ? "All Niswans"
                  : `${selectedSchoolCount} selected Niswan(s)`}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                disabled={busy}
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-pink-700 disabled:opacity-40"
              >
                {busy ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        ) : null}

        {!isSuperAdmin && activeTab === "received" ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReceivedPage(1);
                    setUnreadOnly(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${!unreadOnly
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border"
                    }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReceivedPage(1);
                    setUnreadOnly(true);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${unreadOnly
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border"
                    }`}
                >
                  Unread
                </button>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs font-semibold text-slate-700 text-center md:text-left">
                    Unread: <span className="font-bold text-teal-700">{unreadCount}</span>{" "}
                    • Read: <span className="font-bold text-slate-600">{readCount}</span>
                  </p>

                </div>

              </div>

              <button
                disabled={busy || unreadCount === 0}
                onClick={markAll}
                className="text-xs font-bold text-teal-700 disabled:opacity-40"
              >
                Mark all read
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow-lg">
              {receivedLoading ? (
                <p className="p-5 text-sm text-slate-500">Loading notifications...</p>
              ) : null}

              {!receivedLoading && filteredItems.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">No notifications found.</p>
              ) : null}

              {filteredItems.map((item) => (
                <button
                  key={item._id}
                  onClick={() => openItem(item)}
                  className={`w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${item.readAt ? "bg-white" : "bg-teal-50/60"
                    }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.readAt ? "bg-slate-300" : "bg-teal-600"
                        }`}
                    />

                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800">
                        {item.title}
                      </p>

                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">
                        {item.message}
                      </p>

                      <p className="mt-2 text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              <PaginationFooter
                page={receivedPage}
                total={receivedTotal}
                limit={NOTIFICATION_PAGE_SIZE}
                loading={receivedLoading}
                label={unreadOnly ? "unread notifications" : "notifications"}
                onPageChange={setReceivedPage}
              />
            </div>
          </>
        ) : null}

        {isSuperAdmin ? (
          <div className="rounded-xl border border-slate-200 bg-white/90 shadow-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 text-sm font-bold text-pink-700">
              Sent Notification Details
            </div>

            {sentLoading ? (
              <p className="p-5 text-sm text-slate-500">Loading sent details...</p>
            ) : null}

            {!sentLoading && filteredBroadcasts.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No sent notification details found.</p>
            ) : null}

            <div className="divide-y divide-slate-100">
              {filteredBroadcasts.map((broadcast) => (
                <div key={broadcast._id} className="p-4 hover:bg-sky-50/50">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 break-words">
                        {broadcast.title}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600 break-words">
                        {broadcast.message}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      Sent: {broadcast.sentCount || 0} / Target: {broadcast.targetUserCount || 0}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 text-[11px] text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-700">Roles:</span>{" "}
                      {Array.isArray(broadcast.targetRoles) && broadcast.targetRoles.length > 0
                        ? broadcast.targetRoles.map((role) => getRoleLabel(role)).join(", ")
                        : "-"}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">Niswans:</span>{" "}
                      {getBroadcastNiswanText(broadcast)}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">Failed:</span>{" "}
                      {broadcast.failedCount || 0}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">Sent By:</span>{" "}
                      {broadcast.createdByName || "-"} • {new Date(broadcast.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <PaginationFooter
              page={sentPage}
              total={sentTotal}
              limit={NOTIFICATION_PAGE_SIZE}
              loading={sentLoading}
              label="sent notifications"
              onPageChange={setSentPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}