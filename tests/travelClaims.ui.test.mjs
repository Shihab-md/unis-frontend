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
const temporary = await mkdtemp(join(tmpdir(), "unis-ta-ui-"));
const bundle = join(temporary, "components.cjs");
await esbuild.build({ stdin: { contents: `export {default as AccountsFinancePage} from './src/components/accounts/AccountsFinancePage.jsx'; export {default as AccountsPage} from './src/components/dashboard/AccountsPage.jsx'; export {default as AttendancePage} from './src/components/attendance/AttendancePage.jsx'; export {default as LeaveTab} from './src/components/attendance/LeaveTab.jsx'; export {default as TravelClaimsTab} from './src/components/attendance/TravelClaimsTab.jsx'; export {default as PayrollTab} from './src/components/attendance/PayrollTab.jsx'; export {default as MyPayslipsTab} from './src/components/attendance/MyPayslipsTab.jsx';`, resolveDir: root, loader: "jsx" },
  outfile: bundle, define: { "import.meta.env": JSON.stringify({ VITE_UNIS_TIMEZONE: "Asia/Kolkata" }) }, bundle: true, platform: "node", format: "cjs", jsx: "transform", plugins: [{ name: "isolated-adapters", setup(build) {
    build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: "router", namespace: "test-adapter" }));
    build.onResolve({ filter: /(?:^|\/)(?:CommonHeader|AttendanceOverview)$/ }, (args) => ({ path: args.path.split("/").at(-1), namespace: "test-adapter" }));
    build.onResolve({ filter: /^react(?:\/.*)?$/ }, (args) => ({ path: require.resolve(args.path), external: true }));
    build.onResolve({ filter: /(?:context\/AuthContext|i18n\/LanguageContext|api\/travelClaimApi|api\/attendanceApi|utils\/CommonHelper)$/ }, (args) => ({ path: args.path.split("/").at(-1), namespace: "test-adapter" }));
    build.onLoad({ filter: /.*/, namespace: "test-adapter" }, ({ path }) => {
      const source = {
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
  globalThis.UI_ALERTS = []; globalThis.UI_SEARCH = ""; globalThis.UI_REDIRECT = "";
  globalThis.UI_LANGUAGE = language; window.localStorage.setItem("preferredLanguage", language);
  globalThis.UI_AUTH = { user: { _id: "user-self", role }, can: () => true };
  globalThis.UI_META = { success: true, canViewOwn: true, canManageOwn: true, canReview: ["accountant","hqadmin","superadmin"].includes(role), canApprove: ["accountant","hqadmin","superadmin"].includes(role) };
  globalThis.UI_RECORD = { _id:"507f1f77bcf86cd799439011", claimNumber:"TA-507F1F77BCF86CD799439011",userId:"user-self",name:"தமிழ் العربية",staffCode:"SUP-1",status:"Draft",revision:1,
    fromDateKey:"2026-10-01",toDateKey:"2026-10-02",fromPlace:"மதுரை",toPlace:"مدرسة",purpose:"பள்ளி ஆய்வு",transport:"Bus",requestedAmountPaise:120025,approvedAmountPaise:0,
    expenses:[{description:"சீட்டு",amountPaise:120025}],evidence:[],history:[{action:"Created",at:"2026-10-03T00:00:00Z"}] };
  globalThis.UI_LIST = [];
  globalThis.UI_API = async (method,path) => ({ data: path==="/meta" ? globalThis.UI_META : ["/mine","/review"].includes(path) ? {claims:globalThis.UI_LIST,nextCursor:null} : {claim:globalThis.UI_RECORD} });
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
test("TA form preserves multilingual journey text and sends a stable request key", async () => {
  setup("supervisor","ta");let submitted;
  globalThis.UI_API=async(method,path,data)=>{if(method==="POST"){submitted=data;return{data:{claim:globalThis.UI_RECORD}};}return{data:path==="/meta"?globalThis.UI_META:{claims:[],nextCursor:null}};};
  render(React.createElement(TravelClaimsTab));fireEvent.click(await screen.findByRole("button",{name:taText("New TA Claim","ta")}));
  for(const [label,value]of [["Journey Start","2026-10-01"],["Journey End","2026-10-02"],["From Place","மதுரை"],["To Place","مدرسة"],["Transport Mode","Bus"],["Travel Purpose","பள்ளி ஆய்வு"]])fireEvent.change(screen.getByLabelText(taText(label,"ta")),{target:{value}});
  fireEvent.change(screen.getByLabelText(`${taText("Expense Description","ta")} 1`),{target:{value:"பயணச்சீட்டு"}});
  fireEvent.change(screen.getByLabelText(`${taText("Amount","ta")} 1`),{target:{value:"1200.25"}});
  fireEvent.click(screen.getByRole("button",{name:taText("Save Draft","ta")}));
  await waitFor(()=>assert(submitted));assert.equal(submitted.fromPlace,"மதுரை");assert.equal(submitted.toPlace,"مدرسة");assert.equal(submitted.expenses[0].description,"பயணச்சீட்டு");assert.match(submitted.requestKey,/^[0-9a-f-]{36}$/);
});
test("evidence upload sends the original Unicode filename as an explicit UTF-8 field", async () => {
  setup();globalThis.UI_LIST=[globalThis.UI_RECORD];let captured;
  const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data)=>{if(method==="POST"&&path.endsWith("/evidence")){captured=data;return{data:{claim:globalThis.UI_RECORD}};}return fallback(method,path,data);};
  const view=render(React.createElement(TravelClaimsTab));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));
  await screen.findByText("Claim History");fireEvent.change(view.container.querySelector('input[type="file"]'),{target:{files:[new File(["%PDF-1.7"],"சான்று.pdf",{type:"application/pdf"})]}});
  await waitFor(()=>assert(captured));assert.equal(captured.get("originalName"),"சான்று.pdf");assert.equal(captured.get("revision"),"1");
});
test("an Accountant sees their own claim without self-approval controls", async () => {
  setup("accountant","ur");globalThis.UI_RECORD.status="Submitted";globalThis.UI_LIST=[globalThis.UI_RECORD];
  render(React.createElement(TravelClaimsTab,{review:true}));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));
  await screen.findByText(taText("Claim History","ur"));assert.equal(screen.queryByRole("button",{name:taText("Approve Claim","ur")}),null);assert(screen.getByText(taText("TA_SELF_APPROVAL","ur")));
});
test("an authorized reviewer can act on another claimant and confirms the action", async () => {
  setup("accountant","ar");globalThis.UI_RECORD.status="Submitted";globalThis.UI_RECORD.userId="other-user";globalThis.UI_LIST=[globalThis.UI_RECORD];let posted;
  const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data)=>{if(method==="POST"){posted=data;return{data:{claim:{...globalThis.UI_RECORD,status:"Approved"}}};}return fallback(method,path,data);};
  render(React.createElement(TravelClaimsTab,{review:true}));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));
  fireEvent.click(await screen.findByRole("button",{name:taText("Approve Claim","ar")}));
  assert.equal(posted,undefined);fireEvent.click(screen.getByRole("button",{name:taText("Confirm","ar")}));await waitFor(()=>assert(posted));assert.equal(posted.decision,"Approved");assert.equal(posted.revision,1);
});
test("duplicate confirmation clicks dispatch only one submit request", async () => {
  setup();globalThis.UI_RECORD.evidence=[{_id:"evidence",name:"receipt.pdf",size:30}];globalThis.UI_LIST=[globalThis.UI_RECORD];let count=0,release;
  const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data)=>{if(method==="POST"){count++;await new Promise(r=>{release=r;});return{data:{claim:{...globalThis.UI_RECORD,status:"Submitted"}}};}return fallback(method,path,data);};
  render(React.createElement(TravelClaimsTab));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));
  fireEvent.click(await screen.findByRole("button",{name:"Submit Claim"}));const confirm=screen.getByRole("button",{name:"Confirm"});fireEvent.click(confirm);fireEvent.click(confirm);assert.equal(count,1);release();await screen.findByText("TA changes saved.");
});
test("localized stale-claim error appears without an automatic POST retry", async () => {
  setup("supervisor","kn");globalThis.UI_LIST=[globalThis.UI_RECORD];globalThis.UI_RECORD.evidence=[{_id:"file",name:"receipt.pdf"}];let count=0;
  const fallback=globalThis.UI_API;globalThis.UI_API=async(method,path,data)=>{if(method==="POST"){count++;throw{response:{status:409,data:{code:"TA_STALE"}}};}return fallback(method,path,data);};
  render(React.createElement(TravelClaimsTab));fireEvent.click(await screen.findByRole("button",{name:new RegExp(globalThis.UI_RECORD.claimNumber)}));fireEvent.click(await screen.findByRole("button",{name:taText("Submit Claim","kn")}));fireEvent.click(screen.getByRole("button",{name:taText("Confirm","kn")}));
  await screen.findByText(taText("TA_STALE","kn"));assert.equal(count,1);
});
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
