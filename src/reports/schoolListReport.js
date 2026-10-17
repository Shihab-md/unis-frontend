// Both actions use these same measured A4 pages. Browser text shaping preserves
// Indic scripts and Arabic/Urdu; each PDF page is captured separately.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const abort = signal => { if (signal?.aborted) throw new DOMException('Aborted', 'AbortError'); };
const locales = {en:'en-IN',ta:'ta-IN',ur:'ur-IN',ar:'ar',ml:'ml-IN',kn:'kn-IN',te:'te-IN'};
const text = value => `<div dir="auto">${esc(value === '' || value == null ? '—' : value)}</div>`;
const courseItems = row => Array.isArray(row.studentCountsByCourse) ? row.studentCountsByCourse : [];
const roleItems = row => Array.isArray(row.employeeCountsByRole) ? row.employeeCountsByRole : [];
const breakdownHtml = (items,total,type,tr) => `<div class="breakdown ${type==='Course'?'students':'employees'}"><div class="breakdown-total">${esc(tr('Total'))}: <b>${esc(total ?? 0)}</b></div>${items.length?`<div class="mini-head"><span>${esc(tr(type))}</span><span>${esc(tr('Count'))}</span></div>${items.map(item=>`<div class="mini-row"><span dir="auto">${esc(type==='Course' ? item.courseName || '—' : tr(item.role || '—'))}</span><b dir="ltr">${esc(item.count ?? 0)}</b></div>`).join('')}`:''}</div>`;
export function reportRowHtml(row,index,showSupervisor,tr,{continued=false}={}) {
  const names=[...new Set([row.nameEnglish,row.nameNative,row.nameArabic].filter(Boolean))];
  const supervisor=showSupervisor?`<div class="supervisor-details"><div class="supervisor-label">${esc(tr('Supervisor'))}</div><div class="supervisor-code" dir="auto">${esc(row.supervisorCode || '—')}</div>${text(row.supervisorName)}<div class="detail">${esc(tr('Contact'))}: <bdi>${esc(row.supervisorContact || '—')}</bdi></div></div>`:'';
  const details=`<div class="school-code" dir="auto">${esc(row.code || '—')}</div>${continued?`<div class="continuation">${esc(tr('Continued'))}</div>`:''}${names.map((name,i)=>`<div class="${i===0?'school-name':'native-name'}" dir="auto">${esc(name)}</div>`).join('')}${supervisor}<div class="badge ${row.active==='Active'?'active':'inactive'}">${esc(tr(row.active || '—'))}</div>`;
  const place=`<div class="place-name" dir="auto">${esc(row.city || '—')}</div><div class="detail" dir="auto">${esc(row.districtState || '')}</div><div class="incharge-label">${esc(tr('In-charge'))}</div>${text(row.incharge1)}<div class="contact">${esc(tr('Contact'))}: <bdi>${esc(row.incharge1Number || '—')}</bdi></div>`;
  return `<tr data-niswan-index="${index}"><td>${index+1}</td><td>${details}</td><td>${place}</td><td>${breakdownHtml(courseItems(row),row.studentCount,'Course',tr)}</td><td>${breakdownHtml(roleItems(row),row.employeeCount,'Role',tr)}</td></tr>`;
}
export function reportDocumentHtml(report, {language='en',tr=x=>x,fontBaseUrl=window.location.origin} = {}) {
  const rtl=['ar','ur'].includes(language);
  const headings=['No.','Niswan Details','Place / In-charge','Students','Employees'];
  const widths=[4,30,26,23,17];
  const generated=new Intl.DateTimeFormat(locales[language]||'en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(new Date(report.generatedAt));
  const filter=report.filters||{};
  const filterText=[filter.districtStateName?`${tr('District & State')}: ${filter.districtStateName}`:'',`${tr('Status')}: ${tr(filter.status||'All')}`,filter.search?`${tr('Search')}: ${filter.search}`:''].filter(Boolean).join(' · ');
  const supervisor=report.supervisor?`${tr('Supervisor')}: ${report.supervisor.code} · ${report.supervisor.name}`:tr('All Supervisors');
  const font=name=>esc(new URL(name,fontBaseUrl.endsWith('/')?fontBaseUrl:fontBaseUrl+'/').href);
  return `<!doctype html><html lang="${esc(language)}" dir="${rtl?'rtl':'ltr'}"><head><meta charset="utf-8"><title>${esc(tr('Niswan List'))}</title><style>
@font-face{font-family:ReportLatin;src:url('${font('arial.ttf')}');font-weight:400;unicode-range:U+0000-024F,U+2000-206F,U+20A0-20CF}
@font-face{font-family:ReportLatin;src:url('${font('arialbd.ttf')}');font-weight:700;unicode-range:U+0000-024F,U+2000-206F,U+20A0-20CF}
@font-face{font-family:ReportIndic;src:url('${font('Nirmalab.ttc')}');font-weight:400;unicode-range:U+0900-0DFF,U+200C-200D}
@font-face{font-family:ReportArabic;src:url('${font('Amiri-Regular.ttf')}');font-weight:400;unicode-range:U+0600-08FF,U+FB50-FDFF,U+FE70-FEFF}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:white;color:#1e293b;font-family:ReportLatin,ReportIndic,ReportArabic,sans-serif;font-size:12px;line-height:1.6}
@page{size:A4 portrait;margin:0}.report-page{position:relative;width:793px;height:1122px;padding:32px 38px 50px;background:#fff;break-after:page;page-break-after:always;overflow:hidden}.report-page:last-child{break-after:auto;page-break-after:auto}
.banner{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0e7490;padding-bottom:10px;margin-bottom:12px}.brand{font-size:23px;font-weight:700;letter-spacing:1px;color:#12304a}.title{font-size:20px;font-weight:700;color:#12304a}.meta{font-size:11px;color:#475569}.summary{display:flex;gap:22px;background:#edf5fa;border:1px solid #d9e7f0;padding:8px 12px;margin:10px 0 12px}.summary b{color:#12304a;font-size:15px}.filters{overflow-wrap:anywhere}.supervisor{font-weight:700;color:#164e63}
table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:12px}th{font-size:11px;font-weight:700;background:#173f59;color:#fff;padding:8px 5px;text-align:start;overflow-wrap:anywhere;line-height:1.55}td{vertical-align:top;border-bottom:1px solid #dce5ec;padding:7px 6px;overflow-wrap:anywhere;line-height:1.6}tr:nth-child(even) td{background:#f2f6fa}.name{font-weight:700}td div+div{margin-top:2px}.contact{color:#475569;font-size:11px}.status{font-size:10px;font-weight:700}.active{color:#166534}.inactive{color:#9a3412}tr{break-inside:avoid}.report-footer{position:absolute;bottom:22px;left:38px;right:38px;border-top:1px solid #cbd5e1;padding-top:7px;font-size:10px;color:#64748b;display:flex;justify-content:space-between}.empty{padding:24px;text-align:center;color:#64748b}
/* The same five-column portrait layout is used for download and print. */
.report-page{padding:32px 32px 48px}.report-footer{left:32px;right:32px}.brand{font-size:22px}.meta{font-size:10px}.summary{flex-wrap:wrap;gap:6px 24px;padding:9px 12px}
th{padding:9px 5px}td{padding:10px 6px;font-size:11.5px;line-height:1.45}.school-code{font-size:10px;color:#0e7490;font-weight:700;letter-spacing:.2px}.school-name{font-weight:700;font-size:12px;line-height:1.4}.native-name{font-size:11px}.detail{font-size:10px;color:#64748b;line-height:1.5}.badge{font-size:9px;font-weight:700;margin-top:4px!important}.contact{font-size:10px;margin-top:5px}.place-name{font-weight:700}.incharge-label{font-size:9px;color:#0e7490;margin-top:12px!important;margin-bottom:3px!important}.supervisor-details{border-top:1px solid #dce6ed;margin-top:7px!important;padding-top:5px;font-size:9.5px}.supervisor-label{font-size:8.5px;color:#64748b}.supervisor-code{font-size:10px;font-weight:700;color:#0e7490}.supervisor-details .detail{font-size:9.5px;line-height:1.4}.continuation{font-size:9px;font-weight:700;color:#9a3412}
.breakdown{border:1px solid #dbe5ed;border-radius:4px;overflow:hidden;background:#fff;font-size:10px;line-height:1.45}.breakdown-total{padding:5px 7px;background:#edf5fb;color:#174d75;font-weight:700}.breakdown-total b{font-size:13px}.mini-head,.mini-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(24px,27%);gap:4px;padding:5px 6px}.mini-head{background:#f3f5f8;color:#64748b;font-size:8px;font-weight:700}.mini-row{border-top:1px solid #e7edf2;margin-top:0!important}.mini-row b,.mini-head span:last-child{text-align:end}.mini-row b{color:#174d75}.employees .breakdown-total{background:#eaf6f1;color:#166534}
@media screen{.report-page{margin-bottom:12px}}@media print{html,body{width:793px}.report-page{margin:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><section class="report-page"><header><div class="banner"><div><div class="brand">UNIS ACADEMY</div><div class="title">${esc(tr('Niswan List'))}</div></div><div class="meta">${esc(tr('Generated'))}<br><bdi>${esc(generated)} IST</bdi></div></div><div class="supervisor" dir="auto">${esc(supervisor)}</div><div class="meta filters" dir="auto">${esc(filterText)}</div><div class="summary"><span>${esc(tr('Total Niswans'))}: <b>${esc(report.totalNiswans)}</b></span><span>${esc(tr('Students'))}: <b>${esc(report.totalStudents)}</b></span><span>${esc(tr('Employees'))}: <b>${esc(report.totalStaff)}</b></span></div></header><table><colgroup>${widths.map(w=>`<col style="width:${w}%">`).join('')}</colgroup><thead><tr>${headings.map(h=>`<th>${esc(tr(h))}</th>`).join('')}</tr></thead><tbody></tbody></table><footer class="report-footer"><span>UNIS ACADEMY</span><span class="page-number"></span></footer></section></body></html>`;
}
export async function paginateSchoolReport(doc, report, {tr=x=>x,signal}={}) {
  abort(signal);
  // Fail visibly on a missing required font rather than producing square glyphs.
  const allText=JSON.stringify(report)+doc.body.textContent;
  const fonts=[['ReportLatin','UNIS'],...(/[\u0900-\u0dff]/.test(allText)?[['ReportIndic','தமிழ்']]:[]),...(/[\u0600-\u08ff]/.test(allText)?[['ReportArabic','العربية']]:[])];
  for(const [family,sample] of fonts) { const faces=await doc.fonts.load(`12px ${family}`,sample); if(!faces.length)throw Error('NR_FONTS'); }
  await doc.fonts.ready; abort(signal);
  const template=doc.querySelector('.report-page').cloneNode(true);let page=doc.querySelector('.report-page');
  const nextPage=()=>{page=template.cloneNode(true);doc.body.appendChild(page);return page;};
  const fits=()=>page.querySelector('table').getBoundingClientRect().bottom<=page.querySelector('footer').getBoundingClientRect().top-10;
  if(!report.rows.length)page.querySelector('tbody').innerHTML=`<tr><td colspan="5" class="empty">${esc(tr('No matching Niswans to export.'))}</td></tr>`;
  const showSupervisor=report.showSupervisorDetails ?? report.showSupervisorColumn;
  for(const [index,row] of report.rows.entries()) {
    const queue=[{row,continued:false}];
    while(queue.length) {
      abort(signal);
      const fragment=queue.shift();let body=page.querySelector('tbody');
      body.insertAdjacentHTML('beforeend',reportRowHtml(fragment.row,index,showSupervisor,tr,fragment));const element=body.lastElementChild;
      if(!fits()&&body.children.length>1){element.remove();nextPage();page.querySelector('tbody').appendChild(element);}
      if(fits())continue;
      element.remove();
      // Split unusually long course/role lists without dropping an entry or
      // turning enrolment counts into a unique-student total. Context repeats.
      const courses=courseItems(fragment.row),roles=roleItems(fragment.row);
      if(courses.length<=1&&roles.length<=1)throw Error('NR_TOO_LONG');
      const courseMid=Math.ceil(courses.length/2),roleMid=Math.ceil(roles.length/2);
      queue.unshift(
        {row:{...fragment.row,studentCountsByCourse:courses.slice(0,courseMid),employeeCountsByRole:roles.slice(0,roleMid)},continued:fragment.continued},
        {row:{...fragment.row,studentCountsByCourse:courses.slice(courseMid),employeeCountsByRole:roles.slice(roleMid)},continued:true},
      );
    }
  }
  const pages=[...doc.querySelectorAll('.report-page')];pages.forEach((p,i)=>p.querySelector('.page-number').textContent=`${tr('Page')} ${i+1} ${tr('of')} ${pages.length}`);
  return pages;
}
let captureFonts;
async function loadCaptureFonts() {
  // html2canvas creates its canvas and font-metric nodes in the application
  // document, even when capturing an iframe. Load the same faces there too.
  if (!captureFonts) captureFonts=(async()=>{
    const faces=[
      ['ReportLatin','arial.ttf','400','U+0000-024F,U+2000-206F,U+20A0-20CF'],
      ['ReportLatin','arialbd.ttf','700','U+0000-024F,U+2000-206F,U+20A0-20CF'],
      ['ReportIndic','Nirmalab.ttc','400','U+0900-0DFF,U+200C-200D'],
      ['ReportArabic','Amiri-Regular.ttf','400','U+0600-08FF,U+FB50-FDFF,U+FE70-FEFF'],
    ];
    await Promise.all(faces.map(async([family,file,weight,unicodeRange])=>{
      const face=new FontFace(family,`url("${new URL('/'+file,window.location.origin).href}")`,{weight,unicodeRange});
      await face.load();document.fonts.add(face);
    }));
    await document.fonts.ready;
  })().catch(()=>{captureFonts=null;throw Error('NR_FONTS');});
  return captureFonts;
}
export async function outputSchoolReport(report,{mode='download',language='en',tr=x=>x,signal,onProgress=()=>{}}={}) {
  abort(signal);const frame=document.createElement('iframe');frame.title=tr('Niswan List');frame.setAttribute('aria-hidden','true');frame.setAttribute('sandbox','allow-same-origin allow-modals');frame.style.cssText='position:fixed;left:-15000px;top:0;width:793px;height:1122px;border:0;';
  let keepForPrint=false,timer;
  try {
    const loaded=new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=()=>reject(Error('NR_UNAVAILABLE'));});
    frame.srcdoc=reportDocumentHtml(report,{language,tr});document.body.appendChild(frame);
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('NR_FONTS')),25000);});
    await Promise.race([loaded,timeout]);
    const pages=await Promise.race([paginateSchoolReport(frame.contentDocument,report,{tr,signal}),timeout]);clearTimeout(timer);abort(signal);
    if(mode==='print') {
      keepForPrint=true;const close=()=>frame.remove();frame.contentWindow.addEventListener('afterprint',close,{once:true});setTimeout(close,300000);
      frame.contentWindow.focus();frame.contentWindow.print();return;
    }
    await Promise.race([loadCaptureFonts(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('NR_FONTS')),25000);})]);clearTimeout(timer);abort(signal);
    const [{default:html2canvas},{jsPDF}]=await Promise.all([import('html2canvas'),import('jspdf')]);
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});pdf.setProperties({title:tr('Niswan List'),author:'UNIS Academy',subject:report.supervisor?`${report.supervisor.code} - ${report.supervisor.name}`:tr('All Supervisors')});
    for(let i=0;i<pages.length;i++) {
      abort(signal);onProgress(i+1,pages.length);
      const canvas=await html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',logging:false,width:793,height:1122,windowWidth:793,windowHeight:1122,scrollX:0,scrollY:0});
      try {abort(signal);if(i)pdf.addPage('a4','portrait');pdf.addImage(canvas.toDataURL('image/jpeg',0.96),'JPEG',0,0,210,297,undefined,'FAST');}
      finally {canvas.width=0;canvas.height=0;}
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    abort(signal);const stamp=new Date(report.generatedAt).toISOString().slice(0,10);pdf.save(`UNIS-Niswan-List-${stamp}.pdf`);
  } finally {clearTimeout(timer);if(!keepForPrint)frame.remove();}
}
