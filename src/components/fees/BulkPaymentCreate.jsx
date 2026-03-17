import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchDueInvoices, createPaymentBatch } from "../../api/feesApi.js";
import { uploadPaymentProofToDrive } from "../../api/integrationsApi.js";
import { showSwalAlert, LinkIcon, getPrcessing, getFormattedDate } from "../../utils/CommonHelper";

export default function BulkPaymentCreate() {
  const schoolId = localStorage.getItem("schoolId");
  const acYear = "680485d9361ed06368c57f7c"; //2024-2025 //localStorage.getItem("acYearId");
  // acYear will be replaced in controller.

  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState({});
  const [mode, setMode] = useState("bank");
  const [referenceNo, setReferenceNo] = useState("");

  // legacy (kept)
  const [proofUrl, setProofUrl] = useState("");

  // ✅ NEW: drive proof object
  const [proofDrive, setProofDrive] = useState(null); // { fileId, fileName, viewUrl, downloadUrl }

  const [processing, setProcessing] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // ✅ Filter popup
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // ✅ Filters
  const [filterInvoiceNo, setFilterInvoiceNo] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [filterStudentName, setFilterStudentName] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterFeesType, setFilterFeesType] = useState("");
  const [filterRollNumber, setFilterRollNumber] = useState("");

  // ✅ Select-all checkbox ref (for indeterminate UI)
  const selectAllRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        setProcessing(true);
        const data = await fetchDueInvoices({ schoolId, acYear });
        if (!alive) return;
        setInvoices(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setInvoices([]);
        showSwalAlert("Error!", "Failed to load invoices", "error");
      }
      setProcessing(false);
    };

    if (schoolId && acYear) run();
    return () => (alive = false);
  }, [schoolId, acYear]);

  // ✅ Filtered invoices
  const filteredInvoices = useMemo(() => {
    const invoiceNo = filterInvoiceNo.trim().toLowerCase();
    const academicYear = filterAcademicYear.trim().toLowerCase();
    const studentName = filterStudentName.trim().toLowerCase();
    const course = filterCourse.trim().toLowerCase();
    const feesType = filterFeesType.trim().toLowerCase();
    const rollNumber = filterRollNumber.trim().toLowerCase();

    return (invoices || []).filter((inv) => {
      const rowInvoiceNo = String(inv.invoiceNo || "").toLowerCase();
      const rowAcademicYear = String(inv.acYear?.acYear || inv.acYearLabel || inv.acYear || "").toLowerCase();
      const rowStudentName = String(inv.userId?.name || inv.studentId?.userId?.name || "").toLowerCase();
      const rowCourse = String(inv.courseId?.name || "").toLowerCase();
      const rowFeesType = String(inv.source || "").toLowerCase();
      const rowRollNumber = String(inv.studentId?.rollNumber || "").toLowerCase();

      return (
        (!invoiceNo || rowInvoiceNo.includes(invoiceNo)) &&
        (!academicYear || rowAcademicYear.includes(academicYear)) &&
        (!studentName || rowStudentName.includes(studentName)) &&
        (!course || rowCourse.includes(course)) &&
        (!feesType || rowFeesType.includes(feesType)) &&
        (!rollNumber || rowRollNumber.includes(rollNumber))
      );
    });
  }, [
    invoices,
    filterInvoiceNo,
    filterAcademicYear,
    filterStudentName,
    filterCourse,
    filterFeesType,
    filterRollNumber,
  ]);

  const total = useMemo(
    () => Object.values(selected).reduce((s, v) => s + Number(v || 0), 0),
    [selected]
  );

  // ✅ Total invoice count (only those displayed)
  const invoiceCount = filteredInvoices.length;

  // ✅ Selected count only for currently displayed invoices
  const selectedCount = useMemo(() => {
    if (!invoiceCount) return 0;
    const selectedIds = new Set(Object.keys(selected));
    return filteredInvoices.reduce(
      (cnt, inv) => (selectedIds.has(String(inv._id)) ? cnt + 1 : cnt),
      0
    );
  }, [filteredInvoices, selected, invoiceCount]);

  const hasActiveFilters = useMemo(() => {
    return [
      filterInvoiceNo,
      filterAcademicYear,
      filterStudentName,
      filterCourse,
      filterFeesType,
      filterRollNumber,
    ].some((v) => String(v || "").trim() !== "");
  }, [
    filterInvoiceNo,
    filterAcademicYear,
    filterStudentName,
    filterCourse,
    filterFeesType,
    filterRollNumber,
  ]);

  // ✅ Select-all states
  const allChecked = invoiceCount > 0 && selectedCount === invoiceCount;
  const noneChecked = selectedCount === 0;
  const isIndeterminate = invoiceCount > 0 && !allChecked && !noneChecked;

  // ✅ Apply indeterminate state to DOM checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const toggle = (inv) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[inv._id] !== undefined) delete copy[inv._id];
      else copy[inv._id] = Number(inv.balance || 0);
      return copy;
    });
  };

  // ✅ Select All toggle (only visible filtered invoices)
  const toggleSelectAll = () => {
    if (!filteredInvoices.length) return;

    setSelected((prev) => {
      if (allChecked) {
        const next = { ...prev };
        for (const inv of filteredInvoices) {
          delete next[String(inv._id)];
        }
        return next;
      }

      const next = { ...prev };
      for (const inv of filteredInvoices) {
        next[String(inv._id)] = Number(inv.balance || 0);
      }
      return next;
    });
  };

  const changeAmount = (id, val, maxBalance) => {
    const n = Number(val);
    setSelected((prev) => ({
      ...prev,
      [id]: !Number.isFinite(n) ? 0 : Math.max(0, Math.min(n, Number(maxBalance || 0))),
    }));
  };

  const proofAttached = !!(proofDrive?.viewUrl || proofUrl);

  const clearFilters = () => {
    setFilterInvoiceNo("");
    setFilterAcademicYear("");
    setFilterStudentName("");
    setFilterCourse("");
    setFilterFeesType("");
    setFilterRollNumber("");
  };

  const submit = async () => {
    const items = Object.keys(selected)
      .map((invoiceId) => {
        const inv = invoices.find((x) => String(x._id) === String(invoiceId));
        return {
          invoiceId,
          studentId: inv?.studentId,
          amount: Number(selected[invoiceId]),
        };
      })
      .filter((x) => x.studentId && x.amount > 0);

    if (items.length === 0) {
      showSwalAlert("Info", "Select at least one invoice with amount", "info");
      return;
    }

    // ✅ Proof required validation
    if (!proofAttached) {
      showSwalAlert("Info", "Please attach proof (image/pdf) before submit", "info");
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        schoolId,
        acYear,
        mode,
        referenceNo,
        proofUrl, // legacy

        // ✅ NEW: send drive proof fields
        proofDriveFileId: proofDrive?.fileId || "",
        proofDriveViewUrl: proofDrive?.viewUrl || "",
        proofDriveDownloadUrl: proofDrive?.downloadUrl || "",
        proofFileName: proofDrive?.fileName || "",

        items,
      };

      const resp = await createPaymentBatch(payload);
      if (!resp?.success) showSwalAlert("Error!", resp?.error || "Failed", "error");
      else {
        setProcessing(false);
        showSwalAlert("Success!", `Batch created: ${resp.batchNo}`, "success");
        setSelected({});
        window.location.reload();
      }
    } catch {
      setProcessing(false);
      showSwalAlert("Error!", "Failed to create batch", "error");
    }
  };

  //if (processing) return getPrcessing();

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div>{LinkIcon("/dashboard/accountsPage", "Back")}</div>
        <h3 className="pl-2 text-lg font-semibold text-left">Bulk Fee Payment (Send to HQ)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-4">
        {/* Mode card */}
        <div className="col-span-4 relative overflow-hidden rounded-md border border-white/80 bg-gradient-to-br from-indigo-500 to-sky-500 p-4 text-white shadow-lg hover:shadow-2xl transition hover:-translate-y-0.5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl" />
          <label className="block text-[11px] font-semibold text-white/90 mb-2">
            Payment Mode
          </label>
          <select
            className="w-full rounded border border-white/60 bg-white p-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-white/50"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option className="text-slate-900" value="bank">Bank</option>
            <option className="text-slate-900" value="cash">Cash</option>
            <option className="text-slate-900" value="upi">UPI</option>
          </select>
        </div>

        {/* Reference card */}
        <div className="col-span-4 relative overflow-hidden rounded-md border border-white/80 bg-gradient-to-br from-violet-500 to-fuchsia-500 p-4 text-white shadow-lg hover:shadow-2xl transition hover:-translate-y-0.5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-18 md:h-28 w-28 rounded-full bg-white/25 blur-2xl" />
          <label className="block text-[11px] font-semibold text-white/90 mb-2">
            Reference / Details
          </label>

          <input
            className="w-full rounded border border-white/60 bg-white p-2 text-sm text-slate-900 shadow-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Bank ref / UPI txn / notes"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
          />
        </div>

        {/* Proof upload card */}
        <div className="col-span-4 relative overflow-hidden rounded-md border border-white/80 bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-lg hover:shadow-2xl transition hover:-translate-y-0.5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl" />

          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-semibold text-white/90">
              Attach Proof <span className="text-yellow-200 font-bold">*</span>
            </label>

            <div className="text-[11px] text-white/85">
              (Allowed: jpg/png/pdf • Max: 2MB)
            </div>
          </div>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            disabled={uploadingProof}
            className="block w-full text-xs text-white file:mr-3 file:rounded file:border-0 file:bg-white/25 file:px-3 file:py-2 file:text-white file:font-bold hover:file:bg-white/35 disabled:opacity-60"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;

              const ok = ["image/jpeg", "image/png", "application/pdf"].includes(f.type);
              if (!ok) {
                showSwalAlert("Error!", "Only jpg/png/pdf allowed", "error");
                return;
              }
              if (f.size > 2 * 1024 * 1024) {
                showSwalAlert("Error!", "Max file size is 2MB", "error");
                return;
              }

              try {
                setUploadingProof(true);

                const up = await uploadPaymentProofToDrive(f);
                if (!up?.success) {
                  showSwalAlert("Error!", up?.error || "Proof upload failed", "error");
                  return;
                }

                setProofDrive({
                  fileId: up.fileId,
                  fileName: up.fileName,
                  viewUrl: up.viewUrl,
                  downloadUrl: up.downloadUrl,
                });

                setProofUrl("");
                showSwalAlert("Uploaded", "Proof uploaded to Google Drive", "success");
              } catch (err) {
                console.log(err);
                showSwalAlert("Error!", err?.message || "Proof upload failed", "error");
              } finally {
                setUploadingProof(false);
                e.target.value = "";
              }
            }}
          />

          {uploadingProof ? (
            <div className="text-xs mt-2 font-bold text-white/90">Uploading…</div>
          ) : proofDrive?.viewUrl ? (
            <div className="text-xs mt-2">
              <span className="font-bold text-white/90">Proof:</span>{" "}
              <a className="underline font-bold" href={proofDrive.viewUrl} target="_blank" rel="noreferrer">
                View
              </a>
              {proofDrive?.fileName ? (
                <span className="text-[11px] text-white/80"> ({proofDrive.fileName})</span>
              ) : null}
            </div>
          ) : proofUrl ? (
            <div className="text-xs mt-2 font-bold text-white/90">Proof: {proofUrl}</div>
          ) : (
            <div className="text-xs mt-2 font-bold text-yellow-100">Proof not attached</div>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-semibold">
          Total: ₹ {Number(total || 0).toLocaleString("en-IN")}
          <span className="ml-5 text-xs font-normal text-gray-500">
            (Selected {selectedCount}/{invoiceCount})
          </span>
          <span className="ml-3 text-xs font-normal text-gray-500">
            Showing {filteredInvoices.length}/{invoices.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters ? (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
              Filters Applied
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => setShowFilterPopup(true)}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-slate-50 hover:-translate-y-0.5"
            title="Open Filters"
          >
            Filter
          </button>
        </div>
      </div>

      {!processing ?
        <div className="border rounded">
          {/* ✅ Mobile Select-All Bar */}
          <div className="md:hidden p-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b">
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleSelectAll}
                  disabled={!filteredInvoices.length}
                  title="Select all"
                  className="h-4 w-4"
                />
                Select All
              </label>

              <div className="text-[11px] text-slate-600">
                Selected{" "}
                <span className="font-bold text-slate-900">
                  {selectedCount}/{invoiceCount}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <div className="text-slate-600">
                {isIndeterminate ? (
                  <span className="font-semibold text-amber-700">Partial selection</span>
                ) : allChecked ? (
                  <span className="font-semibold text-emerald-700">All selected</span>
                ) : (
                  <span className="font-semibold text-slate-500">None selected</span>
                )}
              </div>

              <div className="font-bold text-slate-900">
                Total: ₹ {Number(total || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* ✅ Desktop header */}
          <div className="hidden md:grid grid-cols-12 p-2 font-bold text-xs bg-gray-100">
            <div className="grid col-span-1 place-items-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allChecked}
                onChange={toggleSelectAll}
                disabled={!filteredInvoices.length}
                title="Select all"
              />
            </div>
            <div className="col-span-1">Invoice #</div>
            <div className="col-span-1">Ac Year</div>
            <div className="col-span-2">Roll Number</div>
            <div className="col-span-2">Student Name</div>
            <div className="col-span-2">Course</div>
            <div className="col-span-1">Fees Type</div>
            <div className="col-span-1">Balance</div>
            <div className="col-span-1">Pay</div>
          </div>

          {filteredInvoices.map((inv) => {
            const checked = selected[inv._id] !== undefined;

            return (
              <div key={inv._id} className="border-t">
                {/* ✅ Mobile / Tablet (card layout) */}
                <div className="md:hidden p-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={checked} onChange={() => toggle(inv)} />
                      <div className="font-bold text-slate-800">{inv.invoiceNo}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">{getFormattedDate(inv.createdAt)}</div>
                    </div>
                    <div className="font-bold text-slate-900">
                      ₹ {Number(inv.balance || 0).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500">Roll Number : </span>
                      {String(inv.studentId?.rollNumber || "-")}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Student Name : </span>
                      {String(inv.userId?.name || "-")}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Course : </span>
                      {String(inv.courseId?.name || "-")}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Fees Type : </span>
                      {String(inv.source || "-")}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Academic Year : </span>
                      {String(inv.acYear?.acYear || "-")}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pay Amount
                    </label>
                    <input
                      disabled={!checked}
                      type="number"
                      min="0"
                      className="border p-2 rounded w-full text-sm"
                      value={checked ? selected[inv._id] : ""}
                      onChange={(e) => changeAmount(inv._id, e.target.value, inv.balance)}
                    />
                  </div>
                </div>

                {/* ✅ Desktop (table layout) */}
                <div className="hidden md:grid grid-cols-12 p-2 text-xs items-center">
                  <div className="grid col-span-1 place-items-center">
                    <input type="checkbox" checked={checked} onChange={() => toggle(inv)} />
                  </div>
                  <div className="col-span-1">{inv.invoiceNo}</div>
                  <div className="col-span-1">{String(inv.acYear?.acYear || "-")}</div>
                  {/*<div className="col-span-1">{getFormattedDate(inv.createdAt)}</div>*/}
                  <div className="col-span-2">{String(inv.studentId?.rollNumber || "-")}</div>
                  <div className="col-span-2">{String(inv.userId?.name || "-")}</div>
                  <div className="col-span-2">{String(inv.courseId?.name || "-")}</div>
                  <div className="col-span-1">{String(inv.source || "-")}</div>
                  <div className="col-span-1 text-right mr-4">
                    ₹ {Number(inv.balance || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="col-span-1">
                    <input
                      disabled={!checked}
                      type="number"
                      min="0"
                      className="border p-1 rounded w-full"
                      value={checked ? selected[inv._id] : ""}
                      onChange={(e) => changeAmount(inv._id, e.target.value, inv.balance)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {(!filteredInvoices || filteredInvoices.length === 0) && (
            <div className="p-3 text-xs text-gray-600">No invoices</div>
          )}
        </div>
        : <div className='flex items-center justify-center rounded-lg shadow-xl border'>
          <img width={250} className='flex items-center justify-center' src="/spinner1.gif" />
        </div>}

      <button
        disabled={processing || uploadingProof || !proofAttached}
        onClick={submit}
        className={`mt-4 w-full text-white p-2 rounded hover:-translate-y-0.5 ${processing || uploadingProof || !proofAttached
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-teal-600 hover:bg-teal-700"
          }`}
        title={!proofAttached ? "Attach proof to submit" : ""}
      >
        {uploadingProof ? "Uploading Proof..." : processing ? "Submitting..." : "Submit Batch to HQ"}
      </button>

      {/* ✅ Filter Popup */}
      {showFilterPopup ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
          onClick={() => setShowFilterPopup(false)}
        >
          <div
            className="w-full max-w-4xl rounded-xl bg-[url(/bg_card.png)] bg-cover bg-center p-4 shadow-2xl bacdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Filter Invoices</h3>
              <button
                type="button"
                onClick={() => setShowFilterPopup(false)}
                className="rounded px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Invoice No"
                value={filterInvoiceNo}
                onChange={(e) => setFilterInvoiceNo(e.target.value)}
              />

              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Academic Year"
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
              />

              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Student Name"
                value={filterStudentName}
                onChange={(e) => setFilterStudentName(e.target.value)}
              />

              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Course"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              />

              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Fees Type"
                value={filterFeesType}
                onChange={(e) => setFilterFeesType(e.target.value)}
              />

              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Roll Number"
                value={filterRollNumber}
                onChange={(e) => setFilterRollNumber(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setShowFilterPopup(false)}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}