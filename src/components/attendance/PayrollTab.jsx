import React, { useEffect, useMemo, useState } from "react";
import { attendanceGet, attendancePatch, attendancePost } from "../../api/attendanceApi";
import { useLanguage } from "../../i18n/LanguageContext";
import { showConfirmationSwalAlert, showSwalAlert } from "../../utils/CommonHelper";
import {
  AttendancePanel,
  EmptyBlock,
  FieldLabel,
  Input,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusBadge,
  TextArea,
  currentMonthKey,
  formatAmount,
  getApiError,
} from "./AttendanceCommon";

const PayrollTab = ({
  meta,
  selectedSchoolId,
  setSelectedSchoolId,
  staffScopeType,
  setStaffScopeType,
}) => {
  const { tr } = useLanguage();
  const access = meta.access;
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [workingDays, setWorkingDays] = useState(26);
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingItemId, setSavingItemId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [payrollRemarks, setPayrollRemarks] = useState("");

  const effectiveScopeType = access.isSuperAdmin
    ? staffScopeType
    : access.canManageHqStaff
      ? "HQ"
      : "NISWAN";
  const effectiveSchoolId =
    effectiveScopeType === "HQ"
      ? meta.hqSchool?._id || ""
      : access.isSuperAdmin
        ? selectedSchoolId
        : access.actorSchoolId || "";

  const canQuery =
    Boolean(monthKey) &&
    (effectiveScopeType === "HQ" || Boolean(effectiveSchoolId));

  const loadRun = async () => {
    if (!canQuery) {
      setRun(null);
      return;
    }
    setLoading(true);
    try {
      const response = await attendanceGet("payroll", {
        month: monthKey,
        scopeType: effectiveScopeType,
        schoolId: effectiveSchoolId,
      });
      const loadedRun = response.data.run || null;
      setRun(loadedRun);
      if (loadedRun?.workingDays) setWorkingDays(loadedRun.workingDays);
      setPayrollRemarks(loadedRun?.remarks || "");
      setPaymentMethod(loadedRun?.paymentMethod || "Bank Transfer");
      setPaymentReference(loadedRun?.paymentReference || "");
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRun();
  }, [monthKey, effectiveScopeType, effectiveSchoolId]);

  const generate = async () => {
    if (!canQuery || !workingDays) {
      showSwalAlert("Info!", "Select payroll scope, month and working days.", "info");
      return;
    }

    const result = await showConfirmationSwalAlert(
      "Generate Payroll Draft?",
      "Existing Draft/Reviewed values for this month will be recalculated from current attendance. Finalized/Paid payroll is protected.",
      "question"
    );
    if (!result.isConfirmed) return;

    setGenerating(true);
    try {
      const response = await attendancePost("payroll/generate", {
        month: monthKey,
        workingDays: Number(workingDays),
        scopeType: effectiveScopeType,
        schoolId: effectiveSchoolId,
      });
      setRun(response.data.run);
      showSwalAlert("Success!", response.data.message, "success");
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setGenerating(false);
    }
  };

  const updateLocalItem = (itemId, field, value) => {
    setRun((current) => ({
      ...current,
      items: (current?.items || []).map((item) => {
        if (item._id !== itemId) return item;
        const next = { ...item, [field]: value };
        const allowance = Number(next.manualAllowance || 0);
        const deduction = Number(next.manualDeduction || 0);
        next.netSalary =
          Number(next.grossSalary || 0) -
          Number(next.attendanceDeduction || 0) +
          allowance -
          deduction;
        return next;
      }),
    }));
  };

  const saveItem = async (item) => {
    setSavingItemId(item._id);
    try {
      const response = await attendancePatch(`payroll/${run._id}/items/${item._id}`, {
        manualAllowance: Number(item.manualAllowance || 0),
        manualDeduction: Number(item.manualDeduction || 0),
        remarks: item.remarks || "",
      });
      setRun(response.data.run);
      showSwalAlert("Success!", response.data.message, "success");
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setSavingItemId("");
    }
  };

  const updateStatus = async (status) => {
    const message =
      status === "Finalized"
        ? "After finalization, salary items cannot be edited."
        : status === "Paid"
          ? "This will mark the finalized payroll as paid."
          : "";
    const result = await showConfirmationSwalAlert(`${status} Payroll?`, message, "question");
    if (!result.isConfirmed) return;

    try {
      const response = await attendancePatch(`payroll/${run._id}/status`, {
        status,
        paymentMethod: status === "Paid" ? paymentMethod : undefined,
        paymentReference: status === "Paid" ? paymentReference : undefined,
        remarks: payrollRemarks,
      });
      setRun(response.data.run);
      showSwalAlert("Success!", response.data.message, "success");
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    }
  };

  const totals = useMemo(() => {
    const result = { gross: 0, deduction: 0, allowance: 0, manualDeduction: 0, net: 0 };
    (run?.items || []).forEach((item) => {
      result.gross += Number(item.grossSalary || 0);
      result.deduction += Number(item.attendanceDeduction || 0);
      result.allowance += Number(item.manualAllowance || 0);
      result.manualDeduction += Number(item.manualDeduction || 0);
      result.net += Number(item.netSalary || 0);
    });
    return result;
  }, [run]);

  const editable = run && !["Finalized", "Paid"].includes(run.status);

  return (
    <div className="space-y-4">
      <AttendancePanel
        title="Payroll"
        subtitle="Payroll uses staff salary, explicit absence/half-day and approved unpaid leave. Missing attendance is never silently deducted."
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          {access.isSuperAdmin ? (
            <div>
              <FieldLabel>{tr("Staff Scope")}</FieldLabel>
              <SelectInput value={staffScopeType} onChange={(e) => setStaffScopeType(e.target.value)}>
                <option value="HQ">{tr("HQ")}</option>
                <option value="NISWAN">{tr("Niswan")}</option>
              </SelectInput>
            </div>
          ) : null}

          {access.isSuperAdmin && effectiveScopeType === "NISWAN" ? (
            <div className="lg:col-span-2">
              <FieldLabel>{tr("Select Niswan")}</FieldLabel>
              <SelectInput value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
                <option value="">{tr("Select Niswan")}</option>
                {meta.schools
                  //.filter((school) => school.code !== meta.hqSchool?.code)
                  .map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.code} : {school.nameEnglish}
                    </option>
                  ))}
              </SelectInput>
            </div>
          ) : null}

          <div>
            <FieldLabel>{tr("Month")}</FieldLabel>
            <Input type="month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} />
          </div>

          <div>
            <FieldLabel>{tr("Working Days")}</FieldLabel>
            <Input
              type="number"
              min="1"
              max="31"
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <PrimaryButton onClick={generate} disabled={!canQuery || generating}>
              {generating ? tr("Generating...") : tr("Generate / Recalculate")}
            </PrimaryButton>
          </div>
        </div>
      </AttendancePanel>

      {loading ? <LoadingBlock /> : null}
      {!loading && !run ? <EmptyBlock text="No payroll draft for the selected month" /> : null}

      {run ? (
        <>
          <AttendancePanel title="Payroll Summary">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>{tr("Status")}:</span>
                <StatusBadge status={run.status} />
                <span>·</span>
                <span>{tr("Working Days")}: {run.workingDays}</span>
              </div>
              <div className="text-xs font-semibold text-slate-600">
                {tr("Staff")}: {run.items?.length || 0}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {[
                ["Gross Salary", totals.gross],
                ["Attendance Deduction", totals.deduction],
                ["Manual Allowance", totals.allowance],
                ["Manual Deduction", totals.manualDeduction],
                ["Net Salary", totals.net],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] text-slate-500">{tr(label)}</div>
                  <div className="mt-1 text-sm font-bold text-blue-700 md:text-base">{formatAmount(value)}</div>
                </div>
              ))}
            </div>
          </AttendancePanel>

          <AttendancePanel title="Payroll Items">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1450px] text-left text-[11px] md:text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-2 py-2">{tr("Staff")}</th>
                    <th className="px-2 py-2">{tr("Role")}</th>
                    <th className="px-2 py-2 text-right">{tr("Salary")}</th>
                    <th className="px-2 py-2 text-right">{tr("Travel Allowance")}</th>
                    <th className="px-2 py-2 text-center">{tr("Recorded Days")}</th>
                    <th className="px-2 py-2 text-center">{tr("Absent")}</th>
                    <th className="px-2 py-2 text-center">{tr("Half Day")}</th>
                    <th className="px-2 py-2 text-center">{tr("Unpaid Leave")}</th>
                    <th className="px-2 py-2 text-center">{tr("Payable Days")}</th>
                    <th className="px-2 py-2 text-right">{tr("Attendance Deduction")}</th>
                    <th className="px-2 py-2">{tr("Manual Allowance")}</th>
                    <th className="px-2 py-2">{tr("Manual Deduction")}</th>
                    <th className="px-2 py-2 text-right">{tr("Net Salary")}</th>
                    <th className="px-2 py-2">{tr("Remarks")}</th>
                    <th className="px-2 py-2">{tr("Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(run.items || []).map((item) => (
                    <tr key={item._id} className="hover:bg-sky-50/40">
                      <td className="px-2 py-2">
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-blue-700">{item.staffCode || "-"}</div>
                      </td>
                      <td className="px-2 py-2">{tr(item.role || "-")}</td>
                      <td className="px-2 py-2 text-right">{formatAmount(item.monthlySalary)}</td>
                      <td className="px-2 py-2 text-right">{formatAmount(item.travellingAllowance)}</td>
                      <td className={`px-2 py-2 text-center font-semibold ${Number(item.attendanceRecordedDays) < Number(run.workingDays) ? "text-amber-600" : "text-slate-700"}`}>
                        {item.attendanceRecordedDays}
                      </td>
                      <td className="px-2 py-2 text-center">{item.absentUnits}</td>
                      <td className="px-2 py-2 text-center">{item.halfDayUnits}</td>
                      <td className="px-2 py-2 text-center">{item.unpaidLeaveUnits}</td>
                      <td className="px-2 py-2 text-center font-semibold text-blue-700">{item.payableDays}</td>
                      <td className="px-2 py-2 text-right text-rose-600">{formatAmount(item.attendanceDeduction)}</td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          min="0"
                          disabled={!editable}
                          value={item.manualAllowance ?? 0}
                          onChange={(e) => updateLocalItem(item._id, "manualAllowance", e.target.value)}
                          className="min-w-[90px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          min="0"
                          disabled={!editable}
                          value={item.manualDeduction ?? 0}
                          onChange={(e) => updateLocalItem(item._id, "manualDeduction", e.target.value)}
                          className="min-w-[90px]"
                        />
                      </td>
                      <td className="px-2 py-2 text-right font-bold text-emerald-700">{formatAmount(item.netSalary)}</td>
                      <td className="px-2 py-2">
                        <Input
                          disabled={!editable}
                          value={item.remarks || ""}
                          onChange={(e) => updateLocalItem(item._id, "remarks", e.target.value)}
                          className="min-w-[150px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        {editable ? (
                          <SecondaryButton onClick={() => saveItem(item)} disabled={savingItemId === item._id}>
                            {savingItemId === item._id ? tr("Saving...") : tr("Save")}
                          </SecondaryButton>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 rounded-md bg-amber-50 p-2 text-[11px] text-amber-800">
              {tr("Review Recorded Days before finalizing. Missing/unmarked attendance is shown for review and is not automatically deducted.")}
            </div>
          </AttendancePanel>

          <AttendancePanel title="Payroll Workflow">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <FieldLabel>{tr("Payroll Remarks")}</FieldLabel>
                <TextArea rows={2} value={payrollRemarks} onChange={(e) => setPayrollRemarks(e.target.value)} />
              </div>
              {run.status === "Finalized" || run.status === "Paid" ? (
                <>
                  <div>
                    <FieldLabel>{tr("Payment Method")}</FieldLabel>
                    <SelectInput value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={run.status === "Paid"}>
                      {["Bank Transfer", "Cash", "Other"].map((method) => (
                        <option key={method} value={method}>{tr(method)}</option>
                      ))}
                    </SelectInput>
                  </div>
                  <div>
                    <FieldLabel>{tr("Payment Reference")}</FieldLabel>
                    <Input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} disabled={run.status === "Paid"} />
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {run.status === "Draft" ? (
                <SecondaryButton onClick={() => updateStatus("Reviewed")}>{tr("Mark Reviewed")}</SecondaryButton>
              ) : null}
              {run.status === "Reviewed" ? (
                <PrimaryButton onClick={() => updateStatus("Finalized")}>{tr("Finalize Payroll")}</PrimaryButton>
              ) : null}
              {run.status === "Finalized" ? (
                <PrimaryButton onClick={() => updateStatus("Paid")}>{tr("Mark Paid")}</PrimaryButton>
              ) : null}
              {run.status === "Paid" ? <StatusBadge status="Paid" /> : null}
            </div>
          </AttendancePanel>
        </>
      ) : null}
    </div>
  );
};

export default PayrollTab;
