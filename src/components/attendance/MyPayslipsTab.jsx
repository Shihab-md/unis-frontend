import React, { useEffect, useState } from "react";
import { attendanceGet } from "../../api/attendanceApi";
import { useLanguage } from "../../i18n/LanguageContext";
import { showSwalAlert } from "../../utils/CommonHelper";
import {
  AttendancePanel,
  EmptyBlock,
  LoadingBlock,
  StatusBadge,
  formatAmount,
  getApiError,
} from "./AttendanceCommon";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const MyPayslipsTab = () => {
  const { tr } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await attendanceGet("payroll/mine");
        if (alive) setPayslips(Array.isArray(response.data?.payslips) ? response.data.payslips : []);
      } catch (error) {
        if (alive) showSwalAlert("Error!", getApiError(error), "error");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  if (loading) return <LoadingBlock text="Loading Payslips..." />;

  return (
    <div className="space-y-4">
      <AttendancePanel
        title="My Payslips"
        subtitle="Only your own Finalized or Paid Payroll salary records are shown here."
      >
        {!payslips.length ? <EmptyBlock text="No finalized payslips found" /> : null}
        <div className="space-y-3">
          {payslips.map((payslip) => {
            const item = payslip.item || {};
            return (
              <div key={payslip.payrollRunId} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 md:p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-bold text-slate-800">{payslip.monthKey}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {payslip.organizationCode ? `${payslip.organizationCode} · ` : ""}
                      {payslip.organizationName || tr(payslip.organizationType || "")}
                    </div>
                  </div>
                  <StatusBadge status={payslip.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                  {[
                    ["Monthly Salary", item.monthlySalary],
                    ["Travelling Allowance", item.travellingAllowance],
                    ["Gross Salary", item.grossSalary],
                    ["Attendance Deduction", item.attendanceDeduction],
                    ["Manual Allowance", item.manualAllowance],
                    ["Manual Deduction", item.manualDeduction],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-white p-2.5">
                      <div className="text-[10px] text-slate-500">{tr(label)}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{formatAmount(value)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-[10px] font-semibold text-emerald-700">{tr("Net Salary")}</div>
                  <div className="mt-1 text-xl font-bold text-emerald-800">{formatAmount(item.netSalary)}</div>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2 lg:grid-cols-4">
                  <div><b>{tr("Working Days")}:</b> {payslip.workingDays ?? "-"}</div>
                  <div><b>{tr("Payable Days")}:</b> {item.payableDays ?? "-"}</div>
                  <div><b>{tr("Recorded Days")}:</b> {item.attendanceRecordedDays ?? "-"}</div>
                  <div><b>{tr("Unpaid Leave")}:</b> {item.unpaidLeaveUnits ?? "-"}</div>
                  <div><b>{tr("Finalized On")}:</b> {formatDate(payslip.finalizedAt)}</div>
                  <div><b>{tr("Paid On")}:</b> {formatDate(payslip.paidAt)}</div>
                  <div><b>{tr("Payment Method")}:</b> {payslip.paymentMethod || "-"}</div>
                  <div><b>{tr("Payment Reference")}:</b> {payslip.paymentReference || "-"}</div>
                </div>
                {item.remarks ? (
                  <div className="mt-3 rounded-md bg-white p-2 text-xs text-slate-600">
                    <b>{tr("Remarks")}:</b> {item.remarks}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </AttendancePanel>
    </div>
  );
};

export default MyPayslipsTab;
