import test, { afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { TA_PHRASES, TA_LANGUAGES, taText } from "../src/i18n/travelAllowanceTranslations.js";
import { SERVICES_PHRASES, servicesText } from "../src/i18n/attendanceServicesTranslations.js";
import { PERMISSIONS } from "../src/auth/permissions.js";
import { translateUiPhrase } from "../src/i18n/uiPhrases.js";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://local.test" });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement, MutationObserver: dom.window.MutationObserver, FormData: dom.window.FormData, File: dom.window.File });
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = require("react"); const { render, screen, fireEvent, waitFor, cleanup } = require("@testing-library/react");
const esbuild = require("esbuild");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
globalThis.UI_XLSX = createRequire(join(root,"package.json"))("xlsx");
const temporary = await mkdtemp(join(tmpdir(), "unis-ta-ui-"));
const bundle = join(temporary, "components.cjs");
await esbuild.build({ stdin: { contents: `export {default as AccountsFinancePage} from './src/components/accounts/AccountsFinancePage.jsx'; export {default as AccountsPage} from './src/components/dashboard/AccountsPage.jsx'; export {default as AttendancePage} from './src/components/attendance/AttendancePage.jsx'; export {default as LeaveTab} from './src/components/attendance/LeaveTab.jsx'; export {default as TravelClaimsTab} from './src/components/attendance/TravelClaimsTab.jsx'; export {default as PayrollTab} from './src/components/attendance/PayrollTab.jsx'; export {default as MyPayslipsTab} from './src/components/attendance/MyPayslipsTab.jsx';`, resolveDir: root, loader: "jsx" },
  outfile: bundle, define: { "import.meta.env": JSON.stringify({ VITE_UNIS_TIMEZONE: "Asia/Kolkata" }) }, bundle: true, platform: "node", format: "cjs", jsx: "transform", plugins: [{ name: "isolated-adapters", setup(build) {
    build.onResolve({ filter: /^xlsx$/ }, () => ({ path: "xlsx", namespace: "test-adapter" }));
    build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: "router", namespace: "test-adapter" }));
    build.onResolve({ filter: /(?:^|\/)(?:CommonHeader|AttendanceOverview)$/ }, (args) => ({ path: args.path.split("/").at(-1), namespace: "test-adapter" }));
    build.onResolve({ filter: /^react(?:\/.*)?$/ }, (args) => ({ path: require.resolve(args.path), external: true }));
    build.onResolve({ filter: /(?:context\/AuthContext|i18n\/LanguageContext|api\/travelClaimApi|api\/attendanceApi|utils\/CommonHelper)$/ }, (args) => ({ path: args.path.split("/").at(-1), namespace: "test-adapter" }));
    build.onLoad({ filter: /.*/, namespace: "test-adapter" }, ({ path }) => {
      const source = {
        xlsx: `export const utils=globalThis.UI_XLSX.utils; export const writeFile=(...args)=>globalThis.UI_EXPORT(...args);`,
        router: `import React from 'react'; export const Link=({to,children,...props})=>React.createElement('a',{...props,href:to},children); export const Navigate=({to})=>{globalThis.UI_REDIRECT=to;return React.createElement('div',{'data-redirect':to});}; export const useNavigate=()=>()=>{}; export const useSearchParams=()=>[new URLSearchParams(globalThis.UI_SEARCH||'')];`,
        CommonHeader: `export default ()=>null;`,
        AttendanceOverview: `export default ()=>null;`,
        AuthContext: `export const useAuth = () => globalThis.UI_AUTH;`,
        LanguageContext: `import React from 'react'; import {translateUiPhrase} from ${JSON.stringify(join(root, "src/i18n/uiPhrases.js"))}; export const useLanguage=()=>({language:globalThis.UI_LANGUAGE,tr:(v)=>translateUiPhrase(v,globalThis.UI_LANGUAGE),direction:['ar','ur'].includes(globalThis.UI_LANGUAGE)?'rtl':'ltr',fontFamily:'sans-serif'}); export const AutoText=({as:C='span',text,children,...props})=>React.createElement(C,props,children??text);`,
        travelClaimApi: `export const taRequest=(...args)=>globalThis.UI_API(...args);`,
        attendanceApi: `export const attendanceGet=(...args)=>globalThis.UI_ATTENDANCE('GET',...args); export const attendancePost=(...args)=>globalThis.UI_ATTENDANCE('POST',...args); export const attendancePatch=(...args)=>globalThis.UI_ATTENDANCE('PATCH',...args);`,
        CommonHelper: `export const showSwalAlert=(...args)=>globalThis.UI_ALERTS?.push(args); export const showConfirmationSwalAlert=async()=>({isConfirmed:true}); export const handleRightClickAndFullScreen=()=>{}; export const getBaseUrl=async()=>"https://local.test/api/"; export const getSpinner=()=>null; export const LinkIcon=()=>null;`,
      }[path];
      return { contents: source, loader: "jsx", resolveDir: root };
    });
  } }], logLevel: "silent" });
const { TravelClaimsTab, PayrollTab, MyPayslipsTab, AccountsFinancePage, AccountsPage, AttendancePage, LeaveTab } = require(bundle);
afterEach(() => cleanup()); after(() => dom.window.close());
function setup(role = "supervisor", language = "en") {
  globalThis.UI_EXPORT = ()=>{};
  globalThis.UI_ALERTS = []; globalThis.UI_SEARCH = ""; globalThis.UI_REDIRECT = "";
  globalThis.UI_LANGUAGE = language; window.localStorage.setItem("preferredLanguage", language);
  globalThis.UI_AUTH = { user: { _id: "user-self", role }, can: () => true };
  globalThis.UI_META = { success: true, canViewOwn: true, canManageOwn: true, canReview: ["accountant","hqadmin","superadmin"].includes(role), canApprove: ["accountant","hqadmin","superadmin"].includes(role) };
  globalThis.UI_RECORD = { _id:"507f1f77bcf86cd799439011", claimNumber:"TA-507F1F77BCF86CD799439011",userId:"user-self",name:"தமிழ் العربية",staffCode:"SUP-1",status:"Submitted",claimVersion:2,monthKey:"2026-10",description:"பள்ளி ஆய்வு / سفر",employeeId:"",supervisorId:"TEST-SUP",role:"supervisor",submittedAt:"2026-10-03T00:00:00Z",revision:1,
    fromDateKey:"2026-10-01",toDateKey:"2026-10-02",fromPlace:"மதுரை",toPlace:"مدرسة",purpose:"பள்ளி ஆய்வு",transport:"Bus",requestedAmountPaise:120025,approvedAmountPaise:0,
    expenses:[{description:"சீட்டு",amountPaise:120025}],evidence:[],history:[{action:"Created",at:"2026-10-03T00:00:00Z"}] };
  globalThis.UI_LIST = [];
  globalThis.UI_REPORT={summary:{eligible:5,submitted:1,approved:1,rejected:1,notSubmitted:2},rows:[],total:0,page:1,pageSize:25};
  globalThis.UI_API = async (method,path) => ({ data: path==="/meta" ? globalThis.UI_META : path.startsWith("/monthly-report") ? globalThis.UI_REPORT : ["/mine","/review"].includes(path) ? {claims:globalThis.UI_LIST,nextCursor:null} : {claim:globalThis.UI_RECORD} });
}

test("every new TA phrase and error has explicit UTF-8 text for all seven languages", () => {
  for(const [key,values] of Object.entries(TA_PHRASES))for(const lang of TA_LANGUAGES){assert.equal(typeof values[lang],"string",`${key}:${lang}`);assert(values[lang].length>0);assert(!/[\uFFFD]/.test(values[lang]));}
  for(const lang of TA_LANGUAGES.filter(l=>l!=="en"))for(const key of ["Draft","Approved","Rejected","Cancelled","Paid","Edit","Status","All","Refresh","Loading...","Amount","Cancel","Previous","Next","Download","Remove","Confirm"]){assert.notEqual(translateUiPhrase(key,lang),key,`${lang}:${key}`);}
});
for(const language of TA_LANGUAGES)test(`TA self-service renders translated controls and correct direction: ${language}`, async () => {
  setup("supervisor",language);const view=render(React.createElement(TravelClaimsTab));
  await screen.findByRole("button",{name:taText("New TA Claim",language)});
  assert.equal(view.container.firstElementChild.dir,["ar","ur"].includes(language)?"rtl":"ltr");
  assert(screen.getByText(taText("My TA Claims",language)));
});
async function openMonthlyForm(language="en") {
  render(React.createElement(TravelClaimsTab)); fireEvent.click(await screen.findByRole("button",{name:taText("New TA Claim",language)}));
  const form=document.querySelector("form");
  fireEvent.change(form.querySelector('input[type="month"]'),{target:{value:"2026-10"}});
  fireEvent.change(form.querySelector('input[type="number"]'),{target:{value:"1200.25"}});
  fireEvent.change(form.querySelector("textarea"),{target:{value:"பள்ளி ஆய்வு / سفر"}});
  fireEvent.change(form.querySelector('input[type="file"]'),{target:{files:[new File(["%PDF-1.7"],"சான்று.pdf",{type:"application/pdf"})]}});
  return form;
}
function uploadApi({failUpload=false}={}) {
  const calls=[]; let staged={_id:"507f1f77bcf86cd799439099",requestKey:"",revision:0,files:[]}; const fallback=globalThis.UI_API;
  globalThis.UI_API=async(method,path,data,...rest)=>{
    calls.push({method,path,data});
    if(path==="/uploads"){staged.requestKey=data.requestKey;return{data:{upload:staged}};}
    if(path.endsWith("/files")&&method==="POST"){
      if(failUpload)throw{response:{status:503,data:{code:"TA_UPLOAD_FAILED"}}};
      staged={...staged,revision:staged.revision+1,files:[{_id:"507f1f77bcf86cd799439088",uploadKey:data.get("uploadKey"),name:data.get("originalName")}]};return{data:{upload:staged}};
    }
    if(path==="/submit")return{data:{claim:{...globalThis.UI_RECORD,evidence:[{_id:"file",name:"சான்று.pdf"}],status:"Submitted"}}};
    return fallback(method,path,data,...rest);
  };return calls;
}
test("monthly form has no draft, journey, expense rows or cancel-claim workflow",async()=>{setup();const form=await openMonthlyForm();assert.equal(form.querySelectorAll('input[type="month"]').length,1);assert.equal(form.querySelectorAll('input[type="number"]').length,1);assert.equal(screen.queryByRole("button",{name:"Save Draft"}),null);assert.equal(screen.queryByLabelText("Journey Start"),null);assert.equal(screen.queryByRole("button",{name:"Cancel Claim"}),null);const statuses=[...screen.getByLabelText("Status").options].map(o=>o.value);assert.deepEqual(statuses,["","Submitted","Approved","Rejected"]);});
test("monthly submission uploads first and preserves Unicode description and filename",async()=>{setup("supervisor","ta");const calls=uploadApi();const form=await openMonthlyForm("ta");fireEvent.submit(form);assert.equal(calls.filter(c=>c.method==="POST").length,0);fireEvent.click(screen.getByRole("button",{name:taText("Confirm","ta")}));await screen.findByText(taText("TA changes saved.","ta"));const posted=calls.filter(c=>c.method==="POST");assert.deepEqual(posted.map(c=>c.path),["/uploads","/uploads/507f1f77bcf86cd799439099/files","/submit"]);assert.equal(posted[1].data.get("originalName"),"சான்று.pdf");assert.equal(posted[2].data.description,"பள்ளி ஆய்வு / سفر");assert.equal(posted[2].data.amount,"1200.25");assert.equal(posted[2].data.requestKey,posted[0].data.requestKey);assert.match(posted[2].data.requestKey,/^[0-9a-f-]{36}$/);});
test("upload failure keeps the form and never sends a submitted claim",async()=>{setup();const calls=uploadApi({failUpload:true});const form=await openMonthlyForm();fireEvent.submit(form);fireEvent.click(screen.getByRole("button",{name:"Confirm"}));await screen.findByRole("alert");assert(document.querySelector("form"));assert.equal(calls.filter(c=>c.path==="/submit").length,0);assert.equal(document.querySelector("textarea").value,"பள்ளி ஆய்வு / سفر");});
test("removing a local file does not submit the form",async()=>{setup();const calls=uploadApi();await openMonthlyForm();fireEvent.click(screen.getByRole("button",{name:"Remove"}));assert.equal(screen.queryByRole("dialog"),null);assert.equal(calls.filter(c=>c.method==="POST").length,0);assert.equal(screen.queryByText("சான்று.pdf"),null);});
test("cancel closes the local form without creating any request",async()=>{setup();const calls=uploadApi();await openMonthlyForm();fireEvent.click(screen.getByRole("button",{name:"Cancel"}));assert.equal(document.querySelector("form"),null);assert.equal(calls.filter(c=>c.method==="POST").length,0);});
test("missing evidence is reported before any upload session",async()=>{setup();const calls=uploadApi();const form=await openMonthlyForm();fireEvent.click(screen.getByRole("button",{name:"Remove"}));fireEvent.submit(form);await screen.findByText(taText("TA_EVIDENCE_REQUIRED","en"));assert.equal(calls.filter(c=>c.method==="POST").length,0);});
test("duplicate confirmation clicks send a single submit sequence",async()=>{setup();let calls=0,release;const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data,...rest)=>{if(path==="/uploads"){calls++;await new Promise(r=>{release=r});return{data:{upload:{submittedClaimId:globalThis.UI_RECORD._id}}};}return fallback(method,path,data,...rest);};const form=await openMonthlyForm();fireEvent.submit(form);const button=screen.getByRole("button",{name:"Confirm"});fireEvent.click(button);fireEvent.click(button);assert.equal(calls,1);release();await screen.findByText("TA changes saved.");});
test("an uncertain successful submit is reconciled without resubmitting files",async()=>{setup();let uploads=0;const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data,...rest)=>{if(path==="/uploads")return{data:{upload:{submittedClaimId:globalThis.UI_RECORD._id}}};if(method==="POST")uploads++;return fallback(method,path,data,...rest);};const form=await openMonthlyForm();fireEvent.submit(form);fireEvent.click(screen.getByRole("button",{name:"Confirm"}));await screen.findByText("TA changes saved.");assert.equal(uploads,0);});
test("reviewer sees employee and supervisor IDs and only approve/reject controls",async()=>{setup("accountant");globalThis.UI_RECORD.userId="another-user";globalThis.UI_LIST=[globalThis.UI_RECORD];render(React.createElement(TravelClaimsTab,{review:true}));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));await screen.findByText("Claim History");assert(screen.getAllByText(/TEST-SUP/).length);assert.equal(screen.queryByRole("button",{name:"Return for Correction"}),null);assert.equal(screen.queryByLabelText("Approved Amount"),null);assert(screen.getByRole("button",{name:"Approve Claim"}));assert(screen.getByRole("button",{name:"Reject Claim"}));});
test("approval sends only the decision and current revision after confirmation",async()=>{setup("accountant","ar");globalThis.UI_RECORD.userId="other";globalThis.UI_LIST=[globalThis.UI_RECORD];let posted;const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data,...rest)=>{if(method==="POST"){posted=data;return{data:{claim:{...globalThis.UI_RECORD,status:"Approved"}}};}return fallback(method,path,data,...rest);};render(React.createElement(TravelClaimsTab,{review:true}));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));fireEvent.click(await screen.findByRole("button",{name:taText("Approve Claim","ar")}));assert.equal(posted,undefined);fireEvent.click(screen.getByRole("button",{name:taText("Confirm","ar")}));await waitFor(()=>assert(posted));assert.deepEqual(posted,{decision:"Approved",reason:"",revision:1});});
test("reviewer must provide a rejection reason",async()=>{setup("accountant");globalThis.UI_RECORD.userId="other";globalThis.UI_LIST=[globalThis.UI_RECORD];render(React.createElement(TravelClaimsTab,{review:true}));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));fireEvent.click(await screen.findByRole("button",{name:"Reject Claim"}));await screen.findByText(taText("TA_REJECTION_REASON","en"));assert.equal(screen.queryByRole("dialog"),null);});
test("self-approval stays blocked for an Accountant",async()=>{setup("accountant","ur");globalThis.UI_LIST=[globalThis.UI_RECORD];render(React.createElement(TravelClaimsTab,{review:true}));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));await screen.findByText(taText("Claim History","ur"));assert.equal(screen.queryByRole("button",{name:taText("Approve Claim","ur")}),null);assert(screen.getByText(taText("TA_SELF_APPROVAL","ur")));});
test("rejected monthly request opens the same month with retained evidence",async()=>{setup();globalThis.UI_RECORD.status="Rejected";globalThis.UI_RECORD.evidence=[{_id:"file",name:"old.pdf"}];globalThis.UI_LIST=[globalThis.UI_RECORD];render(React.createElement(TravelClaimsTab));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));fireEvent.click(await screen.findByRole("button",{name:"Resubmit Claim"}));const form=document.querySelector("form");assert.equal(form.querySelector('input[type="month"]').value,"2026-10");assert(form.querySelector('input[type="month"]').disabled);assert(screen.getByText("old.pdf"));assert.equal(screen.queryByRole("button",{name:"Save Draft"}),null);});
test("monthly summary and non-submitted register show eligible people with IDs",async()=>{setup("accountant");globalThis.UI_REPORT.rows=[{staffType:"Employee",staffId:"emp",name:"Non-submitted person",employeeId:"EMP-99",supervisorId:"",role:"hquser",status:"Not submitted",requestedAmountPaise:0,approvedAmountPaise:0}];globalThis.UI_REPORT.total=1;render(React.createElement(TravelClaimsTab,{review:true}));await screen.findByText("Register counts use current active eligible HQ staff.");fireEvent.change(screen.getByLabelText("Status"),{target:{value:"Not submitted"}});await screen.findByText("Non-submitted person");assert(screen.getByText("EMP-99"));assert(screen.getByRole("button",{name:"Export Excel"}));});
test("Excel export uses the selected filters and preserves Unicode and literal formula-like names",async()=>{
  setup("accountant","ta");let workbook,filename,query;
  globalThis.UI_EXPORT=(book,name)=>{workbook=book;filename=name;};
  const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data,options)=>{
    if(path==="/monthly-report/export"){query=options.params;return{data:{rows:[{monthKey:"2026-10",name:"=1+1 தமிழ் العربية",employeeId:"EMP-01",supervisorId:"",role:"hquser",status:"Not submitted",requestedAmountPaise:0,approvedAmountPaise:0,claimCount:0}]}};}
    return fallback(method,path,data,options);
  };
  render(React.createElement(TravelClaimsTab,{review:true}));await screen.findByText(taText("Register counts use current active eligible HQ staff.","ta"));
  fireEvent.change(screen.getByLabelText(taText("Filter Month","ta")),{target:{value:"2026-10"}});
  const button=await screen.findByRole("button",{name:taText("Export Excel","ta")});await waitFor(()=>assert(!button.disabled));fireEvent.click(button);
  await waitFor(()=>assert(workbook));assert.equal(filename,"TA-2026-10.xlsx");assert.equal(query.monthKey,"2026-10");
  const bytes=globalThis.UI_XLSX.write(workbook,{type:"buffer",bookType:"xlsx"});const reloaded=globalThis.UI_XLSX.read(bytes,{type:"buffer"});const sheet=reloaded.Sheets.TA;
  assert.equal(sheet.B2.v,"=1+1 தமிழ் العربية");assert.equal(sheet.B2.t,"s");assert.equal(sheet.B2.f,undefined);assert.equal(sheet.C2.v,"EMP-01");assert.equal(sheet.G2.t,"n");
});
test("a stale decision is translated without automatic POST retry",async()=>{setup("accountant","kn");globalThis.UI_RECORD.userId="other";globalThis.UI_LIST=[globalThis.UI_RECORD];let writes=0;const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data,...rest)=>{if(method==="POST"){writes++;throw{response:{status:409,data:{code:"TA_STALE"}}};}return fallback(method,path,data,...rest);};render(React.createElement(TravelClaimsTab,{review:true}));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));fireEvent.click(await screen.findByRole("button",{name:taText("Approve Claim","kn")}));fireEvent.click(screen.getByRole("button",{name:taText("Confirm","kn")}));await screen.findByText(taText("TA_STALE","kn"));assert.equal(writes,1);});
test("payroll preview retains approved TA while changing a manual allowance", async () => {
  setup("accountant");const run={_id:"payroll",monthKey:new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit"}).format(new Date()),taPolicyVersion:1,revision:2,status:"Draft",workingDays:20,items:[{_id:"row",name:"Example",staffCode:"E1",role:"hquser",monthlySalary:10000,grossSalary:10000,approvedTaClaims:1200,travellingAllowance:0,attendanceDeduction:500,manualAllowance:0,manualDeduction:0,netSalary:10700,travelClaimItems:[]}]};
  // The app's month helper uses the same India business date.
  run.monthKey=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()).slice(0,7);
  globalThis.UI_ATTENDANCE=async()=>({data:{run}});render(React.createElement(PayrollTab,{meta:{access:{canManagePayrollGlobally:true}}}));await screen.findByText("Example");
  const table=screen.getByText("Example").closest("tr");const input=table.querySelector('input[type="number"]');fireEvent.change(input,{target:{value:"100"}});
  assert.match(table.textContent,/10,800/);
});
test("payslips distinguish historical fixed TA and approved claim snapshots", async () => {
  setup("supervisor","ta");globalThis.UI_ATTENDANCE=async()=>({data:{payslips:[{payrollRunId:"old",monthKey:"2026-09",status:"Paid",taPolicyVersion:0,item:{monthlySalary:10000,travellingAllowance:2500,grossSalary:12500,netSalary:12500}},{payrollRunId:"new",monthKey:"2026-10",status:"Finalized",taPolicyVersion:1,item:{monthlySalary:10000,approvedTaClaims:1200,travelClaimItems:[{claimId:"claim",claimNumber:"TA-EXAMPLE",approvedAmountPaise:120000}],grossSalary:10000,netSalary:11200}}]}});
  render(React.createElement(MyPayslipsTab));await screen.findByText("TA-EXAMPLE");assert(screen.getByText(taText("Approved TA Claims","ta")));assert(screen.getByText(translateUiPhrase("Travelling Allowance","ta")));
});

test("Attendance & Services phrases and leave errors cover every supported language", () => {
  for (const [key, values] of Object.entries(SERVICES_PHRASES)) for (const lang of TA_LANGUAGES) {
    assert(values[lang], `${key}:${lang}`); assert(!/\uFFFD/.test(values[lang]));
    if(lang!=="en") assert.notEqual(translateUiPhrase(values.en,lang), values.en, `${key}:${lang}`);
  }
});
for (const [tab,route] of [["payroll","/dashboard/accounts/payroll"],["ta-approvals","/dashboard/accounts/ta-approvals"]]) test(`legacy Attendance ${tab} URL redirects to Accounts`, () => {
  setup("accountant"); globalThis.UI_SEARCH=`tab=${tab}`; let calls=0; globalThis.UI_ATTENDANCE=async()=>{calls++;return{data:{}};};
  render(React.createElement(AttendancePage)); assert.equal(globalThis.UI_REDIRECT,route); assert.equal(calls,0);
});
test("Attendance & Services has personal claims and payslips but no finance tabs", async () => {
  setup("hqadmin"); globalThis.UI_ATTENDANCE=async()=>({data:{success:true,access:{canManageAnyStudents:true,canManageHqStaff:true,canViewOwnStaffAttendance:true,canApplyOwnStaffLeave:true,canViewOwnTaClaims:true,canReviewTaClaims:true,canManagePayrollGlobally:true,canViewOwnPayslip:true},schools:[],academicYears:[],courses:[],defaultScopeType:"HQ"}});
  render(React.createElement(AttendancePage)); await screen.findByText("Attendance & Services"); assert(screen.getByRole("button",{name:"My TA Claims"}));assert(screen.getByRole("button",{name:"My Payslips"}));assert.equal(screen.queryByRole("button",{name:"Payroll"}),null);assert.equal(screen.queryByRole("button",{name:"TA Approvals"}),null);
});
test("Accounts cards use new routes with independent finance permissions", () => {
  setup("accountant");globalThis.UI_AUTH.can=p=>[PERMISSIONS.PAYROLL_VIEW,PERMISSIONS.TA_REVIEW_VIEW].includes(p);
  render(React.createElement(AccountsPage));assert.equal(screen.getByText("Payroll").closest("a").getAttribute("href"),"/dashboard/accounts/payroll");assert.equal(screen.getByText("TA Approvals").closest("a").getAttribute("href"),"/dashboard/accounts/ta-approvals");assert.equal(screen.queryByText("Invoice Payments"),null);
});
test("Niswan Admin Accounts has no HQ finance cards", () => {
  setup("admin");globalThis.UI_AUTH.can=p=>[PERMISSIONS.ACCOUNTS_VIEW,PERMISSIONS.ACCOUNTS_SCHOOL_INVOICES_VIEW].includes(p);
  render(React.createElement(AccountsPage));assert(screen.getByText("Invoice Payments"));assert.equal(screen.queryByText("Payroll"),null);assert.equal(screen.queryByText("TA Approvals"),null);
});
for(const language of TA_LANGUAGES)test(`Accounts TA page renders with correct direction: ${language}`, async()=>{
  setup("accountant",language);const view=render(React.createElement(AccountsFinancePage,{section:"ta-approvals"}));await screen.findByRole("button",{name:taText("Refresh",language)});assert.equal(screen.getByRole("link",{name:servicesText("Back to Accounts",language)}).getAttribute("href"),"/dashboard/accountsPage");assert.equal(view.container.firstElementChild.dir,["ar","ur"].includes(language)?"rtl":"ltr");
});
test("Accounts finance rejects a Niswan role even with a forged UI permission",()=>{
  setup("admin");let calls=0;globalThis.UI_ATTENDANCE=async()=>{calls++;return{data:{}};};render(React.createElement(AccountsFinancePage));assert(screen.getByRole("alert"));assert.equal(calls,0);
});
test("leave approval sends the current revision and blocks duplicate clicks",async()=>{
  setup("hqadmin");let calls=0,posted;const leave={_id:"leave-1",revision:7,status:"Pending",userId:{name:"Another staff",role:"hquser"},leaveType:"Sick Leave",fromDateKey:"2026-10-01",toDateKey:"2026-10-01",reason:"தமிழ் العربية"};
  globalThis.UI_ATTENDANCE=async(method,path,body)=>{if(method==="PATCH"){calls++;posted=body;return{data:{message:"Done"}};}return{data:{leaves:path.endsWith("approvals")&&calls===0?[leave]:[]}};};
  render(React.createElement(LeaveTab,{meta:{access:{canManageHqStaff:true,canApplyOwnStaffLeave:true},academicYears:[],courses:[]},staffScopeType:"HQ"}));const button=await screen.findByRole("button",{name:"Approve Paid"});fireEvent.click(button);fireEvent.click(button);await waitFor(()=>assert(posted));assert.equal(calls,1);assert.equal(posted.revision,7);assert.equal(posted.isPaid,true);
});
test("stale leave action reports a translated error and refreshes without retry",async()=>{
  setup("hqadmin","ta");let writes=0,reads=0;const leave={_id:"leave-1",revision:2,status:"Pending",userId:{name:"Other",role:"hqstaff"},leaveType:"Sick Leave",fromDateKey:"2026-10-01",toDateKey:"2026-10-01",reason:"Reason"};
  globalThis.UI_ATTENDANCE=async(method,path)=>{if(method==="PATCH"){writes++;throw{response:{data:{code:"LEAVE_STALE"}}};}reads++;return{data:{leaves:path.endsWith("approvals")&&writes===0?[leave]:[]}};};
  render(React.createElement(LeaveTab,{meta:{access:{canManageHqStaff:true},academicYears:[],courses:[]},staffScopeType:"HQ"}));fireEvent.click(await screen.findByRole("button",{name:translateUiPhrase("Approve Paid","ta")}));await waitFor(()=>assert(globalThis.UI_ALERTS.some(args=>args[1]===servicesText("LEAVE_STALE","ta"))));assert.equal(writes,1);assert(reads>=2);
});
test("a payroll invalidated by leave requires recalculation before review",async()=>{
  setup("accountant");const month=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()).slice(0,7);globalThis.UI_ATTENDANCE=async()=>({data:{run:{_id:"run",monthKey:month,status:"Draft",revision:5,taPolicyVersion:1,needsRecalculation:true,workingDays:20,items:[]}}});
  render(React.createElement(PayrollTab,{meta:{access:{canManagePayrollGlobally:true}}}));await screen.findByText("Leave or attendance changed. Recalculate this payroll before review.");assert.equal(screen.queryByRole("button",{name:"Mark Reviewed"}),null);
});

test("Accounts Payroll loads permission-scoped metadata before the existing payroll screen",async()=>{
  setup("accountant");const calls=[];globalThis.UI_AUTH.can=p=>p===PERMISSIONS.PAYROLL_VIEW;
  globalThis.UI_ATTENDANCE=async(method,path)=>{calls.push(path);return{data:path==="meta"?{success:true,access:{canManagePayrollGlobally:true}}:{run:null}};};
  render(React.createElement(AccountsFinancePage,{section:"payroll"}));await screen.findByText("No payroll draft for the selected month");assert.deepEqual(calls,["meta","payroll"]);assert.equal(screen.getByRole("link",{name:"Back to Accounts"}).getAttribute("href"),"/dashboard/accountsPage");
});
test("Accounts finance does not fetch data when its specific permission is revoked",()=>{
  setup("accountant");globalThis.UI_AUTH.can=()=>false;let calls=0;globalThis.UI_ATTENDANCE=async()=>{calls++;return{data:{}};};render(React.createElement(AccountsFinancePage,{section:"payroll"}));assert(screen.getByRole("alert"));assert.equal(calls,0);
});
