import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { FaRegTimesCircle, FaPlay, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

import { createMigrationBatchesFromInvoicesAll } from "../../api/feesApi";
import { getAcademicYearsFromCache } from "../../utils/AcademicYearHelper";
import { showSwalAlert, getPrcessing } from "../../utils/CommonHelper";

export default function MigrationBatchesFromInvoicesAll() {
  const [academicYears, setAcademicYears] = useState([]);
  const [acYear, setAcYear] = useState("");
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState("bank");
  const [referenceNo, setReferenceNo] = useState("MIGRATION");
  const [remarks, setRemarks] = useState("Migration import - already paid before system go-live");

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let alive = true;

    const loadAcademicYears = async () => {
      try {
        const years = await getAcademicYearsFromCache();
        if (!alive) return;

        const list = Array.isArray(years) ? years : years?.academicYears || [];
        setAcademicYears(list);

        const activeYear = list.find((y) => String(y.active) === "Active");
        const sorted = list
          .slice()
          .sort((a, b) =>
            String(b.acYear || b.year || "").localeCompare(String(a.acYear || a.year || ""))
          );

        const fallback = activeYear?._id || sorted?.[0]?._id || "";
        setAcYear((prev) => prev || fallback);
      } catch (e) {
        console.log(e);
        if (!alive) return;
        setAcademicYears([]);
      }
    };

    loadAcademicYears();

    return () => {
      alive = false;
    };
  }, []);

  const selectedAcYearLabel = useMemo(() => {
    const found = academicYears.find((x) => String(x._id) === String(acYear));
    return found?.acYear || "-";
  }, [academicYears, acYear]);

  const handleRunMigration = async () => {
    if (!acYear) {
      showSwalAlert("Info", "Please select academic year", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Create migration batches?",
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.7">
          <div><b>Academic Year:</b> ${selectedAcYearLabel}</div>
          <div><b>Paid Date:</b> ${paidDate || "-"}</div>
          <div><b>Mode:</b> ${mode || "-"}</div>
          <div><b>Reference No:</b> ${referenceNo || "-"}</div>
          <div style="margin-top:10px;color:#b91c1c">
            This will process all eligible due invoices for the selected academic year,
            group them by Niswan, create approved migration batches, and mark them as paid.
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, create",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setProcessing(true);
      setResult(null);

      const resp = await createMigrationBatchesFromInvoicesAll({
        acYear,
        paidDate,
        mode,
        referenceNo,
        remarks,
      });

      if (resp?.success) {
        setResult(resp);
        showSwalAlert(
          "Success!",
          resp?.message || "Migration batches created successfully.",
          "success"
        );
      } else {
        showSwalAlert("Error!", resp?.error || "Migration failed.", "error");
      }
    } catch (error) {
      console.log(error);
      showSwalAlert(
        "Error!",
        error?.response?.data?.error || "Migration failed.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="p-3 sm:p-4">
      <div
        className="mx-auto max-w-6xl mt-3 rounded-lg border border-slate-200 bg-white shadow-lg"
      >
        <div className="flex items-center justify-center rounded-t-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-3 shadow-lg">
          <h1 className="text-base font-semibold text-white">
            Migration Batches From Invoices
          </h1>
          <Link to="/dashboard/accountsPage">
            <FaRegTimesCircle className="ml-4 rounded-full bg-white/90 p-1 text-2xl text-red-600 shadow-md md:ml-7" />
          </Link>
        </div>

        <div className="p-4 space-y-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-amber-700 mb-1">Important</p>
            <p>
              This will fetch all eligible due invoices from the selected academic year,
              group them by Niswan, create one approved migration batch per Niswan,
              and complete the payment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500">
                Academic Year <span className="text-red-700">*</span>
              </label>
              <select
                value={acYear}
                onChange={(e) => setAcYear(e.target.value)}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
              >
                <option value=""></option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.acYear}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500">
                Paid Date <span className="text-red-700">*</span>
              </label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500">
                Mode <span className="text-red-700">*</span>
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500">
                Reference No
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRunMigration}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              <FaPlay />
              Create Migration Batches
            </button>
          </div>

          {result?.summary ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Schools Found
                  </p>
                  <p className="mt-2 text-2xl font-bold text-sky-800">
                    {Number(result.summary.schoolsFound || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Schools Processed
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-800">
                    {Number(result.summary.schoolsProcessed || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Batches Created
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-800">
                    {Number(result.summary.batchesCreated || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    Invoices Applied
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-800">
                    {Number(result.summary.invoicesApplied || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Invoices Skipped
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {Number(result.summary.invoicesSkipped || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Invoices Failed
                  </p>
                  <p className="mt-2 text-2xl font-bold text-rose-800">
                    {Number(result.summary.invoicesFailed || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left">School ID</th>
                      <th className="px-3 py-2 text-left">Batch No</th>
                      <th className="px-3 py-2 text-left">Receipt No</th>
                      <th className="px-3 py-2 text-center">Applied</th>
                      <th className="px-3 py-2 text-center">Failed</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.details || []).map((row, index) => {
                      const ok = Number(row?.failed || 0) === 0 && Number(row?.applied || 0) > 0;

                      return (
                        <tr key={`${row.schoolId || "school"}-${index}`} className="border-t border-slate-200">
                          <td className="px-3 py-2">{row?.schoolId || "-"}</td>
                          <td className="px-3 py-2">{row?.batchNo || "-"}</td>
                          <td className="px-3 py-2">{row?.receiptNumber || "-"}</td>
                          <td className="px-3 py-2 text-center">{row?.applied || 0}</td>
                          <td className="px-3 py-2 text-center">{row?.failed || 0}</td>
                          <td className="px-3 py-2">
                            {ok ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                <FaCheckCircle />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                                <FaExclamationTriangle />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-rose-700">{row?.error || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}