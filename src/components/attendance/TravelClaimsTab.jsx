import * as XLSX from "xlsx";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { taText, TA_PHRASES } from "../../i18n/travelAllowanceTranslations";
import { taRequest } from "../../api/travelClaimApi";
import { AttendancePanel, PrimaryButton, SecondaryButton, DangerButton, Input, TextArea, currentMonthKey } from "./AttendanceCommon";

const statuses = ["Submitted", "Approved", "Rejected"];
const locales = { en: "en-IN", ta: "ta-IN", ur: "ur-IN", ar: "ar", ml: "ml-IN", kn: "kn-IN", te: "te-IN" };
const blank = (monthKey) => ({ monthKey, amount: "", description: "" });

export default function TravelClaimsTab({ review = false }) {
  const { user } = useAuth();
  const { language, tr, direction } = useLanguage();
  const tt = (key) => {
    const label = ({ hqadmin: "HQ Admin", hquser: "HQ User", hqstaff: "HQ Staff", accountant: "Accountant", supervisor: "Supervisor" })[key] || key;
    return TA_PHRASES[label] ? taText(label, language) : tr(label);
  };
  const money = (paise) => new Intl.NumberFormat(locales[language] || "en-IN", { style: "currency", currency: "INR" }).format(Number(paise || 0) / 100);
  const [meta, setMeta] = useState(null), [claims, setClaims] = useState([]), [claim, setClaim] = useState(null), [report, setReport] = useState(null);
  const [monthKey, setMonth] = useState(currentMonthKey), [status, setStatus] = useState(""), [category, setCategory] = useState(""), [search, setSearch] = useState("");
  const [view, setView] = useState("requests"), [page, setPage] = useState(1), [cursor, setCursor] = useState(""), [previous, setPrevious] = useState([]), [nextCursor, setNextCursor] = useState(null);
  const [form, setForm] = useState(() => blank(currentMonthKey())), [editing, setEditing] = useState(false), [files, setFiles] = useState([]), [kept, setKept] = useState([]);
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState(""), [message, setMessage] = useState(""), [reload, setReload] = useState(0);
  const [reason, setReason] = useState(""), [confirmation, setConfirmation] = useState(null);
  const working = useRef(false), alive = useRef(true), detailsRequest = useRef(0), upload = useRef(null), requestKey = useRef("");
  const blocked = busy || Boolean(confirmation);
  const reportError = (failure) => setError((failure?.response?.data?.code?.startsWith("TA_") ? failure.response.data.code : null) || ({ 401: "Session expired. Please login again.", 403: "TA_FORBIDDEN", 404: "TA_NOT_FOUND", 413: "TA_INVALID_FILE" }[failure?.response?.status]) || "TA_UNAVAILABLE");
  useEffect(() => { alive.current = true; return () => { alive.current = false; detailsRequest.current += 1; }; }, []);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(""); setClaims([]); setReport(null);
    (async () => {
      try {
        const access = await taRequest("GET", "/meta", undefined, { signal: controller.signal });
        if (!alive.current || controller.signal.aborted) return;
        setMeta(access.data);
        if (review ? !access.data.canReview : !access.data.canViewOwn) return;
        const params = { monthKey, status: status === "Not submitted" ? "" : status, category, search, before: cursor };
        const [records, monthly] = await Promise.all([
          taRequest("GET", review ? "/review" : "/mine", undefined, { params, signal: controller.signal }),
          review ? taRequest("GET", "/monthly-report", undefined, { params: { monthKey, status, category, search, page }, signal: controller.signal }) : Promise.resolve(null),
        ]);
        if (!alive.current || controller.signal.aborted) return;
        setClaims(records.data.claims); setNextCursor(records.data.nextCursor); setReport(monthly?.data || null);
      } catch (failure) { if (!controller.signal.aborted && alive.current) reportError(failure); }
      finally { if (!controller.signal.aborted && alive.current) setLoading(false); }
    })(); return () => controller.abort();
  }, [review, monthKey, status, category, search, cursor, page, reload]);
  useEffect(() => { setClaim(null); setEditing(false); setConfirmation(null); setView("requests"); setStatus(""); }, [review]);
  const resetPages = () => { setCursor(""); setPrevious([]); setPage(1); setClaim(null); detailsRequest.current += 1; };
  const choose = async (record) => {
    if (working.current) return;
    const sequence = ++detailsRequest.current; setBusy(true); setClaim(null); setError(""); setMessage(""); setReason("");
    try {
      const result = await taRequest("GET", `/${record.claimId || record._id}`);
      if (alive.current && sequence === detailsRequest.current) setClaim(result.data.claim);
    } catch (failure) { if (alive.current && sequence === detailsRequest.current) reportError(failure); }
    finally { if (alive.current && sequence === detailsRequest.current) setBusy(false); }
  };
  const start = (existing = null) => {
    detailsRequest.current += 1; setClaim(existing); setForm(existing ? { monthKey: existing.monthKey, amount: (existing.requestedAmountPaise / 100).toFixed(2), description: existing.description } : blank(monthKey));
    setKept(existing?.evidence || []); setFiles([]); setEditing(true); setError(""); setMessage(""); upload.current = null; requestKey.current = window.crypto.randomUUID();
  };
  const finish = (record) => { setClaim(record); setEditing(false); setConfirmation(null); setMessage("TA changes saved."); setReload((n) => n + 1); };
  const execute = async (action) => {
    if (working.current) return;
    working.current = true; setBusy(true); setError(""); setMessage(""); setConfirmation(null);
    try { await action(); } catch (failure) { if (alive.current) reportError(failure); }
    finally { working.current = false; if (alive.current) setBusy(false); }
  };
  const submit = () => execute(async () => {
    // Preparation is idempotent and also reconciles an upload/submit timeout.
    const prepared = await taRequest("POST", "/uploads", { requestKey: requestKey.current, monthKey: form.monthKey, ...(claim ? { claimId: claim._id } : {}) });
    upload.current = prepared.data.upload;
    if (upload.current.submittedClaimId) {
      const saved = await taRequest("GET", `/${upload.current.submittedClaimId}`); if (alive.current) finish(saved.data.claim); return;
    }
    const desired = new Set(files.map((entry) => entry.key));
    for (const staged of upload.current.files) if (!desired.has(staged.uploadKey)) {
      const result = await taRequest("DELETE", `/uploads/${upload.current._id}/files/${staged._id}`, { revision: upload.current.revision }); upload.current = result.data.upload;
    }
    for (const entry of files) if (!upload.current.files.some((file) => file.uploadKey === entry.key)) {
      const data = new FormData(); data.append("file", entry.file); data.append("uploadKey", entry.key); data.append("revision", String(upload.current.revision)); data.append("originalName", entry.file.name);
      const result = await taRequest("POST", `/uploads/${upload.current._id}/files`, data); upload.current = result.data.upload;
    }
    const result = await taRequest("POST", "/submit", { ...form, uploadSessionId: upload.current._id, requestKey: requestKey.current,
      sessionRevision: upload.current.revision, fileKeys: files.map((entry) => entry.key), keptEvidenceIds: kept.map((file) => file._id), ...(claim ? { claimRevision: claim.revision } : {}) });
    if (alive.current) finish(result.data.claim);
  });
  const decide = (decision) => execute(async () => {
    const result = await taRequest("POST", `/${claim._id}/decision`, { revision: claim.revision, decision, reason }); if (alive.current) finish(result.data.claim);
  });
  const selectFiles = (event) => {
    const additions = Array.from(event.target.files || []); event.target.value = "";
    if (files.length + kept.length + additions.length > 5) { setError("TA_EVIDENCE_LIMIT"); return; }
    if (additions.some((file) => file.size <= 0 || file.size > 3 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type))) { setError("TA_INVALID_FILE"); return; }
    setFiles((value) => [...value, ...additions.map((file) => ({ key: window.crypto.randomUUID(), file }))]); setError("");
  };
  const download = (file) => execute(async () => {
    const result = await taRequest("GET", `/${claim._id}/evidence/${file._id}`, undefined, { responseType: "blob" });
    const url = URL.createObjectURL(result.data), link = document.createElement("a"); link.href = url; link.download = file.name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const exportReport = () => execute(async () => {
    const result = await taRequest("GET", "/monthly-report/export", undefined, { params: { monthKey, status, category, search } });
    const columns = ["Month", "Name", "Employee ID", "Supervisor ID", "Role", "Status", "Requested Amount", "Approved Amount", "Claim Count"];
    const data = result.data.rows.map((row) => [row.monthKey, row.name, row.employeeId, row.supervisorId, tt(row.role), tt(row.status), row.requestedAmountPaise / 100, row.approvedAmountPaise / 100, row.claimCount]);
    // aoa_to_sheet stores text as string cells, including names starting with '='.
    const sheet = XLSX.utils.aoa_to_sheet([columns.map(tt), ...data]); const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "TA"); XLSX.writeFile(book, `TA-${monthKey}.xlsx`);
  });
  const own = claim && String(claim.userId) === String(user?._id);
  const canDecide = review && meta?.canApprove && claim?.status === "Submitted" && !own;
  const askSubmit = (event) => { event.preventDefault(); if (!kept.length && !files.length) { setError("TA_EVIDENCE_REQUIRED"); return; } setConfirmation({ run: submit }); };
  const fieldDisabled = blocked || Boolean(upload.current); // A started upload is bound to its month.
  const showRoster = review && (view === "register" || status === "Not submitted");
  return <div className="space-y-4" dir={direction}>
    <AttendancePanel title={tt(review ? "TA Approvals" : "My TA Claims")} subtitle={tt("Monthly TA is paid once through payroll after approval.")}>
      <div className="flex flex-wrap items-end gap-3">
        <label>{tt("Month")}<Input aria-label={tt("Filter Month")} type="month" value={monthKey} disabled={blocked || editing} onChange={(e) => { setMonth(e.target.value); resetPages(); }} dir="ltr" /></label>
        <label>{tt("Status")}<select aria-label={tt("Status")} className="block rounded border p-2" value={status} disabled={blocked || editing} onChange={(e) => { setStatus(e.target.value); resetPages(); }}><option value="">{tt("All")}</option>{[...statuses, ...(review ? ["Not submitted"] : [])].map((value) => <option key={value} value={value}>{tt(value)}</option>)}</select></label>
        {review && <><label>{tt("Category")}<select aria-label={tt("Category")} className="block rounded border p-2" value={category} disabled={blocked || editing} onChange={(e) => { setCategory(e.target.value); resetPages(); }}><option value="">{tt("All")}</option>{["Employee", "Supervisor"].map((value) => <option key={value} value={value}>{tt(value)}</option>)}</select></label>
          <label>{tt("Search")}<Input aria-label={tt("Search")} value={search} maxLength={100} disabled={blocked || editing} onChange={(e) => { setSearch(e.target.value); resetPages(); }} /></label>
          <SecondaryButton type="button" disabled={blocked || editing || loading} onClick={() => { setView((value) => value === "requests" ? "register" : "requests"); resetPages(); }}>{tt(showRoster ? "TA Requests" : "Monthly Register")}</SecondaryButton>
          <SecondaryButton type="button" disabled={blocked || editing || loading || !meta?.canReview} onClick={exportReport}>{tt("Export Excel")}</SecondaryButton></>}
        <SecondaryButton type="button" disabled={blocked || editing || loading} onClick={() => { resetPages(); setReload((n) => n + 1); }}>{tt("Refresh")}</SecondaryButton>
        {!review && meta?.canManageOwn && <PrimaryButton disabled={blocked || editing || loading} onClick={() => start()}>{tt("New TA Claim")}</PrimaryButton>}
      </div>
      {review && report && <><div className="my-4 flex flex-wrap gap-4" aria-label={tt("Monthly Summary")}>{[["Eligible Staff", "eligible"], ["Submitted", "submitted"], ["Approved", "approved"], ["Rejected", "rejected"], ["Not submitted", "notSubmitted"]].map(([label, key]) => <span key={key}>{tt(label)}: <strong>{report.summary[key]}</strong></span>)}</div><p className="text-xs text-slate-500">{tt("Register counts use current active eligible HQ staff.")}</p></>}
      {loading && <p role="status">{tt("Loading...")}</p>}
      {!loading && meta && (review ? !meta.canReview : !meta.canViewOwn) && <p role="alert">{tt("TA_FORBIDDEN")}</p>}
      {!loading && showRoster && report && <div className="mt-3 overflow-x-auto"><table className="w-full text-start text-sm"><thead><tr>{["Name", "Employee ID", "Supervisor ID", "Role", "Status", "Requested Amount", "Approved Amount"].map((label) => <th className="p-2 text-start" key={label}>{tt(label)}</th>)}</tr></thead><tbody>{report.rows.map((row) => <tr key={`${row.staffType}:${row.staffId}`} className="border-t"><td className="p-2">{row.claimId ? <button disabled={blocked || editing} type="button" onClick={() => choose(row)} className="text-blue-700 underline"><bdi>{row.name}</bdi></button> : <bdi>{row.name}</bdi>}</td><td><bdi>{row.employeeId || "—"}</bdi></td><td><bdi>{row.supervisorId || "—"}</bdi></td><td>{tt(row.role)}</td><td>{tt(row.status)}</td><td>{money(row.requestedAmountPaise)}</td><td>{money(row.approvedAmountPaise)}</td></tr>)}</tbody></table>{report.rows.length === 0 && <p>{tt("No TA claims found.")}</p>}</div>}
      {!loading && !showRoster && <div className="mt-4 grid gap-3 md:grid-cols-2">{claims.map((record) => <button type="button" disabled={blocked || editing} key={record._id} onClick={() => choose(record)} className="rounded border p-3 text-start disabled:opacity-60"><bdi className="break-all text-xs text-blue-700">{record.claimNumber}</bdi>{review && <><div><bdi>{record.name}</bdi></div><div className="text-xs">{tt("Employee ID")}: <bdi>{record.employeeId || "—"}</bdi> · {tt("Supervisor ID")}: <bdi>{record.supervisorId || "—"}</bdi></div><div>{tt(record.role || record.staffType)}</div></>}<div><bdi>{record.monthKey}</bdi> · {tt(record.status)} · {money(record.requestedAmountPaise)}</div><div className="text-xs">{tt("Submitted On")}: <bdi>{record.submittedAt ? new Date(record.submittedAt).toLocaleDateString(locales[language] || "en-IN") : "—"}</bdi></div></button>)}{claims.length === 0 && <p>{tt("No TA claims found.")}</p>}</div>}
      <div className="mt-3 flex gap-2"><SecondaryButton type="button" disabled={blocked || editing || loading || (showRoster ? page <= 1 : previous.length === 0)} onClick={() => { setClaim(null); if (showRoster) setPage((n) => n - 1); else { setCursor(previous.at(-1)); setPrevious((value) => value.slice(0, -1)); } }}>{tt("Previous")}</SecondaryButton><SecondaryButton type="button" disabled={blocked || editing || loading || (showRoster ? !report || page * 25 >= report.total : !nextCursor)} onClick={() => { setClaim(null); if (showRoster) setPage((n) => n + 1); else { setPrevious((value) => [...value, cursor]); setCursor(nextCursor); } }}>{tt("Next")}</SecondaryButton></div>
    </AttendancePanel>
    {error && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">{tt(error)}</p>}
    {message && <p role="status" className="text-green-700">{tt(message)}</p>}
    {editing && <AttendancePanel title={tt(claim ? "Resubmit Claim" : "New TA Claim")}><form onSubmit={askSubmit} className="space-y-3">
      <div><bdi>{meta?.actor?.name || user?.name}</bdi> · {tt("Employee ID")}: <bdi>{meta?.actor?.employeeId || "—"}</bdi> · {tt("Supervisor ID")}: <bdi>{meta?.actor?.supervisorId || "—"}</bdi></div>
      <label className="block">{tt("Month")}<Input aria-label={tt("Claim Month")} required type="month" value={form.monthKey} disabled={fieldDisabled || Boolean(claim)} onChange={(e) => setForm((value) => ({ ...value, monthKey: e.target.value }))} dir="ltr" /></label>
      <label className="block">{tt("TA Amount (INR)")}<Input aria-label={tt("TA Amount (INR)")} required type="number" step="0.01" min="0.01" max="10000000" value={form.amount} disabled={blocked} onChange={(e) => setForm((value) => ({ ...value, amount: e.target.value }))} dir="ltr" /></label>
      <label className="block">{tt("Description")}<TextArea aria-label={tt("Description")} required maxLength={2000} value={form.description} disabled={blocked} onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))} dir="auto" /></label>
      <label className="block">{tt("Supporting Evidence")}<input aria-label={tt("Upload Evidence")} type="file" accept="application/pdf,image/jpeg,image/png" multiple disabled={blocked} onChange={selectFiles} className="block" /></label><p className="text-xs">{tt("PDF, JPG or PNG; up to 3 MiB each, 5 active files per claim.")}</p>
      {[...kept.map((file) => ({ id: file._id, name: file.name, retained: true })), ...files.map((entry) => ({ id: entry.key, name: entry.file.name }))].map((file) => <div className="flex items-center gap-3" key={file.id}><bdi>{file.name}</bdi><SecondaryButton type="button" disabled={blocked} onClick={() => file.retained ? setKept((value) => value.filter((item) => item._id !== file.id)) : setFiles((value) => value.filter((item) => item.key !== file.id))}>{tt("Remove")}</SecondaryButton></div>)}
      <div className="flex gap-3"><PrimaryButton type="submit" disabled={blocked}>{tt(claim ? "Resubmit Claim" : "Submit Claim")}</PrimaryButton><SecondaryButton type="button" disabled={blocked} onClick={() => { setEditing(false); setFiles([]); upload.current = null; }}>{tt("Cancel")}</SecondaryButton></div>
    </form></AttendancePanel>}
    {claim && !editing && <AttendancePanel title={tt("Claim Number")} subtitle={claim.claimNumber}>
      <div><bdi>{claim.name}</bdi> · {tt("Employee ID")}: <bdi>{claim.employeeId || "—"}</bdi> · {tt("Supervisor ID")}: <bdi>{claim.supervisorId || "—"}</bdi> · {tt(claim.role || claim.staffType)}</div>
      <p><bdi>{claim.monthKey}</bdi> · {tt(claim.status)} · {money(claim.requestedAmountPaise)}</p><p className="whitespace-pre-wrap" dir="auto">{claim.description}</p>
      {claim.decisionReason && <p className="mt-2 whitespace-pre-wrap" dir="auto">{tt("Decision Reason")}: {claim.decisionReason}</p>}
      {claim.payrollMonth && <p>{tt("Payroll Month")}: <bdi>{claim.payrollMonth}</bdi></p>}{claim.paidAt && <p>{tt("Payment Date")}: <bdi>{new Date(claim.paidAt).toLocaleDateString(locales[language] || "en-IN")}</bdi></p>}
      <h3 className="mt-3 font-semibold">{tt("Supporting Evidence")}</h3>{claim.evidence.map((file) => <div key={file._id} className="flex gap-3"><bdi>{file.name}</bdi><SecondaryButton type="button" disabled={blocked} onClick={() => download(file)}>{tt("Download")}</SecondaryButton></div>)}
      {!review && own && meta?.canManageOwn && claim.status === "Rejected" && claim.claimVersion === 2 && <SecondaryButton type="button" disabled={blocked} onClick={() => start(claim)}>{tt("Resubmit Claim")}</SecondaryButton>}
      {review && own && claim.status === "Submitted" && <p>{tt("TA_SELF_APPROVAL")}</p>}
      {canDecide && <div className="mt-3 space-y-3"><label className="block">{tt("Decision Reason")}<TextArea aria-label={tt("Decision Reason")} maxLength={1000} value={reason} disabled={blocked} onChange={(e) => setReason(e.target.value)} dir="auto" /></label><div className="flex gap-3"><PrimaryButton disabled={blocked} onClick={() => setConfirmation({ run: () => decide("Approved") })}>{tt("Approve Claim")}</PrimaryButton><DangerButton disabled={blocked} onClick={() => reason.trim() ? setConfirmation({ run: () => decide("Rejected") }) : setError("TA_REJECTION_REASON")}>{tt("Reject Claim")}</DangerButton></div></div>}
      <h3 className="mt-4 font-semibold">{tt("Claim History")}</h3><ul>{claim.history.map((event, index) => <li key={index}><bdi>{new Date(event.at).toLocaleString(locales[language] || "en-IN")}</bdi> · {tt(event.action)}{event.reason && <span dir="auto"> · {event.reason}</span>}</li>)}</ul>
    </AttendancePanel>}
    {confirmation && <div role="dialog" aria-modal="true" aria-label={tt("Confirm TA action?")} className="rounded border border-blue-300 bg-blue-50 p-4"><p>{tt("Confirm TA action?")}</p><div className="mt-3 flex gap-3"><PrimaryButton disabled={busy} onClick={confirmation.run}>{tt("Confirm")}</PrimaryButton><SecondaryButton type="button" disabled={busy} onClick={() => setConfirmation(null)}>{tt("Cancel")}</SecondaryButton></div></div>}
  </div>;
}
