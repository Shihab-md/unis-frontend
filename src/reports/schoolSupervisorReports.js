// Group only the fresh, server-scoped rows returned by the report endpoint.
// Database IDs, rather than display names/codes, keep distinct Supervisors apart.
export function schoolSupervisorReports(report) {
  const groups=new Map();
  for(const row of report.rows) {
    const key=row.supervisorRecordId || '';
    if(!groups.has(key))groups.set(key,{
      ...report, rows:[], unassigned:!key,
      supervisor:key?{recordId:key,code:row.supervisorCode || '',name:row.supervisorName || '',contact:row.supervisorContact || ''}:null,
      filters:{...report.filters,supervisorId:key},
      totalNiswans:0,totalStudents:0,totalStaff:0,
    });
    const group=groups.get(key);group.rows.push(row);group.totalNiswans++;
    group.totalStudents+=Number(row.studentCount || 0);
    group.totalStaff+=Number(row.employeeCount || 0);
  }
  return [...groups.values()].sort((a,b)=>Number(a.unassigned)-Number(b.unassigned)
    || String(a.supervisor?.code || '').localeCompare(String(b.supervisor?.code || ''),'en',{numeric:true})
    || String(a.supervisor?.recordId || '').localeCompare(String(b.supervisor?.recordId || '')));
}
export function schoolReportFileName(report,index) {
  const stamp=new Date(report.generatedAt).toISOString().slice(0,10);
  const code=String(report.supervisor?.code || (report.unassigned?'UNASSIGNED':''))
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g,'_').replace(/[. ]+$/g,'').slice(0,80);
  // A numbered prefix also prevents ZIP collisions when Supervisor codes repeat.
  const prefix=index==null?'':`${String(index+1).padStart(3,'0')}-`;
  return `UNIS-Niswan-List-${prefix}${code?code+'-':''}${stamp}.pdf`;
}
