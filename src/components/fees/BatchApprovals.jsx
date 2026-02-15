import React, { useEffect, useState } from "react";
import { fetchPendingBatches, fetchBatchDetails, approveBatch, rejectBatch } from "../../api/feesApi.js";
import { showSwalAlert } from "../../utils/CommonHelper";

export default function BatchApprovals() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const data = await fetchPendingBatches({});
      setBatches(Array.isArray(data) ? data : []);
    } catch {
      setBatches([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openBatch = async (b) => {
    setSelectedBatch(b);
    setDetails(null);
    try {
      const d = await fetchBatchDetails(b._id);
      setDetails(d);
    } catch {
      showSwalAlert("Error!", "Failed to load batch details", "error");
    }
  };

  const doApprove = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const resp = await approveBatch(selectedBatch._id);
      if (resp?.success) {
        showSwalAlert("Success!", `Approved. Applied: ${resp.result?.applied}, Failed: ${resp.result?.failed}`, "success");
        setSelectedBatch(null);
        setDetails(null);
        load();
      } else showSwalAlert("Error!", resp?.error || "Approve failed", "error");
    } catch {
      showSwalAlert("Error!", "Approve failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const doReject = async () => {
    if (!selectedBatch) return;
    const reason = prompt("Reject reason?");
    if (!reason) return;

    setLoading(true);
    try {
      const resp = await rejectBatch(selectedBatch._id, reason);
      if (resp?.success) {
        showSwalAlert("Rejected", "Batch rejected", "info");
        setSelectedBatch(null);
        setDetails(null);
        load();
      } else showSwalAlert("Error!", resp?.error || "Reject failed", "error");
    } catch {
      showSwalAlert("Error!", "Reject failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-md font-bold mb-4">HQ Payment Batch Approvals</h2>

      <div className="grid grid-cols-1 text-xs md:grid-cols-4 gap-4">
        <div className="border rounded">
          <div className="p-2 font-bold text-xs bg-gray-100">Pending Batches</div>
          {batches.map((b) => (
            <button key={b._id} onClick={() => openBatch(b)} className="w-full text-left p-2 border-t hover:bg-gray-50">
              <div className="font-semibold">{b.batchNo} - {"Amount : " + b.totalAmount}</div>
              <div className="text-gray-600">{new Date(b.paidDate).toLocaleString()}</div>
            </button>
          ))}
          {batches.length === 0 && <div className="p-3 text-xs text-gray-600">No pending batches</div>}
        </div>

        <div className="col-span-3 border rounded">
          <div className="p-2 font-bold text-xs bg-gray-100">Batch Details</div>

          {!selectedBatch && <div className="p-3 text-xs text-gray-600">Select a batch</div>}

          {selectedBatch && (
            <div className="p-3 text-xs">
              <div className="mb-2"><b>Batch :</b> {selectedBatch.batchNo}</div>
              <div className="mb-2"><b>Total :</b> {selectedBatch.totalAmount}</div>
              <div className="mb-2"><b>Mode :</b> {selectedBatch.mode}</div>
              <div className="mb-2"><b>Ref # :</b> {selectedBatch.referenceNo || "-"}</div>

              <div className="mb-2">
                <b>Niswan :</b>{" "}
                {selectedBatch?.schoolId
                  ? `${selectedBatch.schoolId.nameEnglish || "-"}, ${selectedBatch.schoolId?.districtStateId?.district || "-"}, ${selectedBatch.schoolId?.districtStateId?.state || "-"}`
                  : "-"}
              </div>

              {Array.isArray(details?.items) && details.items.length > 0 && (
                <div className="mt-3 max-h-64 overflow-auto border rounded">
                  {/* Header */}
                  <div className="grid grid-cols-12 p-2 font-bold bg-gray-50 text-xs sticky top-0">
                    <div className="col-span-5">Student Name</div>
                    <div className="col-span-3">Course</div>
                    <div className="col-span-2">Fees Type</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>

                  {/* Rows */}
                  {details.items.map((it, idx) => {
                    const studentName = it?.studentId?.userId?.name || "-";
                    const courseName = it?.invoiceId?.courseId?.name || "-";
                    const feesType = it?.invoiceId?.source || "-";
                    const amount = Number(it?.amount || 0);

                    return (
                      <div key={it?._id || idx} className="grid grid-cols-12 p-2 border-t text-xs">
                        <div className="col-span-5 text-slate-800">{studentName}</div>
                        <div className="col-span-3 text-slate-700">{courseName}</div>
                        <div className="col-span-2 text-slate-700">{feesType}</div>
                        <div className="col-span-2 text-right text-slate-900">{amount}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {Array.isArray(details?.items) && details.items.length === 0 && (
                <div className="mt-3 text-xs text-gray-600">No items found for this batch.</div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  disabled={loading}
                  onClick={doApprove}
                  className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-60"
                >
                  {loading ? "Working..." : "Approve"}
                </button>
                <button
                  disabled={loading}
                  onClick={doReject}
                  className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
