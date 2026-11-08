import test,{afterEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {translateUiPhrase} from '../src/i18n/uiPhrases.js';
const require=createRequire(import.meta.url),{JSDOM,VirtualConsole}=require('jsdom'),esbuild=require('esbuild');
const vc=new VirtualConsole();vc.on('jsdomError',error=>{if(error.type!=='css parsing')console.error(error);});
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://local.test',pretendToBeVisual:true,virtualConsole:vc});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Element:dom.window.Element,Node:dom.window.Node,DOMParser:dom.window.DOMParser,MutationObserver:dom.window.MutationObserver,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,getComputedStyle:dom.window.getComputedStyle});
for(const name of Object.getOwnPropertyNames(dom.window))if(/^(HTML|SVG)/.test(name)&&typeof dom.window[name]==='function')globalThis[name]=dom.window[name];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});window.scrollTo=()=>{};window.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{render,screen,fireEvent,waitFor,cleanup,act}=require('@testing-library/react');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),temp=await mkdtemp(join(tmpdir(),'unis-six-popup-'));
await esbuild.build({stdin:{contents:`export {default as school} from './src/components/school/List.jsx';export {default as supervisor} from './src/components/supervisor/List.jsx';export {default as employee} from './src/components/employee/List.jsx';export {default as certificate} from './src/components/certificate/List.jsx';export {default as course} from './src/components/course/List.jsx';export {default as inspection} from './src/components/supervisor/InspectionReportList.jsx';export {default as Swal} from 'sweetalert2';`,resolveDir:root,loader:'jsx'},outfile:join(temp,'pages.cjs'),bundle:true,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},define:{'import.meta.env':JSON.stringify({})},logLevel:'silent',plugins:[{name:'offline',setup(build){
 build.onResolve({filter:/^react(?:-dom)?(?:\/.*)?$/},a=>({path:require.resolve(a.path),external:true}));
 build.onResolve({filter:/^axios$|^react-router-dom$|^react-data-table-component$|(?:context\/AuthContext|i18n\/LanguageContext|api\/inspectionReportApi|school\/SchoolReportActions|\.\/SchoolReportActions|utils\/(?:CommonHelper|SchoolHelper|SupervisorHelper|EmployeeHelper|CertificateHelper|CourseHelper|DistrictStateHelper|AcademicYearHelper))$/},a=>({path:a.path.split('/').at(-1),namespace:'offline'}));
 build.onLoad({filter:/.*/,namespace:'offline'},({path})=>({loader:'jsx',resolveDir:root,contents:{
  axios:`export default {get:(...args)=>globalThis.P_GET(...args)};`,
  'react-router-dom':`import React from 'react';const nav=()=>{};export const useNavigate=()=>nav;export const Link=({to,children,...p})=><a href={to} {...p}>{children}</a>;`,
  'react-data-table-component':`export default ({data=[]})=><div data-testid='records'>{data.map((r,i)=><span key={i}>{r.name||r.studentName||r.title}</span>)}</div>;`,
  AuthContext:`export const useAuth=()=>({user:globalThis.P_USER,can:()=>true});`,
  LanguageContext:`import React from 'react';import {translateUiPhrase} from './src/i18n/uiPhrases.js';export const useLanguage=()=>({tr:t=>translateUiPhrase(t,globalThis.P_LANG),t:(_k,f)=>translateUiPhrase(f,globalThis.P_LANG),language:globalThis.P_LANG,direction:['ar','ur'].includes(globalThis.P_LANG)?'rtl':'ltr',fontFamily:'sans-serif'});export const AutoText=({as:C='span',text,children,variant,...p})=><C {...p}>{children??text}</C>;`,
  CommonHelper:`import React from 'react';export const getBaseUrl=async()=>'/offline/';export const handleRightClickAndFullScreen=()=>{};export const getSpinner=()=>null;export const getPrcessing=()=>null;export const getFilterGif=()=>null;export const getButtonStyle=()=>'';export const checkAuth=()=>'YES';export const LinkIcon=(_to,purpose)=><button type='button' aria-label={purpose}>{purpose}</button>;export const showSwalAlert=(...args)=>globalThis.P_ALERTS.push(args);export const toCamelCase=x=>x;`,
  SchoolHelper:`export const columns=[];export const conditionalRowStyles=[];export const SchoolButtons=()=>null;export const SchoolCard=()=>null;export const getSchoolsFromCache=async()=>globalThis.P_OPTIONS.schools;`,
  SupervisorHelper:`export const columns=[];export const conditionalRowStyles=[];export const SupervisorButtons=()=>null;export const SupervisorCard=()=>null;export const getSupervisorsFromCache=async()=>globalThis.P_OPTIONS.supervisors;`,
  EmployeeHelper:`export const columns=[];export const conditionalRowStyles=[];export const EmployeeButtons=()=>null;export const EmployeeCard=()=>null;`,
  CertificateHelper:`export const columns=[];export const CertificateButtons=()=>null;export const CertificateCard=()=>null;`,
  CourseHelper:`export const columns=[];export const CourseButtons=()=>null;export const CourseCard=()=>null;export const getCourseSubjects=()=>[];export const getCoursesFromCache=async()=>globalThis.P_OPTIONS.courses;`,
  DistrictStateHelper:`export const getDistrictStatesFromCache=async()=>globalThis.P_OPTIONS.locations;`,
  AcademicYearHelper:`export const getAcademicYearsFromCache=async()=>globalThis.P_OPTIONS.years;`,
  SchoolReportActions:`export default ({filters,loading})=><div data-testid='report-filters' data-loading={loading}>{JSON.stringify(filters)}</div>;`,
  inspectionReportApi:`export const fetchInspectionReports=(...args)=>globalThis.P_INSPECTION(...args);`,
 }[path]}));
}}]});
const pages=require(join(temp,'pages.cjs')),Swal=pages.Swal;
const configs=[
 {name:'school',keys:{supervisorId:'supervisorId',districtStateId:'districtStateId',status:'schStatus',q:'popupFilter:school:search'},values:{supervisorId:'sup',districtStateId:'loc',status:'Active',q:'Row'},labels:{supervisorId:'SUP-1 : Row Muavin',districtStateId:'Madurai, Tamilnadu',status:'Active'},edit:'status',other:'In-Active',route:'/offline/school/bySchFilter/sup/loc/Active'},
 {name:'supervisor',keys:{schoolId:'supSchoolId',status:'supStatus',jobType:'supType',q:'popupFilter:supervisor:search'},values:{schoolId:'n1',status:'Active',jobType:'Full-Time',q:'Row'},labels:{schoolId:'N1 : Row Niswan',status:'Active',jobType:'Full-Time'},edit:'status',other:'In-Active',route:'/offline/supervisor/bySupFilter/n1/Active/Full-Time'},
 {name:'employee',keys:{schoolId:'empSchoolId',role:'empRole',status:'empStatus',q:'popupFilter:employee:search'},values:{schoolId:'n1',role:'teacher',status:'Active',q:'Row'},labels:{schoolId:'N1 : Row Niswan',role:'Teacher',status:'Active'},edit:'status',other:'In-Active',route:'/offline/employee/byEmpFilter/n1/teacher/Active'},
 {name:'certificate',keys:{schoolId:'certSchoolId',courseId:'certCourseId',acYear:'certACYearId',q:'popupFilter:certificate:search'},values:{schoolId:'n1',courseId:'c1',acYear:'y2',q:'Row'},labels:{schoolId:'N1 : Row Niswan',courseId:'Row Course',acYear:'2026-2027'},edit:'courseId',other:'Other Course',otherValue:'c2',route:'/offline/certificate/byCertFilter/n1/c1/y2'},
 {name:'course',keys:{courseType:'popupFilter:course:type',q:'popupFilter:course:search'},values:{courseType:'Deeniyath Education',q:'Row'},labels:{courseType:'Deeniyath Education',q:'Row'},edit:'courseType',other:'School Education',route:'/offline/course'},
 {name:'inspection',keys:{fromDate:'popupFilter:inspection:from',toDate:'popupFilter:inspection:to',q:'popupFilter:inspection:search'},values:{fromDate:'2026-10-01',toDate:'2026-10-31',q:'Row'},labels:{fromDate:'2026-10-01',toDate:'2026-10-31',q:'Row'},edit:'fromDate',other:'2026-09-01'},
];
function setup(cfg,language='en',role='superadmin'){
 localStorage.clear();sessionStorage.clear();globalThis.P_LANG=language;globalThis.P_USER={_id:'user-test',role};globalThis.P_CALLS=[];globalThis.P_I_CALLS=[];globalThis.P_ALERTS=[];
 localStorage.setItem('schoolId','n1');localStorage.setItem('schoolName','N1 : Row Niswan');
 globalThis.P_OPTIONS={schools:[{_id:'n1',code:'N1',nameEnglish:'Row Niswan',active:'Active'}],supervisors:[{_id:'sup',supervisorId:'SUP-1',userId:{name:'Row Muavin'}}],locations:[{_id:'loc',district:'Madurai',state:'Tamilnadu'}],courses:[{_id:'c1',name:'Row Course',code:'C1',type:'Deeniyath Education'},{_id:'c2',name:'Other Course',code:'C2',type:'School Education'}],years:[{_id:'y1',acYear:'2025-2026',active:'Active'},{_id:'y2',acYear:'2026-2027',active:'In-Active'}]};
 const data={success:true,schools:globalThis.P_OPTIONS.schools,supervisors:globalThis.P_OPTIONS.supervisors,employees:[{_id:'emp',employeeId:'EMP-1',userId:{_id:'other-user',name:'Row Employee',role:'teacher'},schoolId:globalThis.P_OPTIONS.schools[0]}],certificates:[{_id:'cert',code:'CERT-1',userId:{name:'Row Student'},studentId:{rollNumber:'R1'},courseId:{name:'Row Course'},schoolId:globalThis.P_OPTIONS.schools[0]}],courses:globalThis.P_OPTIONS.courses};
 globalThis.P_GET=async(...args)=>{globalThis.P_CALLS.push(args);return {data};};
 globalThis.P_INSPECTION=async(filters)=>{globalThis.P_I_CALLS.push({...filters});return {data:[{_id:'inspection',title:'Row Report',supervisorName:'Row Muavin',schoolName:'Row Niswan',reportDate:'2026-10-10'}]};};
 for(const[key,value]of Object.entries(cfg.values))localStorage.setItem(cfg.keys[key],value);
}
const tr=label=>translateUiPhrase(label,globalThis.P_LANG);
function snapshot(cfg){return JSON.stringify(Object.fromEntries(Object.entries(cfg.keys).map(([field,key])=>[field,localStorage.getItem(key)])));}
function fieldValue(key){const input=document.getElementById('popup-filter-'+key);assert(input,key);if(['date','text'].includes(input.type)&&!input.getAttribute('role'))return input.value;return input.closest('.text-sm').querySelector('[class*="-singleValue"]')?.textContent||'';}
async function ready(cfg){const view=render(React.createElement(pages[cfg.name]));await screen.findByRole('button',{name:'Filter'});return view;}
async function open(){fireEvent.click(screen.getByRole('button',{name:'Filter'}));await waitFor(()=>assert(Swal.getConfirmButton()&&document.querySelector('[id^="popup-filter-"]')));}
async function close(apply=false){await act(async()=>{fireEvent.click(apply?Swal.getConfirmButton():Swal.getCancelButton());await new Promise(r=>setTimeout(r,20));});await waitFor(()=>assert(document.querySelector('[id^="popup-filter-"]')===null));}
async function reset(){await act(async()=>{fireEvent.click(Swal.getDenyButton());});assert(Swal.getPopup()?.isConnected);}
async function edit(cfg){const input=document.getElementById('popup-filter-'+cfg.edit);if(input.type==='date')fireEvent.change(input,{target:{value:cfg.other}});else{fireEvent.keyDown(input,{key:'ArrowDown',code:'ArrowDown'});fireEvent.click(await screen.findByRole('option',{name:tr(cfg.other),exact:true}));}}
const requests=()=>globalThis.P_CALLS.length+globalThis.P_I_CALLS.length;
afterEach(async()=>{await act(async()=>{Swal.close();await new Promise(r=>setTimeout(r,20));});cleanup();});after(()=>dom.window.close());
for(const cfg of configs){
 test(`${cfg.name}: restores all fields/search and preserves them across remount`,async()=>{
  setup(cfg);const page=await ready(cfg);assert.equal(screen.getByPlaceholderText(tr('Search')).value,'Row');await open();
  for(const[field,label]of Object.entries(cfg.labels))assert.equal(fieldValue(field),tr(label),field);
  await close();page.unmount();await ready(cfg);await open();for(const[field,label]of Object.entries(cfg.labels))assert.equal(fieldValue(field),tr(label),field);
  if(cfg.route)assert(globalThis.P_CALLS.some(args=>args[0]===cfg.route));
 });
 test(`${cfg.name}: Apply without editing retains every saved selection`,async()=>{
  setup(cfg);await ready(cfg);const before=snapshot(cfg);await open();await close(true);assert.equal(snapshot(cfg),before);assert.equal(screen.getByPlaceholderText(tr('Search')).value,'Row');
 });
 test(`${cfg.name}: Cancel after editing preserves storage, search and applied results`,async()=>{
  setup(cfg);await ready(cfg);const before=snapshot(cfg),count=requests();await open();await edit(cfg);await close();assert.equal(snapshot(cfg),before);assert.equal(requests(),count);assert.equal(screen.getByPlaceholderText(tr('Search')).value,'Row');
 });
 test(`${cfg.name}: Reset then Cancel does not commit draft defaults`,async()=>{
  setup(cfg);await ready(cfg);const before=snapshot(cfg),count=requests();await open();await reset();
  for(const key of Object.keys(cfg.labels))assert.equal(fieldValue(key),cfg.name==='certificate'&&key==='acYear'?'2025-2026':'',key);
  await close();assert.equal(snapshot(cfg),before);assert.equal(requests(),count);assert.equal(screen.getByPlaceholderText(tr('Search')).value,'Row');
 });
 test(`${cfg.name}: Reset then Apply clears optional filters/search and retains global Niswan context`,async()=>{
  setup(cfg);await ready(cfg);await open();await reset();await close(true);
  for(const[field,key]of Object.entries(cfg.keys))assert.equal(localStorage.getItem(key),cfg.name==='certificate'&&field==='acYear'?'y1':null,field);
  assert.equal(screen.getByPlaceholderText(tr('Search')).value,'');assert.equal(localStorage.getItem('schoolId'),'n1');assert.equal(localStorage.getItem('schoolName'),'N1 : Row Niswan');
 });
 test(`${cfg.name}: changing one field preserves every untouched field`,async()=>{
  setup(cfg);await ready(cfg);await open();await edit(cfg);await close(true);
  for(const[field,value]of Object.entries(cfg.values))assert.equal(localStorage.getItem(cfg.keys[field]),field===cfg.edit?(cfg.otherValue||cfg.other):value,field);
 });
 for(const language of ['en','ta','ur','ar','ml','kn','te'])test(`${cfg.name}: popup labels/buttons/direction support ${language}`,async()=>{
  setup(cfg,language);await ready(cfg);await open();assert.equal(Swal.getConfirmButton().textContent,tr('Apply'));assert.equal(Swal.getCancelButton().textContent,tr('Cancel'));assert(Swal.getDenyButton().textContent.includes(tr('Reset')));
  assert.equal(Swal.getHtmlContainer().querySelector('[dir]').dir,['ar','ur'].includes(language)?'rtl':'ltr');assert(!Swal.getHtmlContainer().textContent.includes('\ufffd'));await reset();assert(Swal.getPopup().isConnected);
 });
}
test('Niswan report/PDF criteria match the applied popup and Reset criteria',async()=>{
 const cfg=configs[0];setup(cfg);await ready(cfg);await open();await reset();await close(true);
 await waitFor(()=>assert.equal(JSON.parse(screen.getByTestId('report-filters').textContent).search,''));
 assert.deepEqual(JSON.parse(screen.getByTestId('report-filters').textContent),{supervisorId:'',districtStateId:'',status:'',search:''});
 assert.equal(screen.getByTestId('report-filters').getAttribute('data-loading'),'false');
});
for(const name of ['school','supervisor','employee'])test(`${name}: scoped Supervisor does not gain access to the HQ popup`,async()=>{
 const cfg=configs.find(c=>c.name===name);setup(cfg,'en','supervisor');render(React.createElement(pages[name]));await screen.findByPlaceholderText('Search');assert.equal(screen.queryByRole('button',{name:'Filter'}),null);
 if(name==='employee')assert(!globalThis.P_CALLS.some(args=>args[0].includes('byEmpFilter')));
});
test('Certificate Reset keeps the role-fixed Niswan and default academic year',async()=>{
 const cfg=configs[3];setup(cfg,'en','admin');await ready(cfg);await open();assert(document.getElementById('popup-filter-schoolId').disabled);await reset();assert.equal(fieldValue('schoolId'),'N1 : Row Niswan');await close(true);
 assert.equal(localStorage.getItem('certSchoolId'),'n1');assert.equal(localStorage.getItem('certACYearId'),'y1');assert.equal(localStorage.getItem('certCourseId'),null);
});
test('legacy HQ admin is not incorrectly locked to a Niswan',async()=>{
 const cfg=configs[3];setup(cfg,'en','admin');globalThis.P_USER.organizationType='HQ';await ready(cfg);await open();assert(!document.getElementById('popup-filter-schoolId').disabled);await reset();assert.equal(fieldValue('schoolId'),'');
});
test('failed Certificate option loading preserves applied filters and can retry',async()=>{
 const cfg=configs[3];setup(cfg);await ready(cfg);const before=snapshot(cfg),years=globalThis.P_OPTIONS.years;globalThis.P_OPTIONS.years=undefined;
 fireEvent.click(screen.getByRole('button',{name:'Filter'}));await waitFor(()=>assert.equal(globalThis.P_ALERTS.length,1));assert.equal(snapshot(cfg),before);globalThis.P_OPTIONS.years=years;await open();assert.equal(fieldValue('acYear'),'2026-2027');
});
test('Inspection ignores an older response after a newer search was loaded',async()=>{
 const cfg=configs[5];setup(cfg);await ready(cfg);const pending=[];globalThis.P_INSPECTION=filters=>new Promise(resolve=>pending.push({filters,resolve}));
 fireEvent.change(screen.getByPlaceholderText('Search'),{target:{value:'older'}});fireEvent.change(screen.getByPlaceholderText('Search'),{target:{value:'newer'}});assert.equal(pending.length,2);
 await act(async()=>pending[1].resolve({data:[{_id:'new',title:'Newer result'}]}));await act(async()=>pending[0].resolve({data:[{_id:'old',title:'Old result'}]}));
 assert.equal(screen.getByTestId('records').textContent,'Newer result');
});
test('popup storage is separate by screen and included in existing logout/context cleanup',async()=>{
 const source=await readFile(join(root,'src/utils/CommonHelper.jsx'),'utf8');const start=source.indexOf('export function removeLocalStorage()');
 const clear=new Function('localStorage',source.slice(start).replace('export function','function')+';return removeLocalStorage;')(localStorage);
 setup(configs[0]);localStorage.setItem('popupFilter:course:type','School Education');localStorage.setItem('popupFilter:inspection:from','2026-10-01');localStorage.setItem('preferredLanguage','ta');clear();
 assert.equal(localStorage.getItem('popupFilter:course:type'),null);assert.equal(localStorage.getItem('popupFilter:inspection:from'),null);assert.equal(localStorage.getItem('preferredLanguage'),'ta');
});
for(const cfg of configs.slice(0,4))test(`${cfg.name}: late filter response cannot replace newer Reset results or leave loading active`,async()=>{
 setup(cfg);await ready(cfg);const original=globalThis.P_GET;const sample=await original('/sample');const pending=[];
 globalThis.P_GET=(...args)=>new Promise(resolve=>pending.push({args,resolve}));
 await open();await edit(cfg);await close(true);assert.equal(pending.length,1);
 await open();await reset();await close(true);assert.equal(pending.length,2);
 const collection={school:'schools',supervisor:'supervisors',employee:'employees',certificate:'certificates'}[cfg.name];
 const response=(name)=>{const data=JSON.parse(JSON.stringify(sample.data));const row=data[collection][0];if(cfg.name==='school')row.nameEnglish=name;else row.userId.name=name;return {data};};
 await act(async()=>pending[1].resolve(response('Latest reset result')));
 await act(async()=>pending[0].resolve(response('Stale filter result')));
 assert.equal(screen.getByTestId('records').textContent,'Latest reset result');
 if(cfg.name==='school')assert.equal(screen.getByTestId('report-filters').getAttribute('data-loading'),'false');
});
