import React, { useMemo } from "react";

export default function NiswanReportTable({ rows }) {
  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  return (
    <div className="rounded-xl border bg-white overflow-auto">
      <table className="min-w-[900px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <Th>Code</Th>
            <Th>School</Th>
            <Th className="text-right">Total</Th>
            <Th className="text-right">Paid</Th>
            <Th className="text-right">Unpaid</Th>
            <Th className="text-right">Active</Th>
            <Th className="text-right">Graduated</Th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-4 text-slate-400">
                No data
              </td>
            </tr>
          ) : (
            list.map((r) => (
              <tr key={r._id} className="border-t">
                <Td>{r.code || "-"}</Td>
                <Td>{r.nameEnglish || "-"}</Td>
                <Td className="text-right">{Number(r.totalStudents || 0)}</Td>
                <Td className="text-right">{Number(r.feesPaid || 0)}</Td>
                <Td className="text-right">{Number(r.unpaid || 0)}</Td>
                <Td className="text-right">{Number(r.activeStudents || 0)}</Td>
                <Td className="text-right">{Number(r.graduatedStudents || 0)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`text-left px-3 py-2 font-medium text-slate-700 ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
