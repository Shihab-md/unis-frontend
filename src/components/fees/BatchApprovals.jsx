import React, { useEffect, useMemo, useState } from "react";
import {
  fetchPendingBatches,
  fetchBatchDetails,
  approveBatch,
  rejectBatch,
} from "../../api/feesApi.js";
import { showSwalAlert, LinkIcon } from "../../utils/CommonHelper";

export default function BatchApprovals() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [details, setDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [filterBatchNo, setFilterBatchNo] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [filterNiswan, setFilterNiswan] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [filterPaidDate, setFilterPaidDate] = useState("");

  const load = async () => {
    try {
      setListLoading(true);
      const data = await fetchPendingBatches({});
      setBatches(Array.isArray(data) ? data : []);
    } catch {
      setBatches([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openBatch = async (b) => {
    setSelectedBatch(b);
    setDetails(null);

    try {
      setDetailLoading(true);
      const d = await fetchBatchDetails(b._id);
      setDetails(d);
    } catch {
      showSwalAlert("Error!", "Failed to load batch details", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const doApprove = async () => {
    if (!selectedBatch) return;

    setProcessing(true);
    try {
      const resp = await approveBatch(selectedBatch._id);
      if (resp?.success) {
        showSwalAlert(
          "Success!",
          `Approved. Approved: ${resp.result?.applied || 0}, Failed: ${resp.result?.failed || 0}`,
          "success"
        );
        setSelectedBatch(null);
        setDetails(null);
        await load();
      } else {
        showSwalAlert("Error!", resp?.error || "Approve failed", "error");
      }
    } catch {
      showSwalAlert("Error!", "Approve failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const doReject = async () => {
    if (!selectedBatch) return;

    const reason = window.prompt("Reject reason?");
    if (!reason) return;

    setProcessing(true);
    try {
      const resp = await rejectBatch(selectedBatch._id, reason);
      if (resp?.success) {
        showSwalAlert("Rejected", "Batch rejected", "info");
        setSelectedBatch(null);
        setDetails(null);
        await load();
      } else {
        showSwalAlert("Error!", resp?.error || "Reject failed", "error");
      }
    } catch {
      showSwalAlert("Error!", "Reject failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const getProofLinks = (b) => {
    const view = b?.proofDriveViewUrl || b?.proofUrl || "";
    const download = b?.proofDriveDownloadUrl || "";
    const name = b?.proofFileName || "";
    return { view, download, name };
  };

  const clearFilters = () => {
    setFilterBatchNo("");
    setFilterAcademicYear("");
    setFilterNiswan("");
    setFilterMode("");
    setFilterPaidDate("");
  };

  const hasActiveFilters = useMemo(() => {
    return [
      filterBatchNo,
      filterAcademicYear,
      filterNiswan,
      filterMode,
      filterPaidDate,
    ].some((v) => String(v || "").trim() !== "");
  }, [
    filterBatchNo,
    filterAcademicYear,
    filterNiswan,
    filterMode,
    filterPaidDate,
  ]);

  const filteredBatches = useMemo(() => {
    const batchNo = filterBatchNo.trim().toLowerCase();
    const academicYear = filterAcademicYear.trim().toLowerCase();
    const niswan = filterNiswan.trim().toLowerCase();
    const mode = filterMode.trim().toLowerCase();
    const paidDate = filterPaidDate.trim().toLowerCase();

    return (batches || []).filter((b) => {
      const rowBatchNo = String(b?.batchNo || "").toLowerCase();
      const rowAcademicYear = String(b?.acYear?.acYear || b?.acYear || "").toLowerCase();
      const rowNiswan = String(
        `${b?.schoolId?.nameEnglish || ""} ${b?.schoolId?.districtStateId?.district || ""} ${b?.schoolId?.districtStateId?.state || ""}`
      ).toLowerCase();
      const rowMode = String(b?.mode || "").toLowerCase();
      const rowPaidDate = b?.paidDate
        ? new Date(b.paidDate).toLocaleString().toLowerCase()
        : "";

      return (
        (!batchNo || rowBatchNo.includes(batchNo)) &&
        (!academicYear || rowAcademicYear.includes(academicYear)) &&
        (!niswan || rowNiswan.includes(niswan)) &&
        (!mode || rowMode.includes(mode)) &&
        (!paidDate || rowPaidDate.includes(paidDate))
      );
    });
  }, [batches, filterBatchNo, filterAcademicYear, filterNiswan, filterMode, filterPaidDate]);

  const batchInfo = details?.batch || selectedBatch;
  const groupedItems = Array.isArray(details?.items) ? details.items : [];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div>{LinkIcon("/dashboard/accountsPage", "Back")}</div>
        <h3 className="pl-2 text-lg font-semibold text-left">HQ Payment Batch Approvals</h3>
      </div>

      <div className="grid grid-cols-1 text-xs md:grid-cols-4 gap-4">
        <div className="border rounded">
          <div className="flex items-center justify-between p-2 font-bold text-xs bg-gray-100 border-b">
            <span>Pending Batches</span>
            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
                  Filters Applied
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => setShowFilterPopup(true)}
                className="rounded border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                title="Open Filters"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="px-2 py-1 text-[11px] text-gray-500 border-b">
            Showing {filteredBatches.length}/{batches.length}
          </div>

          {listLoading ? (
            <div className="p-4 text-center text-xs text-gray-600">Loading batches...</div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-3 text-xs text-gray-600">No pending batches</div>
          ) : (
            filteredBatches.map((b) => (
              <button
                key={b._id}
                onClick={() => openBatch(b)}
                className={`w-full text-left p-2 border-t hover:bg-gray-50 ${
                  selectedBatch?._id === b._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="font-semibold">
                  {b.batchNo} - {"Amount : ₹ " + Number(b.totalAmount || 0).toLocaleString("en-IN")}
                </div>

                <div className="text-gray-600 flex items-center justify-between gap-2">
                  <span>{b?.paidDate ? new Date(b.paidDate).toLocaleString() : "-"}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="col-span-3 border rounded min-h-[320px]">
          <div className="p-2 font-bold text-xs bg-gray-100">Batch Details</div>

          {!selectedBatch && !detailLoading && (
            <div className="p-3 text-xs text-gray-600">Select a batch</div>
          )}

          {detailLoading ? (
            <div className="flex items-center justify-center h-[260px] rounded-lg">
              <img width={220} className="flex items-center justify-center" src="/spinner1.gif" alt="Loading" />
            </div>
          ) : null}

          {selectedBatch && !detailLoading && (
            <div className="p-3 text-xs">
              <div className="mb-2"><b>Batch No :</b> {batchInfo?.batchNo || "-"}</div>
              <div className="mb-2"><b>Total :</b> ₹ {Number(batchInfo?.totalAmount || 0).toLocaleString("en-IN")}</div>
              <div className="mb-2"><b>Mode :</b> {batchInfo?.mode || "-"}</div>
              <div className="mb-2">
                <b>Student Rows :</b> {groupedItems.length}{" "}
                <span className="text-gray-500">
                  {batchInfo?.itemCount ? `(Invoice Items: ${batchInfo.itemCount})` : ""}
                </span>
              </div>
              <div className="mb-2"><b>Ref # :</b> {batchInfo?.referenceNo || "-"}</div>

              <div className="mb-2">
                <b>Proof :</b>{" "}
                {(() => {
                  const { view, name } = getProofLinks(batchInfo);
                  if (!view) return <span className="text-gray-400 font-bold">-</span>;

                  return (
                    <>
                      <a
                        className="text-blue-700 underline font-bold"
                        href={view}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                      {name ? <span className="text-[11px] text-gray-500"> ({name})</span> : null}
                    </>
                  );
                })()}
              </div>

              <div className="mb-2">
                <b>Niswan :</b>{" "}
                {batchInfo?.schoolId
                  ? `${batchInfo.schoolId.nameEnglish || "-"}, ${batchInfo.schoolId?.districtStateId?.district || "-"}, ${batchInfo.schoolId?.districtStateId?.state || "-"}`
                  : "-"}
              </div>

              {groupedItems.length > 0 && (
                <div className="mt-3 border rounded overflow-hidden">
                  <div className="hidden md:grid grid-cols-12 p-2 font-bold bg-gray-50 text-xs sticky top-0">
                    <div className="col-span-4">Student</div>
                    <div className="col-span-2">AC Year</div>
                    <div className="col-span-3">Fees Type</div>
                    <div className="col-span-2">Invoices</div>
                    <div className="col-span-1 text-right">Amount</div>
                  </div>

                  <div className="max-h-[450px] overflow-auto">
                    {groupedItems.map((it, idx) => {
                      const rollNumber = it?.rollNumber || "-";
                      const studentName = it?.studentName || "-";
                      const amount = Number(it?.amount || 0);

                      const invoices = Array.isArray(it?.invoices) ? it.invoices : [];
                      const feeTypesText =
                        it?.feeTypesText ||
                        [...new Set(invoices.map((inv) => String(inv?.feeType || "").trim()).filter(Boolean))].join(", ") ||
                        "-";

                      const invoiceNosText =
                        it?.invoiceNosText ||
                        [...new Set(invoices.map((inv) => String(inv?.invoiceNo || "").trim()).filter(Boolean))].join(", ") ||
                        "-";

                      const acYearsText =
                        [...new Set(invoices.map((inv) => String(inv?.acYear || "").trim()).filter(Boolean))].join(", ") || "-";

                      const courseText =
                        [...new Set(invoices.map((inv) => String(inv?.courseName || "").trim()).filter(Boolean))].join(", ") || "-";

                      return (
                        <div key={it?.studentId || idx} className="border-t">
                          {/* Mobile / Tablet */}
                          <div className="md:hidden p-3 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-slate-800">{studentName}</div>
                              <div className="font-bold text-slate-900">
                                ₹ {amount.toLocaleString("en-IN")}
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-700">
                              <div>
                                <span className="font-semibold text-slate-500">Roll No: </span>
                                {rollNumber}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-500">Course: </span>
                                {courseText}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-500">Fees Type: </span>
                                {feeTypesText}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-500">AC Year: </span>
                                {acYearsText}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-500">Invoices: </span>
                                {invoiceNosText}
                              </div>
                            </div>
                          </div>

                          {/* Desktop */}
                          <div className="hidden md:grid grid-cols-12 p-2 text-xs">
                            <div className="col-span-4">
                              <p className="mb-1"><span className="text-blue-700 mr-1">Roll No:</span> {rollNumber}</p>
                              <p className="mb-1"><span className="text-blue-700 mr-3">Name:</span> {studentName}</p>
                              <p><span className="text-blue-700 mr-2">Course:</span> {courseText}</p>
                            </div>

                            <div className="col-span-2 text-slate-700 break-words pr-2">
                              {acYearsText}
                            </div>

                            <div className="col-span-3 text-slate-700 break-words pr-2">
                              {feeTypesText}
                            </div>

                            <div className="col-span-2 text-slate-700 break-words pr-2">
                              {invoiceNosText}
                            </div>

                            <div className="col-span-1 text-right text-slate-900 mr-3 font-semibold">
                              ₹ {amount.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {groupedItems.length === 0 && (
                <div className="mt-3 text-xs text-gray-600">No items found for this batch.</div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  disabled={processing}
                  onClick={doApprove}
                  className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-60 hover:-translate-y-0.5"
                >
                  {processing ? "Working..." : "Approve"}
                </button>
                <button
                  disabled={processing}
                  onClick={doReject}
                  className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-60 hover:-translate-y-0.5"
                >
                  {processing ? "Working..." : "Reject"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFilterPopup ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
          onClick={() => setShowFilterPopup(false)}
        >
          <div
            className="w-full max-w-4xl rounded-xl bg-[url(/bg_card.png)] bg-cover bg-center p-4 shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Filter Pending Batches</h3>
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
                placeholder="Batch No"
                value={filterBatchNo}
                onChange={(e) => setFilterBatchNo(e.target.value)}
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
                placeholder="Niswan"
                value={filterNiswan}
                onChange={(e) => setFilterNiswan(e.target.value)}
              />

              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Mode"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
              />

              <input
                type="text"
                className="w-full rounded border p-2 text-sm"
                placeholder="Paid Date"
                value={filterPaidDate}
                onChange={(e) => setFilterPaidDate(e.target.value)}
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