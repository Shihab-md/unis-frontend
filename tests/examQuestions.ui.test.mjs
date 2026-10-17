import test, { afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { EXAM_QUESTION_LANGUAGES, EXAM_QUESTION_PHRASES } from "../src/i18n/examQuestionTranslations.js";
import { translateUiPhrase } from "../src/i18n/uiPhrases.js";
import { PERMISSIONS } from "../src/auth/permissions.js";
const require=createRequire(import.meta.url), {JSDOM}=require("jsdom"), esbuild=require("esbuild");
const dom=new JSDOM("<!doctype html><html><body></body></html>",{url:"https://local.test"});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,HTMLInputElement:dom.window.HTMLInputElement,MutationObserver:dom.window.MutationObserver,FormData:dom.window.FormData,File:dom.window.File});
Object.defineProperty(globalThis,"navigator",{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
const React=require("react"),{render,screen,fireEvent,waitFor,cleanup}=require("@testing-library/react");
const root=resolve(dirname(fileURLToPath(import.meta.url)),".."),temporary=await mkdtemp(join(tmpdir(),"unis-question-ui-")),bundle=join(temporary,"page.cjs");
await esbuild.build({entryPoints:[join(root,"src/components/exam/QuestionPapersPage.jsx")],outfile:bundle,bundle:true,platform:"node",format:"cjs",jsx:"transform",plugins:[{name:"test-adapters",setup(build){
  build.onResolve({filter:/^react(?:\/.*)?$/},args=>({path:require.resolve(args.path),external:true}));
  build.onResolve({filter:/^sweetalert2$/},()=>({path:"swal",namespace:"adapter"}));
  build.onResolve({filter:/^react-router-dom$/},()=>({path:"router",namespace:"adapter"}));
  build.onResolve({filter:/(?:context\/AuthContext|i18n\/LanguageContext|api\/examQuestionApi|utils\/CommonHelper)$/},args=>({path:args.path.split("/").at(-1),namespace:"adapter"}));
  build.onLoad({filter:/.*/,namespace:"adapter"},({path})=>({contents:{
    router:`export const useNavigate=()=>()=>{};`,
    swal:`export default {fire:async()=>({isConfirmed:true})};`,
    AuthContext:`export const useAuth=()=>({can:(key)=>globalThis.Q_PERMISSIONS.has(key)});`,
    LanguageContext:`import {translateUiPhrase} from ${JSON.stringify(join(root,"src/i18n/uiPhrases.js"))}; export const useLanguage=()=>({tr:(text)=>translateUiPhrase(text,globalThis.Q_LANGUAGE),direction:['ar','ur'].includes(globalThis.Q_LANGUAGE)?'rtl':'ltr'});`,
    CommonHelper:`export const getSpinner=()=>null; export const showSwalAlert=(...args)=>globalThis.Q_ALERTS.push(args);`,
    examQuestionApi:`export const fetchExamQuestionOptions=async()=>globalThis.Q_OPTIONS; export const fetchExamQuestions=async()=>({papers:globalThis.Q_PAPERS}); export const createExamQuestion=async(data)=>globalThis.Q_SAVE('POST',null,data); export const updateExamQuestion=async(id,data)=>globalThis.Q_SAVE('PUT',id,data); export const deleteExamQuestion=async()=>({}); export const fetchExamQuestionDownloads=async()=>({}); export const fetchExamQuestionFile=async()=>({data:new Blob(['%PDF-1.7'])});`,
  }[path],loader:"jsx",resolveDir:root}));
}}],logLevel:"silent"});
const Page=require(bundle).default;
afterEach(()=>cleanup());after(()=>dom.window.close());
function setup(language="en"){
  globalThis.Q_LANGUAGE=language;globalThis.Q_ALERTS=[];globalThis.Q_PAPERS=[];
  globalThis.Q_PERMISSIONS=new Set([PERMISSIONS.EXAM_QUESTION_VIEW,PERMISSIONS.EXAM_QUESTION_CREATE,PERMISSIONS.EXAM_QUESTION_EDIT,PERMISSIONS.EXAM_QUESTION_DELETE]);
  globalThis.Q_OPTIONS={academicYears:[{_id:"year",acYear:"2026-2027",active:"Active"}],courses:[{_id:"course",code:"C-1",name:"தமிழ் العربية",years:3,subjects:[{subjectNo:1,subjectCode:"S-1",subjectName:"தமிழ்"}]}],schools:[],examTypes:["Annual"],access:{canManage:true}};
  globalThis.Q_SAVE=async()=>({message:"Question Paper saved successfully."});
}
function fixture(status="Published",downloads=0){return{_id:"paper",academicYearId:"year",courseId:"course",courseCode:"C-1",courseName:"தமிழ் العربية",studyingYear:1,examType:"Annual",subjectNo:1,subjectCode:"S-1",subjectName:"தமிழ்",examDate:"2026-01-10",examStartTime:"10:00",releaseDate:"2026-01-10",releaseTime:"09:00",closeDate:"2026-01-10",closeTime:"12:00",publicationStatus:status,effectiveStatus:status==="Published"?"Released":status,targetType:"ALL",targetSchoolIds:[],totalDownloads:downloads,originalFileName:"question.pdf",title:"தமிழ் العربية",instructions:"വിവരണം / సూచనలు"};}
async function add(){const view=render(React.createElement(Page));fireEvent.click(await screen.findByRole("button",{name:"Add"}));return{view,form:document.querySelector("form")};}
function fill(form,{file=true}={}){
  const selects=form.querySelectorAll("select");
  for(const[index,value]of [[0,"year"],[1,"course"],[2,"1"],[3,"Annual"],[4,"1"]])fireEvent.change(selects[index],{target:{value}});
  const schedules=form.querySelectorAll('input[type="date"],input[type="time"]');
  ["2026-01-10","10:00","2026-01-10","09:00"].forEach((value,index)=>fireEvent.change(schedules[index],{target:{value}}));
  fireEvent.change(form.querySelector("textarea"),{target:{value:"தமிழ் العربية / വിവരണം"}});
  if(file)fireEvent.change(form.querySelector('input[type="file"]'),{target:{files:[new File(["%PDF-1.7"],"question.pdf",{type:"application/pdf"})]}});
}
test("new form notices have explicit valid UTF-8 translations in seven languages",()=>{for(const[key,values]of Object.entries(EXAM_QUESTION_PHRASES))for(const language of EXAM_QUESTION_LANGUAGES){assert(values[language]);assert(!/[\uFFFD]/.test(values[language]));assert.equal(translateUiPhrase(key,language),values[language]);if(language!=="en")assert.notEqual(values[language],key);}});
for(const language of EXAM_QUESTION_LANGUAGES)test(`Add form removes close/status controls and translates the new notice: ${language}`,async()=>{setup(language);const{view,form}=await add();assert.equal(view.container.firstElementChild.dir,["ar","ur"].includes(language)?"rtl":"ltr");assert.equal(form.querySelectorAll("select").length,5);assert.equal(form.querySelectorAll('input[type="date"]').length,2);assert.equal(form.querySelectorAll('input[type="time"]').length,2);assert(!/Close Date|Close Time|Publish Status/.test(form.textContent));assert(screen.getByText(EXAM_QUESTION_PHRASES["Question papers are published automatically. Downloads open at the selected release time."][language]));});
test("create sends the remaining fields and Unicode without close or publication fields",async()=>{setup("ta");let captured;globalThis.Q_SAVE=async(method,id,data)=>{captured={method,id,data};return{message:"Saved"};};const{form}=await add();fill(form);fireEvent.submit(form);await waitFor(()=>assert(captured));assert.equal(captured.method,"POST");for(const field of ["closeDate","closeTime","publicationStatus","availableUntil"])assert.equal(captured.data.has(field),false);assert.equal(captured.data.get("releaseDate"),"2026-01-10");assert.equal(captured.data.get("releaseTime"),"09:00");assert.equal(captured.data.get("instructions"),"தமிழ் العربية / വിവരണം");assert.equal(captured.data.get("file").name,"question.pdf");});
for(const status of ["Draft","Closed","Published"])test(`Edit removes controls without sending changes to saved ${status} settings`,async()=>{setup();globalThis.Q_PAPERS=[fixture(status)];let captured;globalThis.Q_SAVE=async(method,id,data)=>{captured={method,id,data};return{message:"Updated"};};render(React.createElement(Page));fireEvent.click(await screen.findByRole("button",{name:"Edit"}));const form=document.querySelector("form");assert(screen.getByText("Saved publication and closing settings are retained."));assert(!/Close Date|Close Time|Publish Status/.test(form.textContent));fireEvent.submit(form);await waitFor(()=>assert(captured));assert.equal(captured.method,"PUT");assert.equal(captured.id,"paper");for(const field of ["closeDate","closeTime","publicationStatus"])assert(!captured.data.has(field));});
test("downloaded-paper form still locks PDF exam details release and targets",async()=>{setup("ar");globalThis.Q_PAPERS=[fixture("Published",1)];render(React.createElement(Page));fireEvent.click(await screen.findByRole("button",{name:"Edit"}));const form=document.querySelector("form");assert([...form.querySelectorAll("select")].every(input=>input.disabled));assert([...form.querySelectorAll('input[type="date"],input[type="time"],input[type="file"],input[type="radio"]')].every(input=>input.disabled));assert(!form.querySelector("textarea").disabled);assert(screen.getByText(EXAM_QUESTION_PHRASES["This paper has already been downloaded by a Niswan. PDF, exam details, release time and targets are locked. You can still update the title/instructions."] .ar));});
test("missing PDF and release-after-exam remain blocked before create",async()=>{setup();let count=0;globalThis.Q_SAVE=async()=>{count++;return{};};const{form}=await add();fill(form,{file:false});fireEvent.submit(form);await waitFor(()=>assert(globalThis.Q_ALERTS.length));assert.equal(count,0);fill(form);fireEvent.change(form.querySelectorAll('input[type="time"]')[1],{target:{value:"11:00"}});fireEvent.submit(form);assert.equal(count,0);assert(globalThis.Q_ALERTS.some(row=>String(row[1]).includes("later than")));});
test("users without create and edit permission do not get those controls",async()=>{setup();globalThis.Q_PERMISSIONS.delete(PERMISSIONS.EXAM_QUESTION_CREATE);globalThis.Q_PERMISSIONS.delete(PERMISSIONS.EXAM_QUESTION_EDIT);globalThis.Q_PAPERS=[fixture()];render(React.createElement(Page));await screen.findByText("Question Papers");assert.equal(screen.queryByRole("button",{name:"Add"}),null);assert.equal(screen.queryByRole("button",{name:"Edit"}),null);});
