import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";

export default function ReportsFiltersDrawer({ meta, value, onApply, loading }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const schools = useMemo(() => (Array.isArray(meta?.schools) ? meta.schools : []), [meta]);
  const courses = useMemo(() => (Array.isArray(meta?.courses) ? meta.courses : []), [meta]);
  const years = useMemo(() => (Array.isArray(meta?.years) ? meta.years : []), [meta]);
  const statuses = useMemo(() => (Array.isArray(meta?.statuses) ? meta.statuses : []), [meta]);

  const openDrawer = () => {
    setDraft(value);
    setOpen(true);
  };

  const apply = () => {
    onApply?.(draft);
    setOpen(false);
  };

  const reset = () => {
    const d = { schoolId: "", courseId: "", acYear: "", status: "", months: 12 };
    setDraft(d);
    onApply?.(d);
    setOpen(false);
  };

  return (
    <>
      <button
        className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm"
        onClick={openDrawer}
        disabled={loading}
      >
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4 overflow-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
                <p className="text-sm text-slate-500">School / Course / Year / Status</p>
              </div>
              <button
                className="px-2 py-1 rounded border hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="School">
                <select
                  className="w-full border rounded p-2"
                  value={draft.schoolId}
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

              <Field label="Course">
                <select
                  className="w-full border rounded p-2"
                  value={draft.courseId}
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
                  className="w-full border rounded p-2"
                  value={draft.acYear}
                  onChange={(e) => setDraft((d) => ({ ...d, acYear: e.target.value }))}
                >
                  <option value="">All</option>
                  {years.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.acYear}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  className="w-full border rounded p-2"
                  value={draft.status}
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

              <Field label="Months (Trends)">
                <select
                  className="w-full border rounded p-2"
                  value={draft.months}
                  onChange={(e) => setDraft((d) => ({ ...d, months: Number(e.target.value) }))}
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                className="flex-1 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={apply}
              >
                Apply
              </button>
              <button
                className="flex-1 px-3 py-2 rounded border hover:bg-slate-50"
                onClick={reset}
              >
                Reset
              </button>
            </div>

            <div className="mt-3">
              <button
                className="w-full px-3 py-2 rounded border hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
