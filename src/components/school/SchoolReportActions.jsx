import React,{useEffect,useRef,useState} from 'react';
import {FaFilePdf,FaPrint} from 'react-icons/fa';
import {useAuth} from '../../context/AuthContext';
import {useLanguage} from '../../i18n/LanguageContext';
import {PERMISSIONS} from '../../auth/permissions';
import {fetchSchoolListReport} from '../../api/schoolReportApi';
import {schoolReportText} from '../../i18n/schoolReportTranslations';
export default function SchoolReportActions({filters,loading=false}) {
  const {user,can}=useAuth(),{language,direction}=useLanguage();
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[progress,setProgress]=useState('');
  const controller=useRef(null),working=useRef(false),alive=useRef(true);
  const tr=key=>schoolReportText(key,language);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;controller.current?.abort();};},[]);
  const allowed=['superadmin','hqadmin','supervisor'].includes(String(user?.role||'').toLowerCase())&&can(PERMISSIONS.NISWAN_VIEW);
  const supervisorFilter=String(filters?.supervisorId ?? '').trim();
  const groupBySupervisor=['superadmin','hqadmin'].includes(String(user?.role||'').toLowerCase())&&['','null','undefined'].includes(supervisorFilter);
  const exportReport=async mode=>{
    if(working.current||loading)return;
    working.current=true;setBusy(true);setError('');setProgress('');controller.current=new AbortController();
    try {
      const report=await fetchSchoolListReport(filters,{signal:controller.current.signal});
      if(controller.current.signal.aborted)return;
      const {outputSchoolReport}=await import('../../reports/schoolListReport');
      await outputSchoolReport(report,{mode,groupBySupervisor,language,tr,signal:controller.current.signal,onProgress:(page,total)=>{if(alive.current)setProgress(`${page} / ${total}`);}});
    } catch(e) {
      if(alive.current&&!controller.current.signal.aborted){const code=e?.response?.data?.code||e.message;setError(code?.startsWith('NR_')?code:'NR_UNAVAILABLE');}
    } finally {working.current=false;if(alive.current){setBusy(false);setProgress('');}}
  };
  if(!allowed)return null;
  return <div className="mt-4 space-y-2 print:hidden" dir={direction}>
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" disabled={busy||loading} onClick={()=>exportReport('download')} className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-800 disabled:opacity-50"><FaFilePdf aria-hidden="true"/>{tr(groupBySupervisor?'Download Supervisor PDFs (ZIP)':'Download PDF')}</button>
      <button type="button" disabled={busy||loading} onClick={()=>exportReport('print')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"><FaPrint aria-hidden="true"/>{tr('Print')}</button>
    </div>
    {busy&&<p role="status" className="text-end text-sm text-slate-600">{tr('Preparing report...')} {progress}</p>}
    {error&&<p role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">{tr(error)}</p>}
  </div>;
}
