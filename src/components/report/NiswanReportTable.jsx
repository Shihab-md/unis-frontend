import React, { useMemo } from "react";

const formatNumber = (value) => Number(value || 0).toLocaleString();
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;
const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB");
};

export default function NiswanReportTable({ rows }) {
  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-lg">
      <div className="hidden lg:block overflow-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Code</Th>
              <Th>Niswan</Th>
              <Th className="text-right">Total</Th>
              <Th className="text-right">Paid</Th>
              <Th className="text-right">Unpaid</Th>
              <Th className="text-right">Paid %</Th>
              <Th className="text-right">Active</Th>
              <Th className="text-right">Graduated</Th>
              <Th className="text-right">Hostel</Th>
              <Th className="text-right">Last Admission</Th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-slate-400 text-center">
                  No data
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r._id} className="border-t hover:bg-slate-50/70">
                  <Td>{r.code || "-"}</Td>
                  <Td className="font-medium text-slate-800">{r.nameEnglish || "-"}</Td>
                  <Td className="text-right">{formatNumber(r.totalStudents)}</Td>
                  <Td className="text-right text-emerald-700 font-medium">{formatNumber(r.feesPaid)}</Td>
                  <Td className="text-right text-rose-700 font-medium">{formatNumber(r.unpaid)}</Td>
                  <Td className="text-right">{formatPercent(r.paidPercent)}</Td>
                  <Td className="text-right text-sky-700 font-medium">{formatNumber(r.activeStudents)}</Td>
                  <Td className="text-right text-violet-700 font-medium">{formatNumber(r.graduatedStudents)}</Td>
                  <Td className="text-right">{formatNumber(r.hostelYes)}</Td>
                  <Td className="text-right">{formatDate(r.lastAdmissionDate)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y">
        {list.length === 0 ? (
          <div className="px-4 py-6 text-slate-400 text-center">No data</div>
        ) : (
          list.map((r) => (
            <div key={r._id} className="p-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">{r.code || "-"}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{r.nameEnglish || "-"}</div>
                </div>
                <div className="rounded-full bg-sky-50 text-sky-700 text-xs font-medium px-2.5 py-1">
                  Total {formatNumber(r.totalStudents)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <MiniStat label="Paid" value={formatNumber(r.feesPaid)} className="bg-emerald-50 text-emerald-700" />
                <MiniStat label="Unpaid" value={formatNumber(r.unpaid)} className="bg-rose-50 text-rose-700" />
                <MiniStat label="Active" value={formatNumber(r.activeStudents)} className="bg-sky-50 text-sky-700" />
                <MiniStat label="Graduated" value={formatNumber(r.graduatedStudents)} className="bg-violet-50 text-violet-700" />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-slate-600">
                <div>
                  <span className="font-medium">Paid %:</span> {formatPercent(r.paidPercent)}
                </div>
                <div>
                  <span className="font-medium">Hostel:</span> {formatNumber(r.hostelYes)}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Last Admission:</span> {formatDate(r.lastAdmissionDate)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`text-left px-3 py-3 font-semibold text-slate-700 ${className}`}>{children}</th>;
}

function Td({ children, className = "" }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}

function MiniStat({ label, value, className = "" }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${className}`}>
      <div className="opacity-80">{label}</div>
      <div className="font-semibold mt-0.5">{value}</div>
    </div>
  );
}