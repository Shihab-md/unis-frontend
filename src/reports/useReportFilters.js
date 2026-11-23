import { useCallback, useState } from "react";

// Reports have their own per-user, per-report applied filters. Student-list
// localStorage keys and their configured academic-year default are untouched.
export const DEFAULT_REPORT_FILTERS = Object.freeze({ schoolId: "", schoolCode: "", q: "", courseId: "", acYear: "", year: "", status: "", feesStatus: "", hostel: "", months: 12 });
export const DEFAULT_EMPLOYEE_FILTERS = Object.freeze({ schoolId: "", search: "", status: "" });
export const DEFAULT_SUPERVISOR_FILTERS = Object.freeze({ search: "", status: "", jobType: "" });
const clean = (value, defaults) => Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => {
  const saved = value?.[key];
  return [key, key === "months" ? ([6, 12, 18, 24].includes(Number(saved)) ? Number(saved) : fallback) : typeof saved === "string" ? saved : fallback];
}));
export default function useReportFilters(user, report, defaults = DEFAULT_REPORT_FILTERS) {
  const userId = String(user?._id || user?.id || "");
  const storageKey = userId ? `unis:report-filters:v1:${userId}:${user?.role || ""}:${report}` : "";
  const [filters, setFilters] = useState(() => {
    try { return clean(storageKey ? JSON.parse(sessionStorage.getItem(storageKey)) : null, defaults); }
    catch { return { ...defaults }; }
  });
  const apply = useCallback((next) => {
    const value = clean(next, defaults);
    setFilters(value);
    try { if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* Storage may be disabled. */ }
  }, [storageKey, defaults]);
  const reset = useCallback(() => apply(defaults), [apply, defaults]);
  return [filters, apply, reset];
}
