import React, { useEffect, useMemo, useState } from "react";
import { fetchPendingBatches, fetchBatchDetails, approveBatch, rejectBatch } from "../../api/feesApi.js";
import { showSwalAlert, LinkIcon, getPrcessing } from "../../utils/CommonHelper";

export default function BatchApprovals() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [details, setDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  // ✅ Filter popup
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // ✅ Filters
  const [filterBatchNo, setFilterBatchNo] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [filterNiswan, setFilterNiswan] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [filterPaidDate, setFilterPaidDate] = useState("");

  const load = async () => {
    try {
      setProcessing(true);
      const data = await fetchPendingBatches({});
      setBatches(Array.isArray(data) ? data : []);
      setProcessing(false);
    } catch {
      setBatches([]);
      setProcessing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openBatch = async (b) => {
    setSelectedBatch(b);
    setDetails(null);
    try {
      setProcessing(true);
      const d = await fetchBatchDetails(b._id);
      setDetails(d);
      setProcessing(false);
    } catch {
      setProcessing(false);
      showSwalAlert("Error!", "Failed to load batch details", "error");
    }
  };

  const doApprove = async () => {
    if (!selectedBatch) return;
    setProcessing(true);
    try {
      const resp = await approveBatch(selectedBatch._id);
      if (resp?.success) {
        setProcessing(false);
        showSwalAlert(
          "Success!",
          `Approved. Approved: ${resp.result?.applied}, Failed: ${resp.result?.failed}`,
          "success"
        );
        setSelectedBatch(null);
        setDetails(null);
        load();
      } else {
        setProcessing(false);
        showSwalAlert("Error!", resp?.error || "Approve failed", "error");
      }
    } catch {
      setProcessing(false);
      showSwalAlert("Error!", "Approve failed", "error");
    }
  };

  const doReject = async () => {
    if (!selectedBatch) return;
    const reason = prompt("Reject reason?");
    if (!reason) return;

    setProcessing(true);
    try {
      const resp = await rejectBatch(selectedBatch._id, reason);
      if (resp?.success) {
        setProcessing(false);
        showSwalAlert("Rejected", "Batch rejected", "info");
        setSelectedBatch(null);
        setDetails(null);
        load();
      } else {
        setProcessing(false);
        showSwalAlert("Error!", resp?.error || "Reject failed", "error");
      }
    } catch {
      setProcessing(false);
      showSwalAlert("Error!", "Reject failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  //if (processing) return getPrcessing();

  // ✅ helper: pick proof links (Drive first, fallback proofUrl)
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
  }, [filterBatchNo, filterAcademicYear, filterNiswan, filterMode, filterPaidDate]);

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

          {filteredBatches.map((b) => {
            const { view } = getProofLinks(b);
            return (
              <button
                key={b._id}
                onClick={() => openBatch(b)}
                className="w-full text-left p-2 border-t hover:bg-gray-50"
              >
                <div className="font-semibold">
                  {b.batchNo} - {"Amount : " + b.totalAmount}
                </div>

                <div className="text-gray-600 flex items-center justify-between gap-2">
                  <span>{new Date(b.paidDate).toLocaleString()}</span>
                </div>
              </button>
            );
          })}

          {filteredBatches.length === 0 && (
            <div className="p-3 text-xs text-gray-600">No pending batches</div>
          )}
        </div>

        {!processing ?
          <div className="col-span-3 border rounded">
            <div className="p-2 font-bold text-xs bg-gray-100">Batch Details</div>

            {!selectedBatch && <div className="p-3 text-xs text-gray-600">Select a batch</div>}

            {selectedBatch && (
              <div className="p-3 text-xs">
                <div className="mb-2"><b>Batch No :</b> {batchInfo?.batchNo || "-"}</div>
                <div className="mb-2"><b>Total :</b> ₹ {Number(batchInfo?.totalAmount || 0).toLocaleString("en-IN")}</div>
                <div className="mb-2"><b>Mode :</b> {batchInfo?.mode || "-"}</div>
                <div className="mb-2"><b>Items :</b> {details?.items?.length}</div>
                <div className="mb-2"><b>Ref # :</b> {batchInfo?.referenceNo || "-"}</div>

                {/* ✅ NEW: Proof view/download in details */}
                <div className="mb-2">
                  <b>Proof :</b>{" "}
                  {(() => {
                    const { view, download, name } = getProofLinks(batchInfo);
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

                {Array.isArray(details?.items) && details.items.length > 0 && (
                  <div className="mt-3 border rounded overflow-hidden">
                    {/* ✅ Desktop header */}
                    <div className="hidden md:grid grid-cols-12 p-2 font-bold bg-gray-50 text-xs sticky top-0">
                      <div className="col-span-6">Details</div>
                      <div className="col-span-2">AC Year</div>
                      <div className="col-span-2">Fees Type</div>
                      <div className="col-span-2">Amount</div>
                    </div>

                    <div className="max-h-64 overflow-auto">
                      {details.items.map((it, idx) => {
                        const rollNumber = it?.studentId?.rollNumber || "-";
                        const studentName = it?.studentId?.userId?.name || "-";
                        const courseName = it?.invoiceId?.courseId?.name || "-";
                        const acYear = it?.invoiceId?.acYear?.acYear || "-";
                        const feesType = it?.invoiceId?.source || "-";
                        const amount = Number(it?.amount || 0);

                        return (
                          <div key={it?._id || idx} className="border-t">
                            {/* ✅ Mobile / Tablet card */}
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
                                  {courseName}
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-500">Fees Type: </span>
                                  {feesType}
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-500">AC Year: </span>
                                  {acYear}
                                </div>
                              </div>
                            </div>

                            {/* ✅ Desktop row */}
                            <div className="hidden md:grid grid-cols-12 p-2 text-xs">
                              <div className="mt-1 mb-1 col-span-6">
                                <p className="mb-1"><span className="text-blue-700 mr-1">Roll No:</span> {rollNumber}</p>
                                <p className="mb-1"><span className="text-blue-700 mr-3">Name:</span> {studentName}</p>
                                <p><span className="text-blue-700 mr-2">Course:</span> {courseName}</p>
                              </div>
                              <div className="col-span-2 text-slate-700">{acYear}</div>
                              <div className="col-span-2 text-slate-700">{feesType}</div>
                              <div className="col-span-2 text-right text-slate-900 mr-3">
                                ₹ {amount.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {Array.isArray(details?.items) && details.items.length === 0 && (
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
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
          : <div className='flex items-center justify-center rounded-lg shadow-xl border'>
            <img width={250} className='flex items-center justify-center' src="/spinner1.gif" />
          </div>}
      </div>

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