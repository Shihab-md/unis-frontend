import React, { useEffect, useState } from "react";
import { fetchPendingBatches, fetchBatchDetails, approveBatch, rejectBatch } from "../../api/feesApi.js";
import { showSwalAlert, LinkIcon, getPrcessing } from "../../utils/CommonHelper";

export default function BatchApprovals() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [details, setDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div>{LinkIcon("/dashboard/accountsPage", "Back")}</div>
        <h3 className="pl-2 text-lg font-semibold text-left">HQ Payment Batch Approvals</h3>
      </div>

      <div className="grid grid-cols-1 text-xs md:grid-cols-4 gap-4">
        <div className="border rounded">
          <div className="p-2 font-bold text-xs bg-gray-100">Pending Batches</div>

          {batches.map((b) => {
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

          {batches.length === 0 && <div className="p-3 text-xs text-gray-600">No pending batches</div>}
        </div>

        {!processing ?
          <div className="col-span-3 border rounded">
            <div className="p-2 font-bold text-xs bg-gray-100">Batch Details</div>

            {!selectedBatch && <div className="p-3 text-xs text-gray-600">Select a batch</div>}

            {selectedBatch && (
              <div className="p-3 text-xs">
                <div className="mb-2"><b>Batch :</b> {selectedBatch.batchNo}</div>
                <div className="mb-2"><b>Total :</b> {selectedBatch.totalAmount}</div>
                <div className="mb-2"><b>Mode :</b> {selectedBatch.mode}</div>
                <div className="mb-2"><b>Ref # :</b> {selectedBatch.referenceNo || "-"}</div>

                {/* ✅ NEW: Proof view/download in details */}
                <div className="mb-2">
                  <b>Proof :</b>{" "}
                  {(() => {
                    const { view, download, name } = getProofLinks(selectedBatch);
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
                  {selectedBatch?.schoolId
                    ? `${selectedBatch.schoolId.nameEnglish || "-"}, ${selectedBatch.schoolId?.districtStateId?.district || "-"}, ${selectedBatch.schoolId?.districtStateId?.state || "-"}`
                    : "-"}
                </div>

                <div className="mb-2"><b>Items :</b> {details?.items?.length}</div>

                {Array.isArray(details?.items) && details.items.length > 0 && (
                  <div className="mt-3 border rounded overflow-hidden">
                    {/* ✅ Desktop header */}
                    <div className="hidden md:grid grid-cols-12 p-2 font-bold bg-gray-50 text-xs sticky top-0">
                      <div className="col-span-2">Roll Number</div>
                      <div className="col-span-4">Student Name</div>
                      <div className="col-span-3">Course</div>
                      <div className="col-span-2">Fees Type</div>
                      <div className="col-span-1 text-right">Amount</div>
                    </div>

                    <div className="max-h-64 overflow-auto">
                      {details.items.map((it, idx) => {
                        const rollNumber = it?.studentId?.rollNumber || "-";
                        const studentName = it?.studentId?.userId?.name || "-";
                        const courseName = it?.invoiceId?.courseId?.name || "-";
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
                              </div>
                            </div>

                            {/* ✅ Desktop row */}
                            <div className="hidden md:grid grid-cols-12 p-2 text-xs">
                              <div className="col-span-2 text-slate-800">{rollNumber}</div>
                              <div className="col-span-4 text-slate-800">{studentName}</div>
                              <div className="col-span-3 text-slate-700">{courseName}</div>
                              <div className="col-span-2 text-slate-700">{feesType}</div>
                              <div className="col-span-1 text-right text-slate-900">
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
    </div>
  );
}