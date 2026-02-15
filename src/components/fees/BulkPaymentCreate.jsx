import React, { useEffect, useMemo, useState } from "react";
import { fetchDueInvoices, createPaymentBatch } from "../../api/feesApi.js"
import { uploadProofFile } from "../../api/uploadApi.js";
import { showSwalAlert } from "../../utils/CommonHelper";

export default function BulkPaymentCreate() {

  const schoolId = localStorage.getItem("schoolId");
  const acYear = '680485d9361ed06368c57f7c';//2024-2025 //localStorage.getItem("acYearId");

  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState({});
  const [mode, setMode] = useState("bank");
  const [referenceNo, setReferenceNo] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        console.log("School Id : " + schoolId + ", AC Year : " + acYear)
        const data = await fetchDueInvoices({ schoolId, acYear });
        console.log(data)
        if (!alive) return;
        setInvoices(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setInvoices([]);
        showSwalAlert("Error!", "Failed to load invoices", "error");
      }
    };
    if (schoolId && acYear) run();
    return () => (alive = false);
  }, [schoolId, acYear]);

  const total = useMemo(() => Object.values(selected).reduce((s, v) => s + Number(v || 0), 0), [selected]);

  const toggle = (inv) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[inv._id] !== undefined) delete copy[inv._id];
      else copy[inv._id] = Number(inv.balance || 0);
      return copy;
    });
  };

  const changeAmount = (id, val, maxBalance) => {
    const n = Number(val);
    setSelected((prev) => ({
      ...prev,
      [id]: !Number.isFinite(n) ? 0 : Math.max(0, Math.min(n, Number(maxBalance || 0))),
    }));
  };

  const submit = async () => {
    const items = Object.keys(selected)
      .map((invoiceId) => {
        const inv = invoices.find((x) => x._id === invoiceId);
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

    setLoading(true);
    try {
      const payload = { schoolId, acYear, mode, referenceNo, proofUrl, items };
      const resp = await createPaymentBatch(payload);
      if (!resp?.success) showSwalAlert("Error!", resp?.error || "Failed", "error");
      else {
        showSwalAlert("Success!", `Batch created: ${resp.batchNo}`, "success");
        setSelected({});
        window.location.reload();
      }
    } catch {
      showSwalAlert("Error!", "Failed to create batch", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-md font-bold mb-4">Bulk Fee Payment (Send to HQ)</h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <select className="col-span-3 border p-2 rounded" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
        </select>
        <div className="col-span-1"></div>
        <input
          className="col-span-3 border p-2 rounded"
          placeholder="Details"
          value={referenceNo}
          onChange={(e) => setReferenceNo(e.target.value)}
        />
        <div className="col-span-1"></div>
        <div className="col-span-4 border p-2 rounded">
          {/*<input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const url = await uploadProofFile(f);
                setProofUrl(url);
                showSwalAlert("Uploaded", "Proof uploaded successfully", "success");
              } catch {
                showSwalAlert("Error!", "Proof upload failed", "error");
              }
            }}
          />
          {proofUrl && <div className="text-xs text-green-700 mt-1">Proof: {proofUrl}</div>}
          */}
        </div>
      </div>

      <div className="mb-3 font-semibold">Total: {total}</div>

      <div className="border rounded">
        <div className="grid grid-cols-12 p-2 font-bold text-xs bg-gray-100">
          <div className="grid col-span-1 place-items-center">#</div>
          <div className="col-span-4">Student Name</div>
          <div className="col-span-3">Course</div>
          <div className="col-span-2">Fees Type</div>
          <div className="col-span-1">Balance</div>
          <div className="col-span-1">Pay</div>
        </div>

        {invoices.map((inv) => {
          const checked = selected[inv._id] !== undefined;
          return (
            <div key={inv._id} className="grid grid-cols-12 p-2 border-t text-xs items-center">
              <div className="grid col-span-1 place-items-center">
                <input type="checkbox" checked={checked} onChange={() => toggle(inv)} />
              </div>
              <div className="col-span-4">{String(inv.userId.name)}</div>
              <div className="col-span-3">{String(inv.courseId.name)}</div>
              <div className="col-span-2">{String(inv.source)}</div>
              <div className="col-span-1">{inv.balance}</div>
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
          );
        })}
      </div>

      <button
        disabled={loading}
        onClick={submit}
        className="mt-4 w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700"
      >
        {loading ? "Submitting..." : "Submit Batch to HQ"}
      </button>
    </div>
  );
}
