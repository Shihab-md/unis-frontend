import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationApi } from "../../api/notificationApi";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import { LinkIcon } from "../../utils/CommonHelper";
import { refreshNotificationBadge } from "./NotificationBell";
import { useLanguage } from "../../i18n/LanguageContext";

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

const getRoleLabel = (role, tr = (value) => value) => {
  const label = TARGET_ROLE_OPTIONS.find((item) => item.value === role)?.label || role;
  return tr(label);
};

const getBroadcastNiswanText = (broadcast, tr = (value) => value) => {
  if (broadcast?.selectAllSchools) return tr("All Niswans");

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
  const { tr } = useLanguage();
  const safeTotal = Math.max(0, Number(total || 0));
  const safeLimit = Math.max(1, Number(limit || NOTIFICATION_PAGE_SIZE));
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
  const currentPage = Math.min(Math.max(Number(page || 1), 1), totalPages);
  const start = safeTotal === 0 ? 0 : (currentPage - 1) * safeLimit + 1;
  const end = Math.min(currentPage * safeLimit, safeTotal);

  if (safeTotal <= safeLimit) {
    return safeTotal > 0 ? (
      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-center text-[11px] font-semibold text-slate-500 md:flex-row md:items-center md:justify-between md:text-left">
        <span>{tr("Showing")} {start}-{end} {tr("of")} {safeTotal} {tr(label)}</span>
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-center text-[11px] font-semibold text-slate-600 md:flex-row md:items-center md:justify-between md:text-left">
      <span>
        {tr("Showing")} {start}-{end} {tr("of")} {safeTotal} {tr(label)}
      </span>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={loading || currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tr("Previous")}
        </button>

        <span className="rounded-md bg-white px-3 py-1 text-[11px] font-bold text-pink-700 shadow-sm">
          {tr("Page")} {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={loading || currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tr("Next")}
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
  const { tr, direction, fontFamily } = useLanguage();

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
        error?.response?.data?.error || tr("Unable to load notifications.")
      );
    } finally {
      setReceivedLoading(false);
    }
  }, [debouncedSearchText, isSuperAdmin, receivedFilters, receivedPage, tr]);

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
        tr("Unable to load sent notification history.")
      );
    } finally {
      setSentLoading(false);
    }
  }, [debouncedSearchText, isSuperAdmin, sentFilters, sentPage, tr]);

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
    return targetRoles.map((role) => getRoleLabel(role, tr)).join(", ");
  }, [targetRoles, tr]);

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
        tr("Unable to mark notifications as read.")
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
      setMessage(tr("Notification title is required."));
      return;
    }

    if (!body) {
      setMessage(tr("Notification message is required."));
      return;
    }

    if (targetRoles.length === 0) {
      setMessage(tr("Please select at least one target role."));
      return;
    }

    if (!selectAllSchools && selectedSchoolIds.length === 0) {
      setMessage(
        tr("Please select at least one Niswan or choose Select All Niswans.")
      );
      return;
    }

    const confirmResult = await Swal.fire({
      title: tr("Send Notification?"),
      html: `
        <div dir="${direction}" style="text-align:${direction === "rtl" ? "right" : "left"}; font-size:13px; line-height:1.7; font-family:${escapeHtml(fontFamily)};">
          <b>${escapeHtml(tr("Title"))}:</b> ${escapeHtml(title)}<br/>
          <b>${escapeHtml(tr("Target Roles"))}:</b> ${escapeHtml(selectedRoleLabels || "-")}<br/>
          <b>${escapeHtml(tr("Niswan Scope"))}:</b> ${selectAllSchools
          ? tr("All Niswans")
          : tr("{{count}} selected Niswan(s)", { count: selectedSchoolCount })
        }<br/><br/>
          <span style="color:#b91c1c; font-weight:600;">
            ${escapeHtml(tr("Are you sure you want to send this notification?"))}
          </span>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: tr("Yes, Send"),
      cancelButtonText: tr("Cancel"),
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
        tr("Notification sent successfully. Sent: {{sent}}, Failed: {{failed}}.", {
          sent: result?.sentCount || 0,
          failed: result?.failedCount || 0,
        })
      );

      clearSendForm();
      setShowSendForm(false);
      setActiveTab("sent");
      setSentPage(1);

      await loadSent(1);
    } catch (error) {
      setMessage(
        error?.response?.data?.error || tr("Unable to send notification.")
      );
    } finally {
      setBusy(false);
    }
  };

  const receivedFilterPanel = !isSuperAdmin ? (
    <div className="mb-4 rounded-xl border border-teal-100 bg-white/90 p-3 shadow-lg">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-bold text-teal-700">
          {tr("Notification Filters")}
        </p>

        <button
          type="button"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          className="self-start rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 md:self-auto"
        >
          {tr("Clear Filters")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("Read Status")}</label>
          <select
            value={receivedFilters.readStatus}
            onChange={(event) => updateReceivedFilter("readStatus", event.target.value)}
            className={selectClass}
          >
            <option value="all">{tr("All")}</option>
            <option value="unread">{tr("Unread Only")}</option>
            <option value="read">{tr("Read Only")}</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("Source")}</label>
          <select
            value={receivedFilters.kind}
            onChange={(event) => updateReceivedFilter("kind", event.target.value)}
            className={selectClass}
          >
            {RECEIVED_KIND_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{tr(item.label)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("Module")}</label>
          <select
            value={receivedFilters.resourceType}
            onChange={(event) => updateReceivedFilter("resourceType", event.target.value)}
            className={selectClass}
          >
            {RESOURCE_TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{tr(item.label)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("From Date")}</label>
          <input
            type="date"
            value={receivedFilters.dateFrom}
            onChange={(event) => updateReceivedFilter("dateFrom", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("To Date")}</label>
          <input
            type="date"
            value={receivedFilters.dateTo}
            onChange={(event) => updateReceivedFilter("dateTo", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="rounded-lg bg-teal-50 px-3 py-2 text-[11px] font-semibold text-teal-800">
          <p>{tr("Unread")}: <span className="font-bold">{unreadCount}</span></p>
          <p className="mt-1">{tr("Read")}: <span className="font-bold">{readCount}</span></p>
        </div>
      </div>
    </div>
  ) : null;

  const sentFilterPanel = isSuperAdmin ? (
    <div className="mb-4 rounded-xl border border-pink-100 bg-white/90 p-3 shadow-lg">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-bold text-pink-700">
          {tr("Sent Notification Filters")}
        </p>

        <button
          type="button"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          className="self-start rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 md:self-auto"
        >
          {tr("Clear Filters")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("Target Role")}</label>
          <select
            value={sentFilters.targetRole}
            onChange={(event) => updateSentFilter("targetRole", event.target.value)}
            className={selectClass}
          >
            <option value="all">{tr("All Roles")}</option>
            {TARGET_ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>{tr(role.label)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("Target Niswan")}</label>
          <select
            value={sentFilters.schoolId}
            onChange={(event) => updateSentFilter("schoolId", event.target.value)}
            className={selectClass}
          >
            <option value="all">{tr("All Niswans / Any Scope")}</option>
            <option value="ALL">{tr("Only All-Niswan Broadcasts")}</option>
            {safeSchools.map((school) => (
              <option key={school._id} value={school._id}>
                {school.code} : {school.nameEnglish}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("Delivery")}</label>
          <select
            value={sentFilters.deliveryStatus}
            onChange={(event) => updateSentFilter("deliveryStatus", event.target.value)}
            className={selectClass}
          >
            {DELIVERY_STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{tr(item.label)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("From Date")}</label>
          <input
            type="date"
            value={sentFilters.dateFrom}
            onChange={(event) => updateSentFilter("dateFrom", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600">{tr("To Date")}</label>
          <input
            type="date"
            value={sentFilters.dateTo}
            onChange={(event) => updateSentFilter("dateTo", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="rounded-lg bg-pink-50 px-3 py-2 text-[11px] font-semibold text-pink-800">
          <p>{tr("Matched")}: <span className="font-bold">{sentTotal}</span></p>
          <p className="mt-1">{tr("Page Size")}: <span className="font-bold">{NOTIFICATION_PAGE_SIZE}</span></p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-3" dir={direction} style={{ fontFamily }}>
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
          {tr("Notifications")}
        </h3>
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center mt-5 mb-3">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-white/80 border border-slate-200 shadow-lg p-2">
            <div className="mr-1">
              {LinkIcon("/dashboard", tr("Back"))}
            </div>

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={isSuperAdmin ? tr("Search sent notifications...") : tr("Search notifications...")}
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
                {LinkIcon("#", tr("Add"))}
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
                <p className="font-bold text-pink-700">{tr("Send Notification")}</p>
                <p className="text-[11px] text-slate-500">
                  {tr("Select target roles and Niswan scope. Users will receive it in notification bell and list page.")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSendForm(false)}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {tr("Close")}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  {tr("Title")} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={sendTitle}
                  onChange={(event) => setSendTitle(event.target.value)}
                  maxLength={140}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  placeholder={tr("Example: Important announcement")}
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {sendTitle.length}/140
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  {tr("Target Roles")} <span className="text-red-600">*</span>
                </label>

                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllRoles}
                    className="rounded-md border border-teal-500 px-2 py-1 text-[11px] font-semibold text-teal-700"
                  >
                    {tr("Select All Roles")}
                  </button>

                  <button
                    type="button"
                    onClick={clearRoles}
                    className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    {tr("Clear")}
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
                      {tr(role.label)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600">
                  {tr("Message")} <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={sendMessage}
                  onChange={(event) => setSendMessage(event.target.value)}
                  maxLength={500}
                  rows={5}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 focus:border-teal-500 focus:outline-none"
                  placeholder={tr("Type notification message here...")}
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {sendMessage.length}/500
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    {tr("Target Niswans")} <span className="text-red-600">*</span>
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
                    {tr("Select All Niswans")}
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
                  {tr("Hold Ctrl key to select multiple Niswans. If Select All is checked, selected roles will be targeted across all Niswans.")}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">{tr("Selected Roles")}:</span>{" "}
                {selectedRoleLabels || "-"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-700">{tr("Niswan Scope")}:</span>{" "}
                {selectAllSchools
                  ? tr("All Niswans")
                  : tr("{{count}} selected Niswan(s)", { count: selectedSchoolCount })}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                disabled={busy}
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-pink-700 disabled:opacity-40"
              >
                {busy ? tr("Sending...") : tr("Send Notification")}
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
                  {tr("All")}
                </button>

                <button
                  type="button"
                  onClick={() => updateReceivedFilter("readStatus", "unread")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${receivedFilters.readStatus === "unread"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border"
                    }`}
                >
                  {tr("Unread")}
                </button>

                <button
                  type="button"
                  onClick={() => updateReceivedFilter("readStatus", "read")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${receivedFilters.readStatus === "read"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border"
                    }`}
                >
                  {tr("Read")}
                </button>

                <p className="text-xs font-semibold text-slate-700 text-center md:text-left">
                  {tr("Unread")}: <span className="font-bold text-teal-700">{unreadCount}</span>{" "}
                  • {tr("Read")}: <span className="font-bold text-slate-600">{readCount}</span>
                </p>
              </div>

              <button
                disabled={busy || unreadCount === 0}
                onClick={markAll}
                className="self-start text-xs font-bold text-teal-700 disabled:opacity-40 md:self-auto"
              >
                {tr("Mark all read")}
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow-lg">
              {receivedLoading ? (
                <p className="p-5 text-sm text-slate-500">{tr("Loading notifications...")}</p>
              ) : null}

              {!receivedLoading && items.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">{tr("No notifications found.")}</p>
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
                        <p dir="auto" className="font-bold text-sm text-slate-800">
                          {item.title}
                        </p>
                        {!item.readAt ? (
                          <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold text-white">
                            {tr("NEW")}
                          </span>
                        ) : null}
                        {item.type === "manual.broadcast" ? (
                          <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[9px] font-bold text-pink-700">
                            {tr("Announcement")}
                          </span>
                        ) : null}
                      </div>

                      <p dir="auto" className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">
                        {item.message}
                      </p>

                      <p className="mt-2 text-[10px] text-slate-400">
                        {tr(item.resourceType || "System")} • {new Date(item.createdAt).toLocaleString()}
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
                label={receivedFilters.readStatus === "unread" ? tr("unread notifications") : tr("notifications")}
                onPageChange={setReceivedPage}
              />
            </div>
          </>
        ) : null}

        {isSuperAdmin ? (
          <div className="rounded-xl border border-slate-200 bg-white/90 shadow-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 text-sm font-bold text-pink-700">
              {tr("Sent Notification Details")}
            </div>

            {sentLoading ? (
              <p className="p-5 text-sm text-slate-500">{tr("Loading sent details...")}</p>
            ) : null}

            {!sentLoading && broadcasts.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">{tr("No sent notification details found.")}</p>
            ) : null}

            <div className="divide-y divide-slate-100">
              {broadcasts.map((broadcast) => (
                <div key={broadcast._id} className="p-4 hover:bg-sky-50/50">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p dir="auto" className="text-sm font-bold text-slate-800 break-words">
                        {broadcast.title}
                      </p>
                      <p dir="auto" className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600 break-words">
                        {broadcast.message}
                      </p>
                    </div>

                    <div className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${Number(broadcast.failedCount || 0) > 0
                      ? "bg-rose-50 text-rose-700"
                      : "bg-emerald-50 text-emerald-700"
                      }`}>
                      {tr("Sent")}: {broadcast.sentCount || 0} / {tr("Target")}: {broadcast.targetUserCount || 0}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 text-[11px] text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-700">{tr("Roles")}:</span>{" "}
                      {Array.isArray(broadcast.targetRoles) && broadcast.targetRoles.length > 0
                        ? broadcast.targetRoles.map((role) => getRoleLabel(role, tr)).join(", ")
                        : "-"}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">{tr("Niswans")}:</span>{" "}
                      {getBroadcastNiswanText(broadcast, tr)}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">{tr("Failed")}:</span>{" "}
                      {broadcast.failedCount || 0}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">{tr("Sent By")}:</span>{" "}
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
              label={tr("sent notifications")}
              onPageChange={setSentPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
