import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const getDefaultDraft = () => ({
  schoolId: "",
  schoolCode: "",
  q: "",
  courseId: "",
  acYear: "",
  status: "",
  feesStatus: "",
  hostel: "",
  months: 12,
});

export default function ReportsFiltersDrawer({ meta, value, onApply, loading }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ ...getDefaultDraft(), ...(value || {}) });
  const [mounted, setMounted] = useState(false);

  const schools = useMemo(() => (Array.isArray(meta?.schools) ? meta.schools : []), [meta]);
  const courses = useMemo(() => (Array.isArray(meta?.courses) ? meta.courses : []), [meta]);
  const academicYears = useMemo(
    () =>
      Array.isArray(meta?.academicYears)
        ? meta.academicYears
        : Array.isArray(meta?.years)
          ? meta.years
          : [],
    [meta]
  );
  const statuses = useMemo(() => (Array.isArray(meta?.statuses) ? meta.statuses : []), [meta]);
  const feeStatuses = useMemo(() => (Array.isArray(meta?.feeStatuses) ? meta.feeStatuses : []), [meta]);
  const hostels = useMemo(() => (Array.isArray(meta?.hostels) ? meta.hostels : []), [meta]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const openDrawer = () => {
    setDraft({ ...getDefaultDraft(), ...(value || {}) });
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
  };

  const apply = () => {
    onApply?.({ ...getDefaultDraft(), ...draft });
    setOpen(false);
  };

  const reset = () => {
    const cleared = getDefaultDraft();
    setDraft(cleared);
    onApply?.(cleared);
    setOpen(false);
  };

  const drawerContent =
    mounted && open
      ? createPortal(
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={closeDrawer}
            />

            <div
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 text-white px-4 py-4 shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Report Filters</h3>
                    <p className="text-sm text-white/80">
                      Narrow by Niswan, course, year, status, fees and hostel.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-white/30 hover:bg-white/10"
                    onClick={closeDrawer}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <Field label="Niswan search">
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5"
                    placeholder="Code or Niswan name"
                    value={draft.q || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Niswan">
                    <select
                      className="w-full border rounded-lg p-2.5"
                      value={draft.schoolId || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, schoolId: e.target.value }))}
                    >
                      <option value="">All</option>
                      {schools.map((s) => (
                        <option key={s._id} value={s._id}>
                          {(s.code ? s.code + " - " : "") + (s.nameEnglish || "")}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Niswan code">
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5"
                      placeholder="Exact code"
                      value={draft.schoolCode || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, schoolCode: e.target.value }))}
                    />
                  </Field>
                </div>

                <Field label="Course">
                  <select
                    className="w-full border rounded-lg p-2.5"
                    value={draft.courseId || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, courseId: e.target.value }))}
                  >
                    <option value="">All</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Academic Year">
                  <select
                    className="w-full border rounded-lg p-2.5"
                    value={draft.acYear || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, acYear: e.target.value }))}
                  >
                    <option value="">All</option>
                    {academicYears.map((y) => (
                      <option key={y._id} value={y._id}>
                        {y.acYear}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Status">
                    <select
                      className="w-full border rounded-lg p-2.5"
                      value={draft.status || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                    >
                      <option value="">All</option>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Fees Status">
                    <select
                      className="w-full border rounded-lg p-2.5"
                      value={draft.feesStatus || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, feesStatus: e.target.value }))}
                    >
                      <option value="">All</option>
                      {feeStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Hostel">
                    <select
                      className="w-full border rounded-lg p-2.5"
                      value={draft.hostel || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, hostel: e.target.value }))}
                    >
                      <option value="">All</option>
                      {hostels.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Months (Trends)">
                    <select
                      className="w-full border rounded-lg p-2.5"
                      value={draft.months || 12}
                      onChange={(e) => setDraft((d) => ({ ...d, months: Number(e.target.value) }))}
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={18}>18</option>
                      <option value={24}>24</option>
                    </select>
                  </Field>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  Filters affect KPI cards, trends and Niswan report together.
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow"
                  onClick={apply}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 py-2 rounded-lg border hover:bg-slate-50"
                  onClick={reset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="px-3 py-2 rounded-lg border border-sky-200 text-slate-700 bg-white/90 hover:bg-sky-50 text-sm font-medium shadow-sm"
        onClick={openDrawer}
        disabled={loading}
      >
        Filters
      </button>

      {drawerContent}
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}