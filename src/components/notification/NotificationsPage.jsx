import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationApi } from "../../api/notificationApi";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import { LinkIcon } from "../../utils/CommonHelper";
import { refreshNotificationBadge } from "./NotificationBell";

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

const RECEIVED_KIND_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "manual", label: "Announcements" },
  { value: "system", label: "System" },
];

const RESOURCE_TYPE_OPTIONS = [
  { value: "all", label: "All Modules" },
  { value: "System", label: "System" },
  { value: "Student", label: "Student" },
  { value: "Employee", label: "Employee" },
  { value: "Certificate", label: "Certificate" },
  { value: "Accounts", label: "Accounts" },
  { value: "Inspection", label: "Inspection" },
  { value: "School", label: "Niswan" },
  { value: "Supervisor", label: "Muavin" },
];

const DELIVERY_STATUS_OPTIONS = [
  { value: "all", label: "All Delivery" },
  { value: "success", label: "Fully Sent" },
  { value: "failed", label: "Has Failed" },
  { value: "partial", label: "Partial" },
  { value: "no-sent", label: "No Sent" },
];

const NOTIFICATION_PAGE_SIZE = 20;

const defaultReceivedFilters = {
  readStatus: "all",
  kind: "all",
  resourceType: "all",
  dateFrom: "",
  dateTo: "",
};

const defaultSentFilters = {
  targetRole: "all",
  schoolId: "all",
  deliveryStatus: "all",
  dateFrom: "",
  dateTo: "",
};

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

const useDebouncedValue = (value, delay = 450) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const countActiveReceivedFilters = (filters, searchText) => {
  return [
    String(searchText || "").trim(),
    filters.readStatus !== "all",
    filters.kind !== "all",
    filters.resourceType !== "all",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;
};

const countActiveSentFilters = (filters, searchText) => {
  return [
    String(searchText || "").trim(),
    filters.targetRole !== "all",
    filters.schoolId !== "all",
    filters.deliveryStatus !== "all",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;
};

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

const selectClass = "mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none";
const inputClass = "mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none";

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRole = String(user?.role || "").toLowerCase();
  const isSuperAdmin = userRole === "superadmin";

  const [items, setItems] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? "sent" : "received");
  const [receivedFilters, setReceivedFilters] = useState(defaultReceivedFilters);
  const [sentFilters, setSentFilters] = useState(defaultSentFilters);
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

  const debouncedSearchText = useDebouncedValue(searchText, 450);
  const safeSchools = Array.isArray(schools) ? schools : [];
  const readCount = Math.max(0, Number(allCount || 0) - Number(unreadCount || 0));

  const activeFilterCount = isSuperAdmin
    ? countActiveSentFilters(sentFilters, debouncedSearchText)
    : countActiveReceivedFilters(receivedFilters, debouncedSearchText);

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
        readStatus: receivedFilters.readStatus,
        kind: receivedFilters.kind,
        resourceType: receivedFilters.resourceType,
        dateFrom: receivedFilters.dateFrom,
        dateTo: receivedFilters.dateTo,
        search: debouncedSearchText.trim(),
      });

      setItems(data?.notifications || []);
      setUnreadCount(Number(data?.unreadCount || 0));
      setAllCount(Number(data?.allCount ?? data?.total ?? 0));
      setReceivedTotal(Number(data?.total || 0));
      refreshNotificationBadge();
    } catch (error) {
      setMessage(
        error?.response?.data?.error || "Unable to load notifications."
      );
    } finally {
      setReceivedLoading(false);
    }
  }, [debouncedSearchText, isSuperAdmin, receivedFilters, receivedPage]);

  const loadSent = useCallback(async (pageToLoad = sentPage) => {
    if (!isSuperAdmin) return;

    setSentLoading(true);

    try {
      const data = await notificationApi.sentList({
        page: pageToLoad,
        limit: NOTIFICATION_PAGE_SIZE,
        search: debouncedSearchText.trim(),
        targetRole: sentFilters.targetRole,
        schoolId: sentFilters.schoolId,
        deliveryStatus: sentFilters.deliveryStatus,
        dateFrom: sentFilters.dateFrom,
        dateTo: sentFilters.dateTo,
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
  }, [debouncedSearchText, isSuperAdmin, sentFilters, sentPage]);

  useEffect(() => {
    setReceivedPage(1);
  }, [debouncedSearchText, receivedFilters]);

  useEffect(() => {
    setSentPage(1);
  }, [debouncedSearchText, sentFilters]);

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

  const openItem = async (item) => {
    if (!item.readAt) {
      await notificationApi.markRead(item._id).catch(() => null);
      refreshNotificationBadge();
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
      refreshNotificationBadge();
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

  const clearFilters = () => {
    setSearchText("");
    setMessage("");

    if (isSuperAdmin) {
      setSentFilters(defaultSentFilters);
      setSentPage(1);
    } else {
      setReceivedFilters(defaultReceivedFilters);
      setReceivedPage(1);
    }
  };

  const updateReceivedFilter = (key, value) => {
    setReceivedFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateSentFilter = (key, value) => {
    setSentFilters((prev) => ({ ...prev, [key]: value }));
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

      await loadSent(1);
    } catch (error) {
      setMessage(
        error?.response?.data?.error || "Unable to send notification."
      );
    } finally {
      setBusy(false);
    }
  };

  const receivedFilterPanel = !isSuperAdmin ? (
    <div className="mb-4 rounded-xl border border-teal-100 bg-white/90 p-3 shadow-lg">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-bold text-teal-700">
          Notification Filters
        </p>

        <button
          type="button"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          className="self-start rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 md:self-auto"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="text-[11px] font-bold text-slate-600">Read Status</label>
          <select
            value={receivedFilters.readStatus}
            onChange={(event) => updateReceivedFilter("readStatus", event.target.value)}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">Source</label>
          <select
            value={receivedFilters.kind}
            onChange={(event) => updateReceivedFilter("kind", event.target.value)}
            className={selectClass}
          >
            {RECEIVED_KIND_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">Module</label>
          <select
            value={receivedFilters.resourceType}
            onChange={(event) => updateReceivedFilter("resourceType", event.target.value)}
            className={selectClass}
          >
            {RESOURCE_TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">From Date</label>
          <input
            type="date"
            value={receivedFilters.dateFrom}
            onChange={(event) => updateReceivedFilter("dateFrom", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">To Date</label>
          <input
            type="date"
            value={receivedFilters.dateTo}
            onChange={(event) => updateReceivedFilter("dateTo", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="rounded-lg bg-teal-50 px-3 py-2 text-[11px] font-semibold text-teal-800">
          <p>Unread: <span className="font-bold">{unreadCount}</span></p>
          <p className="mt-1">Read: <span className="font-bold">{readCount}</span></p>
        </div>
      </div>
    </div>
  ) : null;

  const sentFilterPanel = isSuperAdmin ? (
    <div className="mb-4 rounded-xl border border-pink-100 bg-white/90 p-3 shadow-lg">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-bold text-pink-700">
          Sent Notification Filters
        </p>

        <button
          type="button"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          className="self-start rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 md:self-auto"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="text-[11px] font-bold text-slate-600">Target Role</label>
          <select
            value={sentFilters.targetRole}
            onChange={(event) => updateSentFilter("targetRole", event.target.value)}
            className={selectClass}
          >
            <option value="all">All Roles</option>
            {TARGET_ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">Target Niswan</label>
          <select
            value={sentFilters.schoolId}
            onChange={(event) => updateSentFilter("schoolId", event.target.value)}
            className={selectClass}
          >
            <option value="all">All Niswans / Any Scope</option>
            <option value="ALL">Only All-Niswan Broadcasts</option>
            {safeSchools.map((school) => (
              <option key={school._id} value={school._id}>
                {school.code} : {school.nameEnglish}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">Delivery</label>
          <select
            value={sentFilters.deliveryStatus}
            onChange={(event) => updateSentFilter("deliveryStatus", event.target.value)}
            className={selectClass}
          >
            {DELIVERY_STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">From Date</label>
          <input
            type="date"
            value={sentFilters.dateFrom}
            onChange={(event) => updateSentFilter("dateFrom", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">To Date</label>
          <input
            type="date"
            value={sentFilters.dateTo}
            onChange={(event) => updateSentFilter("dateTo", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="rounded-lg bg-pink-50 px-3 py-2 text-[11px] font-semibold text-pink-800">
          <p>Matched: <span className="font-bold">{sentTotal}</span></p>
          <p className="mt-1">Page Size: <span className="font-bold">{NOTIFICATION_PAGE_SIZE}</span></p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-3">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
          Notifications
        </h3>
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center mt-5 mb-3">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-white/80 border border-slate-200 shadow-lg p-2">
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

        {receivedFilterPanel}
        {sentFilterPanel}

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
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateReceivedFilter("readStatus", "all")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${receivedFilters.readStatus === "all"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border"
                    }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => updateReceivedFilter("readStatus", "unread")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${receivedFilters.readStatus === "unread"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border"
                    }`}
                >
                  Unread
                </button>

                <button
                  type="button"
                  onClick={() => updateReceivedFilter("readStatus", "read")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${receivedFilters.readStatus === "read"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border"
                    }`}
                >
                  Read
                </button>

                <p className="text-xs font-semibold text-slate-700 text-center md:text-left">
                  Unread: <span className="font-bold text-teal-700">{unreadCount}</span>{" "}
                  • Read: <span className="font-bold text-slate-600">{readCount}</span>
                </p>
              </div>

              <button
                disabled={busy || unreadCount === 0}
                onClick={markAll}
                className="self-start text-xs font-bold text-teal-700 disabled:opacity-40 md:self-auto"
              >
                Mark all read
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow-lg">
              {receivedLoading ? (
                <p className="p-5 text-sm text-slate-500">Loading notifications...</p>
              ) : null}

              {!receivedLoading && items.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">No notifications found.</p>
              ) : null}

              {items.map((item) => (
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-sm text-slate-800">
                          {item.title}
                        </p>
                        {!item.readAt ? (
                          <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold text-white">
                            NEW
                          </span>
                        ) : null}
                        {item.type === "manual.broadcast" ? (
                          <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[9px] font-bold text-pink-700">
                            Announcement
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">
                        {item.message}
                      </p>

                      <p className="mt-2 text-[10px] text-slate-400">
                        {item.resourceType || "System"} • {new Date(item.createdAt).toLocaleString()}
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
                label={receivedFilters.readStatus === "unread" ? "unread notifications" : "notifications"}
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

            {!sentLoading && broadcasts.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No sent notification details found.</p>
            ) : null}

            <div className="divide-y divide-slate-100">
              {broadcasts.map((broadcast) => (
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

                    <div className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${Number(broadcast.failedCount || 0) > 0
                      ? "bg-rose-50 text-rose-700"
                      : "bg-emerald-50 text-emerald-700"
                      }`}>
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
