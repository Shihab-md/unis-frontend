import React, { useEffect, useMemo, useState } from "react";
import { showSwalAlert, LinkIcon, getPrcessing } from "../../utils/CommonHelper";
import { fetchSentBatches } from "../../api/feesBatchesApi";
import { getAcademicYearsFromCache } from "../../utils/AcademicYearHelper";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";

export default function PaymentBatchesList() {
  const role = localStorage.getItem("role");
  const isHQ = role === "superadmin" || role === "hquser";

  const fixedSchoolId = localStorage.getItem("schoolId");

  const [academicYears, setAcademicYears] = useState([]);
  const [schools, setSchools] = useState([]);

  const [acYear, setAcYear] = useState("");
  const [schoolId, setSchoolId] = useState(isHQ ? "" : fixedSchoolId);
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [openId, setOpenId] = useState(null);

  // Load dropdown data
  useEffect(() => {
    const load = async () => {
      try {
        const years = await getAcademicYearsFromCache();
        const yearsList = Array.isArray(years) ? years : years?.academicYears || [];
        setAcademicYears(yearsList);

        // default year: Active else latest by string
        const active = yearsList.find((x) => String(x.active) === "Active");
        const sorted = yearsList
          .slice()
          .sort((a, b) =>
            String(b.acYear || b.year || "").localeCompare(String(a.acYear || a.year || ""))
          );
        const fallback = active?._id || sorted?.[0]?._id || "";
        setAcYear((prev) => prev || fallback);

        if (isHQ) {
          const sch = await getSchoolsFromCache();
          const schList = Array.isArray(sch) ? sch : sch?.schools || [];
          setSchools((schList || []).filter((x) => x?.active === "Active"));
        }
      } catch (e) {
        console.log(e);
      }
    };
    load();
  }, [isHQ]);

  const schoolOptions = useMemo(() => {
    return (schools || []).sort((a, b) => String(a.code || "").localeCompare(String(b.code || "")));
  }, [schools]);

  const runSearch = async () => {
    const missing = [];
    if (!acYear) missing.push("Academic Year");
    if (!schoolId) missing.push("Niswan");
    if (missing.length) {
      showSwalAlert("Info", `Please select: ${missing.join(", ")}`, "info");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchSentBatches({ schoolId, acYear, status });
      if (!res?.success) {
        showSwalAlert("Error", res?.error || "Failed to load", "error");
        setBatches([]);
        return;
      }
      setBatches(res.batches || []);
      setOpenId(null);
    } catch (e) {
      showSwalAlert("Error", "Failed to load batches", "error");
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  // auto load when year + school ready
  useEffect(() => {
    if (acYear && schoolId) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acYear, schoolId, status]);

  const statusBadge = (s) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide";
    if (s === "PENDING_APPROVAL") return <span className={`${base} bg-gradient-to-r from-yellow-200 to-amber-200 text-amber-900 border border-amber-300`}>PENDING</span>;
    if (s === "APPROVED") return <span className={`${base} bg-gradient-to-r from-green-200 to-emerald-200 text-emerald-900 border border-emerald-300`}>APPROVED</span>;
    if (s === "REJECTED") return <span className={`${base} bg-gradient-to-r from-rose-200 to-red-200 text-red-900 border border-red-300`}>REJECTED</span>;
    if (s === "CANCELLED") return <span className={`${base} bg-gradient-to-r from-slate-200 to-gray-200 text-slate-800 border border-slate-300`}>CANCELLED</span>;
    return <span className={`${base} bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-300`}>{s || "-"}</span>;
  };

  // ✅ Summary cards
  const summary = useMemo(() => {
    let totalAmount = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let cancelled = 0;

    for (const b of batches) {
      totalAmount += Number(b?.totalAmount || 0);
      if (b?.status === "PENDING_APPROVAL") pending++;
      else if (b?.status === "APPROVED") approved++;
      else if (b?.status === "REJECTED") rejected++;
      else if (b?.status === "CANCELLED") cancelled++;
    }

    return { totalAmount, pending, approved, rejected, cancelled, total: batches.length };
  }, [batches]);

  // ✅ Export CSV (batches + items rows)
  const exportCsv = () => {
    if (!batches?.length) {
      showSwalAlert("Info", "No data to export", "info");
      return;
    }

    const esc = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      const needs = /[",\n]/.test(s);
      return needs ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const rows = [];
    rows.push([
      "BatchNo",
      "ReceiptNumber",
      "BatchStatus",
      "PaidDate",
      "Mode",
      "ReferenceNo",
      "SchoolCode",
      "SchoolName",
      "District",
      "State",
      "TotalAmount",
      "ItemCount",
      "StudentName",
      "RollNumber",
      "CourseName",
      "CourseType",
      "InvoiceNo",
      "InvoiceSource",
      "ItemAmount",
      "ItemStatus",
      "ItemError",
    ].map(esc).join(","));

    for (const b of batches) {
      const school = b?.schoolId || {};
      const ds = school?.districtStateId || {};
      const batchBase = {
        batchNo: b?.batchNo || "",
        receiptNumber: b?.receiptNumber || "",
        batchStatus: b?.status || "",
        paidDate: b?.paidDate ? new Date(b.paidDate).toISOString().slice(0, 10) : "",
        mode: b?.mode || "",
        referenceNo: b?.referenceNo || "",
        schoolCode: school?.code || "",
        schoolName: school?.nameEnglish || "",
        district: ds?.district || "",
        state: ds?.state || "",
        totalAmount: b?.totalAmount ?? "",
        itemCount: b?.itemCount ?? "",
      };

      const items = Array.isArray(b?.items) ? b.items : [];
      if (items.length === 0) {
        rows.push([
          batchBase.batchNo,
          batchBase.receiptNumber,
          batchBase.batchStatus,
          batchBase.paidDate,
          batchBase.mode,
          batchBase.referenceNo,
          batchBase.schoolCode,
          batchBase.schoolName,
          batchBase.district,
          batchBase.state,
          batchBase.totalAmount,
          batchBase.itemCount,
          "", "", "", "", "", "", "", "", "",
        ].map(esc).join(","));
        continue;
      }

      for (const it of items) {
        const stu = it?.studentId || {};
        const u = stu?.userId || {};
        const inv = it?.invoiceId || {};
        const c = inv?.courseId || {};

        rows.push([
          batchBase.batchNo,
          batchBase.receiptNumber,
          batchBase.batchStatus,
          batchBase.paidDate,
          batchBase.mode,
          batchBase.referenceNo,
          batchBase.schoolCode,
          batchBase.schoolName,
          batchBase.district,
          batchBase.state,
          batchBase.totalAmount,
          batchBase.itemCount,
          u?.name || "",
          stu?.rollNumber || "",
          c?.name || "",
          c?.type || "",
          inv?.invoiceNo || "",
          inv?.source || "",
          it?.amount ?? "",
          it?.status || "",
          it?.error || "",
        ].map(esc).join(","));
      }
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const y = academicYears.find((x) => String(x._id) === String(acYear));
    const yearLabel = (y?.acYear || y?.year || "year").replaceAll("/", "-");
    const st = status || "ALL";

    const a = document.createElement("a");
    a.href = url;
    a.download = `sent_to_hq_batches_${yearLabel}_${st}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return getPrcessing();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        {/*<div className="flex items-center justify-between gap-3 mb-3 rounded-2xl border bg-white/70 backdrop-blur p-3 shadow-sm">*/}
        <div className="flex items-center gap-3 mb-5">
          <div>{LinkIcon("/dashboard/accountsPage", "Back")}</div>

          <div className="flex flex-col leading-tight">
            <h2 className="text-lg font-bold">Sent to HQ (Batches)</h2>
            <div className="text-xs text-gray-600 mt-1">
              View payments submitted to HQ with filters.
            </div>
          </div>
        </div>

        <button
          onClick={exportCsv}
          className="border rounded bg-white px-3 py-2 text-xs md:text-sm font-semibold hover:bg-gray-50"
          disabled={loading || batches.length === 0}
          title="Export current list to CSV"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
          <select className="w-full border p-2 text-sm rounded" value={acYear} onChange={(e) => setAcYear(e.target.value)}>
            <option value="">Select Academic Year</option>
            {academicYears.map((a) => (
              <option key={a._id} value={a._id}>
                {a.acYear}
              </option>
            ))}
          </select>
        </div>

        {isHQ ? (
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Niswan</label>
            <select className="w-full border p-2 text-sm rounded" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
              <option value="">Select Niswan</option>
              {schoolOptions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} : {s.nameEnglish}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Niswan</label>
            <input
              className="w-full border p-2 text-sm rounded bg-gray-50"
              value={localStorage.getItem("schoolName") || ""}
              readOnly
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
          <select className="w-full border p-2 text-sm rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-end">
          <button
            onClick={runSearch}
            disabled={loading}
            className="w-full border rounded bg-white p-2 font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        <div className="rounded-md border bg-gradient-to-br from-indigo-400 to-sky-500 p-3 text-white shadow-lg hover:shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-900/80">Total Batches</div>
          <div className="text-lg font-bold text-slate-900/80">{summary.total}</div>
        </div>

        <div className="rounded-md border bg-gradient-to-br from-amber-400 to-yellow-300 p-3 text-slate-900 shadow-lg hover:shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-900/80">Pending</div>
          <div className="text-lg font-bold text-slate-900/80">{summary.pending}</div>
        </div>

        <div className="rounded-md border bg-gradient-to-br from-emerald-400 to-teal-500 p-3 text-white shadow-lg hover:shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-900/80">Approved</div>
          <div className="text-lg font-bold text-slate-900/80">{summary.approved}</div>
        </div>

        <div className="rounded-md border bg-gradient-to-br from-rose-400 to-red-500 p-3 text-white shadow-lg hover:shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-900/80">Rejected</div>
          <div className="text-lg font-bold text-slate-900/80">{summary.rejected}</div>
        </div>

        <div className="rounded-md border bg-gradient-to-br from-slate-400 to-gray-500 p-3 text-white shadow-lg hover:shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-900/80">Cancelled</div>
          <div className="text-lg font-bold text-slate-900/80">{summary.cancelled}</div>
        </div>

        <div className="rounded-md border bg-gradient-to-br from-violet-400 to-fuchsia-500 p-3 text-white shadow-lg hover:shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-900/80">Total Amount</div>
          <div className="text-lg font-bold text-slate-900/80">{summary.totalAmount}</div>
        </div>
      </div>

      {/* List */}
      <div className="border rounded">
        <div className="grid grid-cols-12 p-2 font-bold text-xs bg-gradient-to-r from-slate-100 via-white to-slate-100">
          <div className="col-span-3">Batch</div>
          <div className="col-span-2">Paid Date</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-2">Mode</div>
          <div className="col-span-3">Status</div>
        </div>

        {batches.map((b) => {
          const open = String(openId) === String(b._id);
          return (
            <div key={b._id} className="border-t">
              <button
                className="w-full grid grid-cols-12 p-2 text-xs items-center hover:bg-teal-50/60 transition"
                onClick={() => setOpenId(open ? null : b._id)}
                type="button"
              >
                <div className="col-span-3 font-bold text-slate-800">
                  {b.batchNo}{" "}
                  {b.receiptNumber ? <span className="text-[10px] text-green-700">({b.receiptNumber})</span> : null}
                </div>
                <div className="col-span-2">{b.paidDate ? new Date(b.paidDate).toLocaleDateString() : "-"}</div>
                <div className="col-span-2 font-semibold">{b.totalAmount}</div>
                <div className="col-span-2">{b.mode || "-"}</div>
                <div className="col-span-3 flex items-center gap-2">
                  {statusBadge(b.status)}
                  <span className="text-[10px] text-gray-500">Items: {b.itemCount || 0}</span>
                </div>
              </button>

              {open && (
                <div className="p-2 bg-white">
                  <div className="text-xs text-gray-600 mb-2">
                    Ref: <b>{b.referenceNo || "-"}</b> &nbsp; | &nbsp; Proof: <b>{b.proofUrl ? "Uploaded" : "-"}</b>
                  </div>

                  <div className="border rounded">
                    <div className="grid grid-cols-12 p-2 font-bold text-[11px] bg-gray-50">
                      <div className="col-span-5">Student</div>
                      <div className="col-span-4">Course</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-1">Item</div>
                    </div>

                    {(b.items || []).map((it) => (
                      <div key={it._id} className="grid grid-cols-12 p-2 text-[11px] border-t">
                        <div className="col-span-5">
                          {it.studentId?.userId?.name || "-"}{" "}
                          <span className="text-[10px] text-gray-500">({it.studentId?.rollNumber || "-"})</span>
                        </div>
                        <div className="col-span-4">
                          {it.invoiceId?.courseId?.name || "-"}{" "}
                          <span className="text-[10px] text-gray-500">
                            {it.invoiceId?.source ? `(${it.invoiceId.source})` : ""}
                          </span>
                        </div>
                        <div className="col-span-2 font-semibold">{it.amount}</div>
                        <div className="col-span-1 text-[10px]">
                          {it.status === "PENDING_APPROVAL" ? "P" : it.status === "APPLIED" ? "A" : "F"}
                        </div>
                      </div>
                    ))}

                    {(!b.items || b.items.length === 0) && <div className="p-3 text-xs text-gray-600">No items</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {batches.length === 0 && <div className="p-4 text-sm text-gray-600">No batches found.</div>}
      </div>
    </div>
  );
}
