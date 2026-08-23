import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import CommonHeader from "../dashboard/CommonHeader";
import { useAuth } from "../../context/AuthContext";
import { helpDeskApi } from "../../api/helpDeskApi";
import { LinkIcon } from "../../utils/CommonHelper";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";

const PAGE_SIZE = 20;

const CATEGORY_OPTIONS = [
  "All",
  "General",
  "Student",
  "Employee",
  "Fees / Invoice / Payment",
  "Certificate",
  "Report",
  "Account",
  "Login / Access",
  "Mobile App",
  "Bug / Issue",
  "Suggestion",
  "Other",
];

const NEW_QUERY_CATEGORY_OPTIONS = CATEGORY_OPTIONS.filter((item) => item !== "All");
const PRIORITY_OPTIONS = ["All", "Low", "Normal", "High", "Urgent"];
const NEW_QUERY_PRIORITY_OPTIONS = PRIORITY_OPTIONS.filter((item) => item !== "All");
const STATUS_OPTIONS = ["All", "Open", "In Progress", "Answered", "Closed"];
const STATUS_UPDATE_OPTIONS = STATUS_OPTIONS.filter((item) => item !== "All");

const ROLE_OPTIONS = [
  "All",
  "hquser",
  "supervisor",
  "admin",
  "teacher",
  "usthadh",
  "warden",
  "staff",
  "employee",
  "student",
  "parent",
  "guest",
];

const priorityClassMap = {
  Low: "bg-slate-50 text-slate-600 border-slate-200",
  Normal: "bg-sky-50 text-sky-700 border-sky-200",
  High: "bg-amber-50 text-amber-700 border-amber-200",
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusClassMap = {
  Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Answered: "bg-purple-50 text-purple-700 border-purple-200",
  Closed: "bg-slate-100 text-slate-600 border-slate-300",
};

const formatDateTime = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const getRoleLabel = (role = "") => {
  const value = String(role || "").trim();
  if (!value) return "-";
  if (value === "hquser") return "HQ User";
  if (value === "superadmin") return "Superadmin";
  if (value === "usthadh") return "Usthadh";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getNiswanText = (query) => {
  const code = String(query?.schoolCode || "").trim();
  const name = String(query?.schoolName || "").trim();

  if (!code && !name) return "-";
  return `${code}${code && name ? " : " : ""}${name}`;
};

const normalizeApiError = (error, fallback) =>
  error?.response?.data?.error || error?.response?.data?.message || fallback;

const dispatchHelpDeskRefresh = () => {
  window.dispatchEvent(new Event("unis:helpdesk-count-refresh"));
};

function QueryBadge({ children, className = "" }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold shadow-sm ${className}`}>
      {children}
    </span>
  );
}

function SelectFilter({ label, value, onChange, options, getLabel }) {
  return (
    <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
      >
        {options.map((option) => {
          const optionValue = option === "All" ? "" : option;
          const labelText = typeof getLabel === "function" ? getLabel(option) : option;

          return (
            <option key={option} value={optionValue}>
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function SchoolFilter({ value, onChange, schools }) {
  const safeSchools = Array.isArray(schools) ? schools : [];

  return (
    <label className="grid gap-1 text-[11px] font-semibold text-slate-600 xl:col-span-4">
      <span>Niswan</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
      >
        <option value="">All Niswans</option>
        {safeSchools.map((school) => {
          const id = String(school?._id || "");
          const code = String(school?.code || "").trim();
          const name = String(school?.nameEnglish || "").trim();
          const label = `${code}${code && name ? " : " : ""}${name}`.trim() || "Niswan";

          return (
            <option key={id || label} value={id}>
              {label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function DateFilter({ label, value, onChange }) {
  return (
    <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
      <span>{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
      />
    </label>
  );
}

function ToggleFilter({ checked, onChange, label }) {
  return (
    <label className="flex min-h-[58px] items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
      />
      <span>{label}</span>
    </label>
  );
}

function PaginationBar({ page, total, hasMore, loading, onPrevious, onNext }) {
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  const totalPages = Math.max(1, Math.ceil(Number(total || 0) / PAGE_SIZE));

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-md border border-slate-200 bg-white/80 p-3 text-xs font-semibold text-slate-600 shadow-sm md:flex-row md:items-center md:justify-between">
      <p className="text-center md:text-left">
        Showing <span className="text-teal-700">{start}</span> - <span className="text-teal-700">{end}</span> of {total}
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={onPrevious}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="rounded-md bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
          Page {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={loading || !hasMore}
          onClick={onNext}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function QueryCard({ query, selected, onOpen, isSuperAdmin }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(query?._id)}
      className={`w-full rounded-md border p-3 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${selected
        ? "border-teal-400 bg-teal-50/90"
        : query?.unreadForCurrentUser
          ? "border-amber-300 bg-amber-50/90"
          : "border-slate-200 bg-white/90"
        }`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {query?.unreadForCurrentUser ? (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                New
              </span>
            ) : null}

            <QueryBadge className={priorityClassMap[query?.priority] || priorityClassMap.Normal}>
              {query?.priority || "Normal"}
            </QueryBadge>

            <QueryBadge className={statusClassMap[query?.status] || statusClassMap.Open}>
              {query?.status || "Open"}
            </QueryBadge>

            <QueryBadge className="bg-white text-pink-700 border-pink-200">
              {query?.category || "General"}
            </QueryBadge>
          </div>

          <p className="break-words text-sm font-bold text-slate-800">
            {query?.subject || "-"}
          </p>

          <p className="mt-1 line-clamp-2 break-words text-xs text-slate-600">
            {query?.message || "-"}
          </p>
        </div>

        <div className="shrink-0 text-[11px] font-semibold text-slate-500 md:text-right">
          {isSuperAdmin ? (
            <>
              <p>{query?.createdByName || "-"}</p>
              <p>{getRoleLabel(query?.createdByRole)}</p>
              <p className="max-w-[220px] truncate">{getNiswanText(query)}</p>
            </>
          ) : null}
          <p className="mt-1">Updated: {formatDateTime(query?.lastMessageAt)}</p>
          <p>Replies: {query?.repliesCount || 0}</p>
        </div>
      </div>
    </button>
  );
}

function NewQueryForm({ busy, onCancel, onSubmit }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onSubmit({ subject, category, priority, message });
  };

  return (
    <form onSubmit={submit} className="mb-5 rounded-xl border border-sky-200 bg-white/95 p-4 shadow-xl">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold text-sky-700">New Query</p>
          <p className="text-[11px] text-slate-500">Send your question, issue, or feedback to superadmin.</p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          <span>Subject <span className="text-red-600">*</span></span>
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            maxLength={160}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            placeholder="Example: Certificate not printing"
          />
          <span className="text-[10px] text-slate-400">{subject.length}/160</span>
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            >
              {NEW_QUERY_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            <span>Priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            >
              {NEW_QUERY_PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <label className="mt-4 grid gap-1 text-xs font-semibold text-slate-600">
        <span>Message <span className="text-red-600">*</span></span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={2500}
          rows={5}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
          placeholder="Please explain the issue clearly. Mention student name, Niswan, invoice/certificate/report details if relevant."
        />
        <span className="text-[10px] text-slate-400">{message.length}/2500</span>
      </label>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-sky-700 disabled:opacity-40"
        >
          {busy ? "Submitting..." : "Submit Query"}
        </button>
      </div>
    </form>
  );
}

function QueryDetail({ query, isSuperAdmin, busy, onReply, onStatusChange, onCloseDetail }) {
  const [replyMessage, setReplyMessage] = useState("");
  const [statusValue, setStatusValue] = useState(query?.status || "Open");

  useEffect(() => {
    setReplyMessage("");
    setStatusValue(query?.status || "Open");
  }, [query?._id, query?.status]);

  if (!query) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/80 p-5 text-center text-sm font-semibold text-slate-500 shadow-lg">
        Select a query to read details.
      </div>
    );
  }

  const submitReply = (event) => {
    event.preventDefault();
    onReply(replyMessage, () => setReplyMessage(""));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <QueryBadge className={priorityClassMap[query.priority] || priorityClassMap.Normal}>{query.priority}</QueryBadge>
            <QueryBadge className={statusClassMap[query.status] || statusClassMap.Open}>{query.status}</QueryBadge>
            <QueryBadge className="bg-white text-pink-700 border-pink-200">{query.category}</QueryBadge>
          </div>

          <h3 className="break-words text-base font-bold text-slate-800">{query.subject}</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Created: {formatDateTime(query.createdAt)} • Updated: {formatDateTime(query.lastMessageAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={onCloseDetail}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Close Detail
        </button>
      </div>

      {isSuperAdmin ? (
        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-[11px] font-semibold text-slate-600">
          <p>From: <span className="text-slate-800">{query.createdByName || "-"}</span></p>
          <p>Role: <span className="text-slate-800">{getRoleLabel(query.createdByRole)}</span></p>
          <p>Niswan: <span className="text-slate-800">{getNiswanText(query)}</span></p>
        </div>
      ) : null}

      <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3">
        <p className="mb-1 text-[11px] font-bold text-sky-700">Original Message</p>
        <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{query.message}</p>
      </div>

      <div className="mt-4 space-y-3">
        {(Array.isArray(query.replies) ? query.replies : []).map((reply) => {
          const isAdminReply = String(reply?.repliedByRole || "") === "superadmin";

          return (
            <div
              key={reply?._id || reply?.createdAt}
              className={`rounded-lg border p-3 ${isAdminReply
                ? "border-purple-100 bg-purple-50/70"
                : "border-teal-100 bg-teal-50/70"
                }`}
            >
              <div className="mb-1 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-bold text-slate-700">
                  {reply?.repliedByName || "-"} <span className="text-[10px] text-slate-500">({getRoleLabel(reply?.repliedByRole)})</span>
                </p>
                <p className="text-[10px] font-semibold text-slate-500">{formatDateTime(reply?.createdAt)}</p>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{reply?.message || "-"}</p>
            </div>
          );
        })}
      </div>

      {isSuperAdmin ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white/90 p-3">
          <label className="grid gap-1 text-xs font-semibold text-slate-600 md:max-w-xs">
            <span>Update Status</span>
            <select
              value={statusValue}
              onChange={(event) => setStatusValue(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            >
              {STATUS_UPDATE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={busy || statusValue === query.status}
            onClick={() => onStatusChange(statusValue)}
            className="mt-3 rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-teal-700 disabled:opacity-40"
          >
            Update Status
          </button>
        </div>
      ) : null}

      <form onSubmit={submitReply} className="mt-4 rounded-lg border border-slate-200 bg-white/90 p-3">
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          <span>{isSuperAdmin ? "Reply to User" : "Add Follow-up"}</span>
          <textarea
            value={replyMessage}
            onChange={(event) => setReplyMessage(event.target.value)}
            maxLength={2500}
            rows={4}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            placeholder={isSuperAdmin ? "Type superadmin reply here..." : "Add more details or reply to superadmin..."}
          />
          <span className="text-[10px] text-slate-400">{replyMessage.length}/2500</span>
        </label>

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-pink-700 disabled:opacity-40"
          >
            {busy ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function HelpDeskPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = String(user?.role || "").toLowerCase();
  const isSuperAdmin = userRole === "superadmin";

  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [selectedQueryId, setSelectedQueryId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [showNewForm, setShowNewForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [updatedFrom, setUpdatedFrom] = useState("");
  const [updatedTo, setUpdatedTo] = useState("");
  const [schools, setSchools] = useState([]);

  const title = isSuperAdmin ? "HQ Help Desk - Received Queries" : "HQ Help Desk - My Queries";
  const safeSchools = Array.isArray(schools) ? schools : [];

  const loadQueries = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await helpDeskApi.list({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search: appliedSearch,
        unreadOnly,
        role: isSuperAdmin ? roleFilter : "",
        schoolId: isSuperAdmin ? schoolFilter : "",
        updatedFrom,
        updatedTo,
      });

      setQueries(Array.isArray(data?.queries) ? data.queries : []);
      setTotal(Number(data?.total || 0));
      setHasMore(Boolean(data?.hasMore));
    } catch (error) {
      setMessage(normalizeApiError(error, "Unable to load Help Desk queries."));
    } finally {
      setLoading(false);
    }
  }, [
    page,
    statusFilter,
    categoryFilter,
    priorityFilter,
    appliedSearch,
    unreadOnly,
    isSuperAdmin,
    roleFilter,
    schoolFilter,
    updatedFrom,
    updatedTo,
  ]);

  const openQueryDetail = useCallback(async (id) => {
    if (!id) return;

    setSelectedQueryId(id);
    setDetailLoading(true);
    setMessage("");

    try {
      const data = await helpDeskApi.detail(id);
      setSelectedQuery(data?.query || null);
      dispatchHelpDeskRefresh();
      await loadQueries();
    } catch (error) {
      setMessage(normalizeApiError(error, "Unable to load Help Desk query detail."));
      setSelectedQuery(null);
    } finally {
      setDetailLoading(false);
    }
  }, [loadQueries]);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  useEffect(() => {
    const loadSchools = async () => {
      if (!isSuperAdmin) {
        setSchools([]);
        return;
      }

      try {
        const schoolData = await getSchoolsFromCache();
        setSchools(Array.isArray(schoolData) ? schoolData : []);
      } catch {
        setSchools([]);
      }
    };

    loadSchools();
  }, [isSuperAdmin]);

  useEffect(() => {
    const queryId = new URLSearchParams(location.search).get("queryId");
    if (queryId) {
      openQueryDetail(queryId);
    }
  }, [location.search, openQueryDetail]);

  const resetToFirstPage = useCallback(() => {
    setPage(1);
    setSelectedQuery(null);
    setSelectedQueryId("");
  }, []);

  const handleFilterChange = useCallback((setter) => (value) => {
    setter(value);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const handleSearch = () => {
    setAppliedSearch(searchText.trim());
    resetToFirstPage();
  };

  const clearFilters = () => {
    setSearchText("");
    setAppliedSearch("");
    setStatusFilter("");
    setCategoryFilter("");
    setPriorityFilter("");
    setRoleFilter("");
    setSchoolFilter("");
    setUnreadOnly(false);
    setUpdatedFrom("");
    setUpdatedTo("");
    resetToFirstPage();
  };

  const createQuery = async (payload) => {
    setBusy(true);
    setMessage("");

    try {
      const data = await helpDeskApi.create(payload);
      setShowNewForm(false);
      setPage(1);
      setSelectedQuery(data?.query || null);
      setSelectedQueryId(data?.query?._id || "");
      await loadQueries();
      dispatchHelpDeskRefresh();

      await Swal.fire({
        title: "Submitted",
        text: "Your query has been sent to superadmin.",
        icon: "success",
        confirmButtonText: "OK",
        background: "url(/bg_card.png)",
      });
    } catch (error) {
      setMessage(normalizeApiError(error, "Unable to submit Help Desk query."));
    } finally {
      setBusy(false);
    }
  };

  const replyToQuery = async (replyMessage, onSuccess) => {
    const id = selectedQuery?._id;
    const messageText = String(replyMessage || "").trim();

    if (!id) return;
    if (!messageText) {
      setMessage("Reply message is required.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const data = await helpDeskApi.reply(id, { message: messageText });
      setSelectedQuery(data?.query || null);
      if (typeof onSuccess === "function") onSuccess();
      await loadQueries();
      dispatchHelpDeskRefresh();
      setMessage("Reply sent successfully.");
    } catch (error) {
      setMessage(normalizeApiError(error, "Unable to send Help Desk reply."));
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (status) => {
    const id = selectedQuery?._id;
    if (!id || !status) return;

    setBusy(true);
    setMessage("");

    try {
      const data = await helpDeskApi.updateStatus(id, status);
      setSelectedQuery(data?.query || null);
      await loadQueries();
      dispatchHelpDeskRefresh();
      setMessage("Status updated successfully.");
    } catch (error) {
      setMessage(normalizeApiError(error, "Unable to update Help Desk status."));
    } finally {
      setBusy(false);
    }
  };

  const listTitle = isSuperAdmin ? "Received Queries" : "My Queries";
  const emptyText = isSuperAdmin ? "No received Help Desk queries found." : "No Help Desk queries found.";

  const selectedId = selectedQuery?._id || selectedQueryId;

  const queryList = useMemo(() => (Array.isArray(queries) ? queries : []), [queries]);

  const activeFilterCount = [
    appliedSearch,
    statusFilter,
    categoryFilter,
    priorityFilter,
    isSuperAdmin ? roleFilter : "",
    isSuperAdmin ? schoolFilter : "",
    unreadOnly ? "unread" : "",
    updatedFrom,
    updatedTo,
  ].filter(Boolean).length;

  return (
    <>
      <div className="p-3 lg:p-5 bg-repeat mt-3">
        <div className="text-center">
          <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
            HQ Help Desk - My Queries
          </h3>
        </div>
      </div>
      <div className="mx-2 mb-6 mt-2 rounded-md border border-sky-100 bg-white/70 p-2 shadow-lg md:mx-6 md:p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">{listTitle}</p>
            <p className="text-[11px] font-semibold text-slate-500">
              {isSuperAdmin
                ? "Read, reply, and close queries received from users."
                : "Ask questions, report issues, or follow up with superadmin."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden"
            >
              Back
            </button>
            <div onClick={(event) => { event.preventDefault(); navigate(-1); }}>
              {LinkIcon("#", "Back")}
            </div>

            {!isSuperAdmin ? (
              <div
                className="ml-1"
                onClick={(event) => {
                  event.preventDefault();
                  setShowNewForm(true);
                  setMessage("");
                }}
              >
                {LinkIcon("#", "Add")}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
          <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700">Filters</p>
              <p className="text-[10px] font-semibold text-slate-500">
                Search, unread, status, category, priority, date, role, and Niswan filters are server-side.
              </p>
            </div>

            <p className="text-[11px] font-bold text-teal-700">
              Active Filters: {activeFilterCount}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-8">
            <div className="xl:col-span-2">
              <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
                <span>Search</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleSearch();
                    }}
                    placeholder="Search subject, message, role, Niswan..."
                    className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="rounded-md bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
                  >
                    Search
                  </button>
                </div>
              </label>
            </div>

            <ToggleFilter
              checked={unreadOnly}
              onChange={(checked) => {
                setUnreadOnly(checked);
                resetToFirstPage();
              }}
              label="Unread Only"
            />
            <SelectFilter label="Status" value={statusFilter} onChange={handleFilterChange(setStatusFilter)} options={STATUS_OPTIONS} />
            <SelectFilter label="Category" value={categoryFilter} onChange={handleFilterChange(setCategoryFilter)} options={CATEGORY_OPTIONS} />
            <SelectFilter label="Priority" value={priorityFilter} onChange={handleFilterChange(setPriorityFilter)} options={PRIORITY_OPTIONS} />

            {isSuperAdmin ? (
              <SelectFilter
                label="Role"
                value={roleFilter}
                onChange={handleFilterChange(setRoleFilter)}
                options={ROLE_OPTIONS}
                getLabel={(role) => role === "All" ? "All Roles" : getRoleLabel(role)}
              />
            ) : null}

            {isSuperAdmin ? (
              <SchoolFilter
                value={schoolFilter}
                onChange={handleFilterChange(setSchoolFilter)}
                schools={safeSchools}
              />
            ) : null}

            <DateFilter label="Updated From" value={updatedFrom} onChange={handleFilterChange(setUpdatedFrom)} />
            <DateFilter label="Updated To" value={updatedTo} onChange={handleFilterChange(setUpdatedTo)} />
          </div>

          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-[10px] font-semibold text-slate-500">
              Date filter uses last conversation update date, not only created date.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {!isSuperAdmin && showNewForm ? (
          <NewQueryForm busy={busy} onCancel={() => setShowNewForm(false)} onSubmit={createQuery} />
        ) : null}

        {message ? (
          <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-center text-xs font-semibold text-slate-700 whitespace-pre-line">
            {message}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <div className="space-y-3">
              {loading ? (
                <p className="rounded-xl border border-slate-200 bg-white/90 p-5 text-center text-sm text-slate-500 shadow-lg">
                  Loading Help Desk queries...
                </p>
              ) : null}

              {!loading && queryList.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white/90 p-5 text-center text-sm text-slate-500 shadow-lg">
                  {emptyText}
                </p>
              ) : null}

              {!loading && queryList.map((query) => (
                <QueryCard
                  key={query?._id}
                  query={query}
                  selected={selectedId === query?._id}
                  onOpen={openQueryDetail}
                  isSuperAdmin={isSuperAdmin}
                />
              ))}
            </div>

            <PaginationBar
              page={page}
              total={total}
              hasMore={hasMore}
              loading={loading}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          </div>

          <div className="xl:sticky xl:top-4 xl:self-start">
            {detailLoading ? (
              <div className="rounded-xl border border-slate-200 bg-white/80 p-5 text-center text-sm font-semibold text-slate-500 shadow-lg">
                Loading query details...
              </div>
            ) : (
              <QueryDetail
                query={selectedQuery}
                isSuperAdmin={isSuperAdmin}
                busy={busy}
                onReply={replyToQuery}
                onStatusChange={updateStatus}
                onCloseDetail={() => {
                  setSelectedQuery(null);
                  setSelectedQueryId("");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
