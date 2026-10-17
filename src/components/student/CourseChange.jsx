import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { PERMISSIONS } from "../../auth/permissions";
import { studentCourseRequest } from "../../api/studentCourseChangeApi";

const slotTypes = { 1: ["Deeniyath Education", "Teacher Training"], 2: ["School Education"], 3: ["College Education"], 4: ["Islamic Home Science"], 5: ["Vocational Courses"] };
const blank = { academicId: "", slot: 1, courseId: "", instituteId: "", year: "", discount: "0", reason: "" };
const style = "block w-full rounded border border-slate-300 bg-white p-2 text-sm disabled:bg-slate-100";
export default function StudentCourseChange() {
  const { id } = useParams(), { user, can } = useAuth(), { tr, direction, language } = useLanguage();
  const allowed = ["superadmin", "hquser"].includes(String(user?.role || "").toLowerCase()) && can(PERMISSIONS.STUDENT_COURSE_CHANGE);
  const [options, setOptions] = useState(null), [form, setForm] = useState(blank), [preview, setPreview] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const working = useRef(false), alive = useRef(true), requestKey = useRef("");
  const money = (paise) => new Intl.NumberFormat(({ en:"en-IN",ta:"ta-IN",ur:"ur-IN",ar:"ar",ml:"ml-IN",kn:"kn-IN",te:"te-IN" })[language] || "en-IN", { style:"currency",currency:"INR" }).format(Number(paise || 0) / 100);
  const failure = (e) => setError(e?.response?.data?.code || ({401:"Session expired. Please login again.",403:"SC_FORBIDDEN"}[e?.response?.status]) || "SC_UNAVAILABLE");
  const setSlot = (data, academicId, slot) => {
    const academic = data.academics.find((a) => String(a._id) === academicId);
    setForm({ ...blank, academicId, slot, courseId: academic?.[`courseId${slot}`] || "", instituteId: academic?.[`instituteId${slot}`] || "",
      year: academic?.[`year${slot}`] == null ? "" : String(academic[`year${slot}`]), discount: String(academic?.[`discount${slot}`] || 0) });
    setPreview(null); setError(""); requestKey.current = window.crypto.randomUUID();
  };
  useEffect(() => {
    const controller = new AbortController(); alive.current = true; setLoading(true); setError(""); setOptions(null); setPreview(null);
    if (!allowed) { setLoading(false); return () => { alive.current = false; controller.abort(); }; }
    (async () => {
      try {
        const result = await studentCourseRequest("GET",id,"",undefined,{signal:controller.signal});
        if (controller.signal.aborted || !alive.current) return;
        setOptions(result.data); setSlot(result.data,String(result.data.academics[0]?._id || ""),1);
      } catch(e) { if (!controller.signal.aborted && alive.current) failure(e); }
      finally { if (!controller.signal.aborted && alive.current) setLoading(false); }
    })();
    return () => { controller.abort(); alive.current = false; };
  }, [id, allowed]);
  const changeField = (field,value) => {
    setPreview(null); setError(""); setMessage(""); requestKey.current = window.crypto.randomUUID();
    setForm((previous) => {
      if (field === "courseId") {
        const course = options.courses.find((c) => c._id === value);
        return { ...previous, courseId:value, year:course ? String(course.allowedYears[0] ?? 1) : "", discount:"0", instituteId:value ? previous.instituteId : "" };
      }
      return { ...previous,[field]:value };
    });
  };
  const execute = async (action) => {
    if (working.current) return;
    working.current = true; setBusy(true); setError(""); setMessage("");
    try { await action(); } catch(e) { if (alive.current) failure(e); }
    finally { working.current = false; if (alive.current) setBusy(false); }
  };
  const review = (event) => {
    event.preventDefault();
    execute(async () => { const result=await studentCourseRequest("POST",id,"/preview",{...form,requestKey:requestKey.current});if(alive.current)setPreview(result.data); });
  };
  const save = () => execute(async () => {
    const result = await studentCourseRequest("POST",id,"",{confirmationToken:preview.confirmationToken,acknowledgeFeeDifference:preview.quote.differencePaise!==0});
    if (!alive.current) return;
    setPreview(null); setNeedsRefresh(true); setMessage("Course updated. No invoice was created.");
    // Refresh after a known committed update; no POST is automatically retried.
    try {
      const refreshed=await studentCourseRequest("GET",id);
      if(alive.current){setOptions(refreshed.data);setSlot(refreshed.data,form.academicId,form.slot);setNeedsRefresh(false);setMessage("Course updated. No invoice was created.");}
    } catch { if(alive.current)setError("SC_REFRESH"); }
    return result;
  });
  const academic = options?.academics.find((a)=>String(a._id)===form.academicId), course = options?.courses.find((c)=>String(c._id)===form.courseId);
  const completed = ["alumni","graduated","completed"].includes(String(options?.student.active||"").toLowerCase()) || String(academic?.[`status${form.slot}`]||"").toLowerCase()==="completed";
  const disabled = busy || Boolean(preview) || completed || needsRefresh;
  if(!allowed)return <div role="alert" className="p-4 text-red-700" dir={direction}>{tr("SC_FORBIDDEN")}</div>;
  return <div className="mx-auto max-w-5xl space-y-4 p-4" dir={direction}>
    <Link className="text-blue-700 underline" to={`/dashboard/students/${id}`}>{tr("Back to Student")}</Link>
    <h2 className="text-xl font-bold">{tr("Change Student Course")}</h2>
    <p className="text-sm text-slate-600">{tr("Review the old and new fees before saving. Existing invoices and payments are retained.")}</p>
    {loading&&<p role="status">{tr("Loading...")}</p>}
    {error&&<p role="alert" className="rounded border bg-red-50 p-3 text-red-800">{tr(error)}</p>}
    {message&&<p role="status" className="text-green-700">{tr(message)}</p>}
    {options&&<>
      <p><bdi>{options.student.name}</bdi> · <bdi>{options.student.rollNumber}</bdi> · <bdi>{options.student.school.code} - {options.student.school.nameEnglish}</bdi></p>
      <form onSubmit={review} className="space-y-4 rounded border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label>{tr("Academic Year")}<select aria-label={tr("Academic Year")} className={style} value={form.academicId} disabled={busy||Boolean(preview)||needsRefresh} required onChange={(e)=>setSlot(options,e.target.value,form.slot)}><option value="">{tr("Select")}</option>{options.academics.map((a)=><option key={a._id} value={a._id}>{a.acYear?.acYear||"—"}</option>)}</select></label>
          <label>{tr("Course Slot")}<select aria-label={tr("Course Slot")} className={style} value={form.slot} disabled={busy||Boolean(preview)||needsRefresh} onChange={(e)=>setSlot(options,form.academicId,Number(e.target.value))}>{[1,2,3,4,5].map((i)=><option key={i} value={i}>{i} · {tr(slotTypes[i][0])}</option>)}</select></label>
          <label>{tr("Course")}<select aria-label={tr("Course")} className={style} value={form.courseId} disabled={disabled||!academic} required={form.slot===1} onChange={(e)=>changeField("courseId",e.target.value)}><option value="">{tr(form.slot===1?"Select Course":"No course")}</option>{options.courses.filter((c)=>slotTypes[form.slot].includes(c.type)).map((c)=><option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}</select></label>
          <label>{tr("Institute")}<select aria-label={tr("Institute")} className={style} value={form.instituteId} disabled={disabled||!form.courseId} required={Boolean(form.courseId)} onChange={(e)=>changeField("instituteId",e.target.value)}><option value="">{tr("Select")}</option>{options.institutes.filter((i)=>i.type===(form.slot===1?"Deeniyath Education":slotTypes[form.slot][0])).map((i)=><option key={i._id} value={i._id}>{i.iCode} - {i.name}</option>)}</select></label>
          <label>{tr("Year of Study")}<select aria-label={tr("Year of Study")} className={style} value={form.year} disabled={disabled||!form.courseId} required={Boolean(form.courseId)} onChange={(e)=>changeField("year",e.target.value)}><option value="">{tr("Select")}</option>{(course?.allowedYears||[]).map((year)=><option key={year} value={year}>{year}</option>)}</select></label>
          <label>{tr("Discount")}<input aria-label={tr("Discount")} className={style} type="number" min="0" step="0.01" max={course?.fees||0} required={Boolean(form.courseId)} value={form.discount} disabled={disabled||!form.courseId} onChange={(e)=>changeField("discount",e.target.value)}/></label>
        </div>
        {course&&<p>{tr("Course Fees")}: {money(Number(course.fees||0)*100)}</p>}
        <label className="block">{tr("Reason (Optional)")}<textarea aria-label={tr("Reason (Optional)")} className={style} value={form.reason} maxLength={500} disabled={disabled} onChange={(e)=>changeField("reason",e.target.value)} dir="auto"/></label>
        {completed&&<p role="alert">{tr("SC_COMPLETED")}</p>}
        <button className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" disabled={disabled||!academic} type="submit">{tr("Review Course Change")}</button>
      </form>
      {preview&&<div role="dialog" aria-modal="true" aria-label={tr("Confirm Course Change")} className="space-y-4 rounded border border-amber-400 bg-amber-50 p-4">
        <h3 className="font-bold">{tr("Confirm Course Change")}</h3>
        <p><bdi>{preview.quote.oldSlot.courseCode||"—"} {preview.quote.oldSlot.courseName}</bdi> → <bdi>{preview.quote.newSlot.courseCode||"—"} {preview.quote.newSlot.courseName}</bdi></p>
        <dl className="grid grid-cols-3 gap-3">{[["Old Net Fee",preview.quote.oldSlot.netPaise],["New Net Fee",preview.quote.newSlot.netPaise],["Fee Difference",preview.quote.differencePaise]].map(([label,value])=><div key={label}><dt>{tr(label)}</dt><dd className="font-bold">{money(value)}</dd></div>)}</dl>
        {preview.quote.differencePaise!==0&&<p role="alert" className="font-semibold text-amber-900">{tr("The fee is different. Proceed only after reviewing the difference. SuperAdmin and HQUser will be notified.")}</p>}
        <p>{tr("No invoice will be created. Existing invoices, payments and balances will remain unchanged.")}</p>
        <div className="flex gap-3"><button type="button" disabled={busy} className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" onClick={save}>{tr("Proceed and Update")}</button><button type="button" disabled={busy} className="rounded border px-4 py-2" onClick={()=>setPreview(null)}>{tr("Cancel")}</button></div>
      </div>}
      <section className="rounded border bg-white p-4"><h3 className="font-semibold">{tr("Course Change History")}</h3>{options.history.length===0?<p>{tr("No course changes recorded.")}</p>:options.history.map((change)=><div className="border-b py-3" key={change._id}><bdi>{change.acYear}</bdi> · {tr("Course Slot")} {change.slot} · <bdi>{change.oldSlot.courseCode||"—"}</bdi> → <bdi>{change.newSlot.courseCode||"—"}</bdi><p>{money(change.oldSlot.netPaise)} → {money(change.newSlot.netPaise)} · {tr("Fee Difference")}: {money(change.differencePaise)}</p><p><bdi>{change.actorName}</bdi> · <bdi>{new Date(change.createdAt).toLocaleString()}</bdi></p>{change.reason&&<p dir="auto">{change.reason}</p>}</div>)}</section>
    </>}
  </div>;
}
