import React from "react";
import { AutoText, useLanguage } from "../../i18n/LanguageContext";
import { getBusinessTodayKey } from "../../utils/dateRules";

export const AttendancePanel = ({ title, subtitle = "", children, className = "" }) => {
  const { direction, fontFamily } = useLanguage();
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md md:p-5 ${className}`}
      dir={direction}
      style={{ fontFamily }}
    >
      <div className="mb-3">
        <AutoText as="h3" text={title} className="text-base font-semibold text-slate-800 md:text-lg" />
        {subtitle ? <AutoText text={subtitle} className="mt-0.5 text-xs text-slate-500 md:text-sm" /> : null}
      </div>
      {children}
    </section>
  );
};

export const StatCard = ({ label, value = 0, note = "" }) => {
  const { tr } = useLanguage();
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="text-[11px] font-medium text-slate-500 md:text-xs">{tr(label)}</div>
      <div className="mt-1 text-xl font-bold text-blue-700 md:text-2xl">{value ?? 0}</div>
      {note ? <div className="mt-0.5 text-[10px] text-slate-400">{tr(note)}</div> : null}
    </div>
  );
};

export const PrimaryButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
  >
    {children}
  </button>
);

export const DangerButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
  >
    {children}
  </button>
);

export const FieldLabel = ({ children }) => (
  <label className="mb-1 block text-[11px] font-semibold text-slate-600 md:text-xs">{children}</label>
);

export const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 md:text-sm ${className}`}
  />
);

export const SelectInput = ({ className = "", children, ...props }) => (
  <select
    {...props}
    className={`w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 md:text-sm ${className}`}
  >
    {children}
  </select>
);

export const TextArea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={`w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 md:text-sm ${className}`}
  />
);

export const StatusBadge = ({ status = "" }) => {
  const { tr } = useLanguage();
  const classes = {
    Present: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Absent: "border-rose-200 bg-rose-50 text-rose-700",
    Leave: "border-violet-200 bg-violet-50 text-violet-700",
    Late: "border-amber-200 bg-amber-50 text-amber-700",
    "Half Day": "border-orange-200 bg-orange-50 text-orange-700",
    Holiday: "border-sky-200 bg-sky-50 text-sky-700",
    "Weekly Off": "border-slate-200 bg-slate-50 text-slate-700",
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-rose-200 bg-rose-50 text-rose-700",
    Cancelled: "border-slate-200 bg-slate-50 text-slate-600",
    Draft: "border-slate-200 bg-slate-50 text-slate-700",
    Reviewed: "border-sky-200 bg-sky-50 text-sky-700",
    Finalized: "border-violet-200 bg-violet-50 text-violet-700",
    Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold md:text-xs ${classes[status] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
      {tr(status || "-")}
    </span>
  );
};

export const LoadingBlock = ({ text = "Loading..." }) => {
  const { tr } = useLanguage();
  return <div className="py-8 text-center text-sm font-medium text-slate-500">{tr(text)}</div>;
};

export const EmptyBlock = ({ text = "No records found" }) => {
  const { tr } = useLanguage();
  return <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-500">{tr(text)}</div>;
};

export const formatAmount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const todayKey = () => getBusinessTodayKey();

export const currentMonthKey = () => todayKey().slice(0, 7);

export const getApiError = (error) =>
  error?.response?.data?.error || error?.message || "Request failed";
