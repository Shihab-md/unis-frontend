import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { PERMISSIONS } from "../../auth/permissions";
import { attendanceGet } from "../../api/attendanceApi";
import { AttendancePanel, LoadingBlock, getApiError } from "../attendance/AttendanceCommon";
import PayrollTab from "../attendance/PayrollTab";
import TravelClaimsTab from "../attendance/TravelClaimsTab";

export default function AccountsFinancePage({ section = "payroll" }) {
  const { user, can } = useAuth();
  const { tr, direction, fontFamily } = useLanguage();
  const payroll = section === "payroll";
  const financeRole = ["superadmin", "hqadmin", "accountant"].includes(String(user?.role || "").toLowerCase());
  const allowed = financeRole && can(payroll ? PERMISSIONS.PAYROLL_VIEW : PERMISSIONS.TA_REVIEW_VIEW);
  const [meta, setMeta] = useState(null), [loading, setLoading] = useState(payroll), [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setMeta(null); setError(""); setLoading(Boolean(payroll && allowed));
    if (payroll && allowed) (async () => {
      try { const response = await attendanceGet("meta"); if (alive) setMeta(response.data); }
      catch (failure) { if (alive) setError(getApiError(failure)); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [payroll, allowed]);
  return <div className="mx-auto max-w-[1600px] space-y-4 p-3 md:p-7" dir={direction} style={{ fontFamily }}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-lg font-bold text-green-700">{tr("Accounts")} · {tr(payroll ? "Payroll" : "TA Approvals")}</h1>
      <Link to="/dashboard/accountsPage" className="rounded border px-3 py-2 text-sm text-blue-700">{tr("Back to Accounts")}</Link>
    </div>
    {!allowed ? <AttendancePanel title="Accounts"><p role="alert">{tr("This Accounts service is not available for your role or permissions.")}</p></AttendancePanel> :
      payroll ? loading ? <LoadingBlock text="Loading Accounts..." /> : error ? <p role="alert" className="text-red-700">{error}</p> :
        meta?.success && meta?.access?.canManagePayrollGlobally ? <PayrollTab meta={meta} /> : <p role="alert">{tr("This Accounts service is not available for your role or permissions.")}</p> :
      <TravelClaimsTab key="accounts-ta-review" review />}
  </div>;
}
