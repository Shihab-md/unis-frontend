import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { taText, TA_PHRASES } from "../../i18n/travelAllowanceTranslations";
import { taRequest } from "../../api/travelClaimApi";
import { AttendancePanel, PrimaryButton, SecondaryButton, DangerButton, Input, TextArea, currentMonthKey } from "./AttendanceCommon";

const empty = () => ({ fromDateKey: "", toDateKey: "", fromPlace: "", toPlace: "", purpose: "", transport: "", expenses: [{ description: "", amount: "" }] });
const toForm = (claim) => ({ ...claim, expenses: claim.expenses.map((e) => ({ description: e.description, amount: (e.amountPaise / 100).toFixed(2) })) });
const statuses = ["Draft", "Submitted", "Returned", "Approved", "PayrollReserved", "Paid", "Rejected", "Cancelled"];
const locales = { en: "en-IN", ta: "ta-IN", ur: "ur-IN", ar: "ar", ml: "ml-IN", kn: "kn-IN", te: "te-IN" };

export default function TravelClaimsTab({ review = false }) {
  const { user } = useAuth();
  const { language, tr, direction } = useLanguage();
  const tt = (key) => TA_PHRASES[key] ? taText(key, language) : tr(key);
  const money = (paise) => new Intl.NumberFormat(locales[language] || "en-IN", { style: "currency", currency: "INR" }).format(Number(paise || 0) / 100);
  const [meta, setMeta] = useState(null), [claims, setClaims] = useState([]), [claim, setClaim] = useState(null);
  const [form, setForm] = useState(empty), [editing, setEditing] = useState(false), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [error, setError] = useState(""), [message, setMessage] = useState(""), [status, setStatus] = useState(review ? "Submitted" : "");
  const [cursor, setCursor] = useState(""), [nextCursor, setNextCursor] = useState(null), [previous, setPrevious] = useState([]), [reload, setReload] = useState(0);
  const [decision, setDecision] = useState({ approvedAmount: "", settlementMonth: currentMonthKey(), reason: "" });
  const [confirmation, setConfirmation] = useState(null);
  const requestKey = useRef(""), working = useRef(false), detailsRequest = useRef(0), alive = useRef(true);
  const fileInput = useRef(null);
  const reportError = (failure) => setError((failure?.response?.data?.code?.startsWith("TA_") ? failure.response.data.code : null) || ({ 401: "Session expired. Please login again.", 403: "TA_FORBIDDEN", 404: "TA_NOT_FOUND", 413: "TA_INVALID_FILE" }[failure?.response?.status]) || "TA_UNAVAILABLE");
  useEffect(() => { alive.current = true; return () => { alive.current = false; detailsRequest.current += 1; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    (async () => {
      try {
        const access = await taRequest("GET", "/meta", undefined, { signal: controller.signal });
        if (!alive.current || controller.signal.aborted) return;
        setMeta(access.data);
        if (review ? !access.data.canReview : !access.data.canViewOwn) { setClaims([]); return; }
        const data = await taRequest("GET", review ? "/review" : "/mine", undefined, { params: { status, before: cursor }, signal: controller.signal });
        if (!alive.current || controller.signal.aborted) return;
        setClaims(data.data.claims); setNextCursor(data.data.nextCursor);
      } catch (failure) { if (!controller.signal.aborted && alive.current) reportError(failure); }
      finally { if (!controller.signal.aborted && alive.current) setLoading(false); }
    })();
    return () => controller.abort();
  }, [review, status, cursor, reload]);
  useEffect(() => { setClaim(null); setEditing(false); setConfirmation(null); setCursor(""); setPrevious([]); setStatus(review ? "Submitted" : ""); }, [review]);

  const choose = async (record) => {
    if (working.current) return;
    const sequence = ++detailsRequest.current;
    setClaim(null); setEditing(false); setConfirmation(null); setError(""); setMessage(""); setBusy(true);
    try {
      const data = await taRequest("GET", `/${record._id}`);
      if (!alive.current || sequence !== detailsRequest.current) return;
      setClaim(data.data.claim); setDecision({ approvedAmount: (data.data.claim.requestedAmountPaise / 100).toFixed(2), settlementMonth: currentMonthKey(), reason: "" });
    } catch (failure) { if (alive.current && sequence === detailsRequest.current) reportError(failure); }
    finally { if (alive.current && sequence === detailsRequest.current) setBusy(false); }
  };
  const perform = async (method, path, data) => {
    if (working.current) return;
    working.current = true; setBusy(true); setError(""); setMessage(""); setConfirmation(null);
    try {
      const result = await taRequest(method, path, data);
      if (!alive.current) return;
      setClaim(result.data.claim); setEditing(false); setMessage("TA changes saved."); setReload((n) => n + 1);
    } catch (failure) { if (alive.current) reportError(failure); }
    finally { working.current = false; if (alive.current) setBusy(false); }
  };
  const ask = (callback, label = "Confirm TA action?") => setConfirmation({ run: callback, label });
  const own = claim && String(claim.userId) === String(user?._id);
  const editable = own && meta?.canManageOwn && ["Draft", "Returned"].includes(claim.status);
  const canDecide = review && meta?.canApprove && claim?.status === "Submitted" && !own;
  const field = (key, label, type = "text", maxLength = 200) => (
    <label className="block text-xs text-slate-600" key={key}>{tt(label)}
      <Input aria-label={tt(label)} type={type} maxLength={maxLength} value={form[key]} disabled={busy || Boolean(confirmation)}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} dir={type === "date" ? "ltr" : "auto"} />
    </label>
  );

  const uploadEvidence = async (file) => {
    if (!file || busy || !claim) return;
    if (file.size > 3 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) { setError("TA_INVALID_FILE"); return; }
    const data = new FormData(); data.append("file", file); data.append("uploadKey", window.crypto.randomUUID()); data.append("revision", String(claim.revision)); data.append("originalName", file.name);
    await perform("POST", `/${claim._id}/evidence`, data);
  };
  const downloadEvidence = async (file) => {
    if (working.current) return;
    working.current = true; setBusy(true); setError("");
    try {
      const result = await taRequest("GET", `/${claim._id}/evidence/${file._id}`, undefined, { responseType: "blob" });
      const url = URL.createObjectURL(result.data); const link = document.createElement("a"); link.href = url; link.download = file.name;
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) {
      if (alive.current) {
        try { const body = JSON.parse(await failure.response.data.text()); setError(body.code || "TA_UNAVAILABLE"); }
        catch { setError("TA_UNAVAILABLE"); }
      }
    } finally { working.current = false; if (alive.current) setBusy(false); }
  };

  return <div className="space-y-4" dir={direction}>
    <AttendancePanel title={tt(review ? "TA Approvals" : "My TA Claims")} subtitle={tt("Approved claims are paid once through payroll. Fixed TA is no longer added.")}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-600">{tr("Status")}
          <select aria-label={tr("Status")} value={status} disabled={busy || editing || Boolean(confirmation)} className="block rounded border p-2" onChange={(e) => { setConfirmation(null); setStatus(e.target.value); setCursor(""); setPrevious([]); }}>
            <option value="">{tr("All")}</option>{statuses.map((value) => <option key={value} value={value}>{tt(value) === value ? tr(value) : tt(value)}</option>)}
          </select>
        </label>
        <SecondaryButton disabled={busy || editing || Boolean(confirmation) || loading} onClick={() => { setClaim(null); setEditing(false); setConfirmation(null); setReload((n) => n + 1); }}>{tr("Refresh")}</SecondaryButton>
        {!review && meta?.canManageOwn && <PrimaryButton disabled={busy || editing || Boolean(confirmation)} onClick={() => { detailsRequest.current += 1; setClaim(null); setForm(empty()); setEditing(true); setError(""); setMessage(""); requestKey.current = window.crypto.randomUUID(); }}>{tt("New TA Claim")}</PrimaryButton>}
      </div>
      {loading && <p role="status" className="mt-3">{tr("Loading...")}</p>}
      {!loading && meta && (review ? !meta.canReview : !meta.canViewOwn) && <p role="alert" className="mt-3 text-red-700">{tt("TA_FORBIDDEN")}</p>}
      {!loading && claims.length === 0 && <p className="mt-3 text-slate-500">{tt("No TA claims found.")}</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{claims.map((record) => <button type="button" key={record._id} onClick={() => choose(record)} disabled={busy || editing || Boolean(confirmation)}
        className="min-w-0 rounded-lg border bg-slate-50 p-3 text-start hover:border-blue-600 disabled:opacity-60">
        <div className="break-all text-xs font-semibold text-blue-700"><bdi>{record.claimNumber}</bdi></div>
        {review && <div className="mt-1 font-semibold"><bdi>{record.name}</bdi> <bdi className="text-xs text-slate-500">{record.staffCode}</bdi></div>}
        <div className="mt-2 text-xs">{tt(record.status) === record.status ? tr(record.status) : tt(record.status)}</div>
        <div className="mt-2 font-bold">{money(record.requestedAmountPaise)}</div>
        <div className="mt-1 text-xs text-slate-500"><bdi>{record.fromDateKey}</bdi> / <bdi>{record.toDateKey}</bdi></div>
      </button>)}</div>
      <div className="mt-4 flex gap-2">
        <SecondaryButton disabled={busy || editing || Boolean(confirmation) || !previous.length} onClick={() => { setCursor(previous.at(-1)); setPrevious((rows) => rows.slice(0, -1)); }}>{tr("Previous")}</SecondaryButton>
        <SecondaryButton disabled={busy || editing || Boolean(confirmation) || !nextCursor} onClick={() => { setPrevious((rows) => [...rows, cursor]); setCursor(nextCursor); }}>{tr("Next")}</SecondaryButton>
      </div>
    </AttendancePanel>
    {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{tt(error)}</p>}
    {message && <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-800">{tt(message)}</p>}
    {editing && <AttendancePanel title={tt(claim ? "Edit" : "New TA Claim")}>
      <form noValidate onSubmit={(e) => { e.preventDefault(); perform(claim ? "PATCH" : "POST", claim ? `/${claim._id}` : "/", { ...form, revision: claim?.revision, requestKey: requestKey.current }); }}>
        <fieldset disabled={busy || Boolean(confirmation)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">{field("fromDateKey", "Journey Start", "date")}{field("toDateKey", "Journey End", "date")}{field("fromPlace", "From Place")}{field("toPlace", "To Place")}{field("transport", "Transport Mode", "text", 100)}</div>
          <label className="block text-xs text-slate-600">{tt("Travel Purpose")}<TextArea aria-label={tt("Travel Purpose")} dir="auto" maxLength={1000} value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} /></label>
          {form.expenses.map((expense, index) => <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto] items-end" key={index}>
            <label className="text-xs text-slate-600">{tt("Expense Description")}<Input dir="auto" aria-label={`${tt("Expense Description")} ${index + 1}`} maxLength={200} value={expense.description} onChange={(e) => setForm((f) => ({ ...f, expenses: f.expenses.map((row, i) => i === index ? { ...row, description: e.target.value } : row) }))} /></label>
            <label className="text-xs text-slate-600">{tr("Amount")} (INR)<Input dir="ltr" aria-label={`${tr("Amount")} ${index + 1}`} inputMode="decimal" maxLength={11} value={expense.amount} onChange={(e) => setForm((f) => ({ ...f, expenses: f.expenses.map((row, i) => i === index ? { ...row, amount: e.target.value } : row) }))} /></label>
            <DangerButton type="button" disabled={form.expenses.length === 1} onClick={() => setForm((f) => ({ ...f, expenses: f.expenses.filter((_, i) => i !== index) }))}>{tt("Remove Expense")}</DangerButton>
          </div>)}
          <SecondaryButton type="button" disabled={form.expenses.length >= 20} onClick={() => setForm((f) => ({ ...f, expenses: [...f.expenses, { description: "", amount: "" }] }))}>{tt("Add Expense")}</SecondaryButton>
          <div className="flex flex-wrap gap-2"><PrimaryButton type="submit">{tt("Save Draft")}</PrimaryButton><SecondaryButton type="button" onClick={() => setEditing(false)}>{tr("Cancel")}</SecondaryButton></div>
        </fieldset>
      </form>
    </AttendancePanel>}
    {claim && !editing && <>
      <AttendancePanel title={tt("Claim Number")}>
        <div className="break-all font-semibold text-blue-700"><bdi>{claim.claimNumber}</bdi></div>
        <div className="mt-2"><bdi>{claim.name}</bdi> <bdi>{claim.staffCode}</bdi></div>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          {[["Status", tt(claim.status) === claim.status ? tr(claim.status) : tt(claim.status)], ["Journey Start", claim.fromDateKey], ["Journey End", claim.toDateKey], ["From Place", claim.fromPlace], ["To Place", claim.toPlace], ["Transport Mode", claim.transport], ["Requested Amount", money(claim.requestedAmountPaise)], ["Approved Amount", money(claim.approvedAmountPaise)], ["Settlement Month", claim.settlementMonth || "-"]].map(([label, value]) => <div key={label}><div className="text-xs text-slate-500">{tt(label) === label ? tr(label) : tt(label)}</div><bdi>{value}</bdi></div>)}
        </div>
        <div className="mt-3 text-xs text-slate-500">{tt("Travel Purpose")}</div><p dir="auto" className="whitespace-pre-wrap break-words">{claim.purpose}</p>
        <ul className="mt-3 divide-y">{claim.expenses.map((row, i) => <li key={i} className="flex justify-between gap-3 py-2 text-sm"><bdi>{row.description}</bdi><bdi>{money(row.amountPaise)}</bdi></li>)}</ul>
        {claim.decisionReason && <div className="mt-3"><div className="text-xs text-slate-500">{tt("Decision Reason")}</div><p dir="auto" className="whitespace-pre-wrap break-words">{claim.decisionReason}</p></div>}
        {claim.payrollMonth && <p className="mt-3 text-sm">{tr("Payroll")}: <bdi>{claim.payrollMonth}</bdi></p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {editable && <SecondaryButton disabled={busy || Boolean(confirmation)} onClick={() => { setForm(toForm(claim)); setEditing(true); }}>{tr("Edit")}</SecondaryButton>}
          {editable && <PrimaryButton disabled={busy || Boolean(confirmation) || !claim.evidence.length} onClick={() => ask(() => perform("POST", `/${claim._id}/status`, { action: "Submit", revision: claim.revision }), "Submit Claim")}>{tt("Submit Claim")}</PrimaryButton>}
          {own && meta?.canManageOwn && ["Draft", "Returned", "Submitted"].includes(claim.status) && <DangerButton disabled={busy || Boolean(confirmation)} onClick={() => ask(() => perform("POST", `/${claim._id}/status`, { action: "Cancel", revision: claim.revision }), "Cancel Claim")}>{tt("Cancel Claim")}</DangerButton>}
        </div>
      </AttendancePanel>
      <AttendancePanel title={tt("Supporting Evidence")} subtitle={tt("PDF, JPG or PNG; up to 3 MiB each, 5 active files per claim.")}>
        {claim.evidence.map((file) => <div key={file._id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm"><bdi className="break-all">{file.name}</bdi><div className="flex gap-2"><SecondaryButton disabled={busy || Boolean(confirmation)} onClick={() => downloadEvidence(file)}>{tr("Download")}</SecondaryButton>{editable && <DangerButton disabled={busy || Boolean(confirmation)} onClick={() => ask(() => perform("DELETE", `/${claim._id}/evidence/${file._id}`, { revision: claim.revision }))}>{tr("Remove")}</DangerButton>}</div></div>)}
        {editable && <div className="mt-3"><input hidden ref={fileInput} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; uploadEvidence(file); }} /><SecondaryButton disabled={busy || Boolean(confirmation) || claim.evidence.length >= 5} onClick={() => fileInput.current?.click()}>{tt("Upload Evidence")}</SecondaryButton></div>}
      </AttendancePanel>
      {canDecide && <AttendancePanel title={tt("TA Approvals")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-600">{tt("Approved Amount")} (INR)<Input aria-label={tt("Approved Amount")} dir="ltr" inputMode="decimal" disabled={busy || Boolean(confirmation)} value={decision.approvedAmount} onChange={(e) => setDecision((d) => ({ ...d, approvedAmount: e.target.value }))} /></label>
          <label className="text-xs text-slate-600">{tt("Settlement Month")}<Input aria-label={tt("Settlement Month")} type="month" dir="ltr" disabled={busy || Boolean(confirmation)} value={decision.settlementMonth} onChange={(e) => setDecision((d) => ({ ...d, settlementMonth: e.target.value }))} /></label>
          <label className="text-xs text-slate-600 sm:col-span-2">{tt("Decision Reason")}<TextArea aria-label={tt("Decision Reason")} dir="auto" maxLength={1000} disabled={busy || Boolean(confirmation)} value={decision.reason} onChange={(e) => setDecision((d) => ({ ...d, reason: e.target.value }))} /></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{[["Approved", "Approve Claim"], ["Returned", "Return for Correction"], ["Rejected", "Reject Claim"]].map(([value, label]) => <SecondaryButton key={value} disabled={busy || Boolean(confirmation)} onClick={() => ask(() => perform("POST", `/${claim._id}/decision`, { ...decision, decision: value, revision: claim.revision }), label)}>{tt(label)}</SecondaryButton>)}</div>
      </AttendancePanel>}
      {review && own && claim.status === "Submitted" && <p className="rounded bg-amber-50 p-3 text-sm">{tt("TA_SELF_APPROVAL")}</p>}
      <AttendancePanel title={tt("Claim History")}><ol className="space-y-2">{claim.history.map((event, index) => <li key={index} className="rounded border p-2 text-xs"><span className="font-semibold">{tt(event.action) === event.action ? tr(event.action) : tt(event.action)}</span> <bdi>{new Date(event.at).toLocaleString(locales[language] || "en-IN", { timeZone: "Asia/Kolkata" })}</bdi>{event.amountPaise > 0 && <span> {money(event.amountPaise)}</span>}{event.reason && <p dir="auto" className="mt-1 break-words whitespace-pre-wrap">{event.reason}</p>}</li>)}</ol></AttendancePanel>
    </>}
    {confirmation && <section role="dialog" aria-modal="false" aria-label={tt("Confirm TA action?")} className="sticky bottom-4 z-10 rounded-xl border-2 border-blue-600 bg-white p-4 shadow-xl"><p className="mb-2 font-semibold">{tt(confirmation.label)}</p><p className="mb-3 break-all text-sm"><bdi>{claim?.claimNumber}</bdi></p><div className="flex gap-2"><PrimaryButton disabled={busy} onClick={() => confirmation.run()}>{tr("Confirm")}</PrimaryButton><SecondaryButton disabled={busy} onClick={() => setConfirmation(null)}>{tr("Cancel")}</SecondaryButton></div></section>}
  </div>;
}
