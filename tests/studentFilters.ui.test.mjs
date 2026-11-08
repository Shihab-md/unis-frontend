import test, { afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { translateUiPhrase } from '../src/i18n/uiPhrases.js';
import { getStudentResetFilters, readStudentFilters, saveStudentFilters } from '../src/utils/studentFilterUtils.js';
const require = createRequire(import.meta.url), { JSDOM, VirtualConsole } = require('jsdom'), esbuild = require('esbuild');
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => { if(error.type !== 'css parsing') console.error(error); });
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://local.test', pretendToBeVisual: true, virtualConsole });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement, HTMLButtonElement: dom.window.HTMLButtonElement, Element: dom.window.Element,
  Node: dom.window.Node, DOMParser: dom.window.DOMParser, MutationObserver: dom.window.MutationObserver,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, getComputedStyle: dom.window.getComputedStyle });
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
for(const name of Object.getOwnPropertyNames(dom.window)) {
  if(/^(HTML|SVG)/.test(name) && typeof dom.window[name]==='function')globalThis[name]=dom.window[name];
}
window.scrollTo=()=>{}; window.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'), {render,screen,fireEvent,waitFor,cleanup,act}=require('@testing-library/react');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'), temporary=await mkdtemp(join(tmpdir(),'unis-student-filters-'));
await esbuild.build({
  stdin:{contents:`export {default as StudentList} from './src/components/student/List.jsx';export {default as Swal} from 'sweetalert2';`,resolveDir:root,loader:'jsx'},
  outfile:join(temporary,'list.cjs'),bundle:true,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},logLevel:'silent',
  define:{'import.meta.env':JSON.stringify({VITE_UNIS_TIMEZONE:'Asia/Kolkata'})},
  plugins:[{name:'offline-adapters',setup(build){
    build.onResolve({filter:/^react(?:-dom)?(?:\/.*)?$/},args=>({path:require.resolve(args.path),external:true}));
    build.onResolve({filter:/^react-router-dom$|^axios$|^react-data-table-component$|(?:context\/AuthContext|i18n\/LanguageContext|utils\/(?:CommonHelper|StudentHelper|SchoolHelper|CourseHelper|InstituteHelper|AcademicYearHelper))$/},args=>({path:args.path.split('/').at(-1),namespace:'offline'}));
    build.onLoad({filter:/.*/,namespace:'offline'},({path})=>({loader:'jsx',resolveDir:root,contents:{
      'react-router-dom':`import React from 'react';const nav=()=>{};export const useNavigate=()=>nav;export const Link=({to,children,...p})=><a href={to} {...p}>{children}</a>;`,
      axios:`export default {get:async(...args)=>{globalThis.F_CALLS.push(args);return {data:{success:true,students:[]}}}};`,
      'react-data-table-component':`export default ()=>null;`,
      AuthContext:`export const useAuth=()=>({user:{role:'admin'},can:()=>false});`,
      LanguageContext:`import React from 'react';import {translateUiPhrase} from './src/i18n/uiPhrases.js';export const useLanguage=()=>({tr:t=>translateUiPhrase(t,globalThis.F_LANG),language:globalThis.F_LANG,direction:['ar','ur'].includes(globalThis.F_LANG)?'rtl':'ltr',fontFamily:'sans-serif'});export const AutoText=({as:C='span',text,children,variant,...p})=><C {...p}>{children??text}</C>;`,
      CommonHelper:`import React from 'react';export const getBaseUrl=async()=>'/offline/';export const handleRightClickAndFullScreen=()=>{};export const getSpinner=()=>null;export const getPrcessing=()=>null;export const checkAuth=()=>'YES';export const LinkIcon=(_to,purpose)=><button type='button' aria-label={purpose}>{purpose}</button>;export const showSwalAlert=(...args)=>globalThis.F_ALERTS.push(args);export const getFilterGif=()=>null;`,
      StudentHelper:`export const columns=[];export const conditionalRowStyles=[];export const StudentButtons=()=>null;export const StudentCard=()=>null;`,
      SchoolHelper:`export const getSchools=async()=>[];export const getSchoolsFromCache=async()=>[];`,
      CourseHelper:`export const getCoursesFromCache=async()=>globalThis.F_OPTIONS.courses;`,
      InstituteHelper:`export const getInstitutesFromCache=async()=>globalThis.F_OPTIONS.institutes;`,
      AcademicYearHelper:`export const getAcademicYearsFromCache=async()=>globalThis.F_YEAR_LOADER();`,
    }[path]}));
  }}],
});
const {StudentList,Swal}=require(join(temporary,'list.cjs'));
const allFilters={courseId:'course',year:'0',courseStatus:'Promoted',instituteId:'institute',acYear:'old-year',status:'Active',maritalStatus:'Married',hosteller:'Yes'};
const labels={courseId:'Course',year:'Year',courseStatus:'Course Status',instituteId:'Institute',acYear:'AC year',status:'Status',maritalStatus:'Marital Status',hosteller:'Hosteller'};
const display={courseId:'Selected Course',year:'0',courseStatus:'Promoted',instituteId:'Selected Institute',acYear:'2025-2026',status:'Active',maritalStatus:'Married',hosteller:'Yes'};
function setup(language='en',values=allFilters){
  localStorage.clear();sessionStorage.clear();globalThis.F_LANG=language;globalThis.F_CALLS=[];globalThis.F_ALERTS=[];
  globalThis.F_OPTIONS={courses:[{_id:'course',name:'Selected Course'},{_id:'other-course',name:'Other Course'}],institutes:[{_id:'institute',name:'Selected Institute'}],academicYears:[{_id:'current-year',acYear:'2026-2027',active:'Active'},{_id:'old-year',acYear:'2025-2026',active:'In-Active'}]};
  globalThis.F_YEAR_LOADER=()=>globalThis.F_OPTIONS.academicYears;
  localStorage.setItem('schoolId','niswan');localStorage.setItem('schoolName','N-001: Selected Niswan');
  for(const [key,value] of Object.entries(values))localStorage.setItem(key,String(value));
}
const text=(label)=>translateUiPhrase(label,globalThis.F_LANG);
const saved=()=>JSON.stringify(Object.fromEntries(Object.keys(allFilters).map(key=>[key,localStorage.getItem(key)])));
function selected(key){
  const input=document.getElementById('student-filter-'+key);assert(input,key);
  return input.closest('.mb-3').querySelector('[class*="-singleValue"]')?.textContent||'';
}
async function ready(){
  const view=render(React.createElement(StudentList));await screen.findByRole('button',{name:'Filter'});
  await waitFor(()=>assert(globalThis.F_CALLS.length>0));return view;
}
async function open(){
  fireEvent.click(screen.getByRole('button',{name:'Filter'}));await waitFor(()=>assert(document.getElementById('student-filter-courseId')));
}
async function close(action='cancel'){
  const button=action==='apply'?Swal.getConfirmButton():Swal.getCancelButton();
  await act(async()=>{fireEvent.click(button);await new Promise(resolve=>setTimeout(resolve,20));});
  await waitFor(()=>assert(document.getElementById('student-filter-courseId')===null));
}
async function resetDraft(){
  fireEvent.click(Swal.getDenyButton());await waitFor(()=>assert.equal(selected('courseId'),''));assert(Swal.getPopup()?.isConnected);
}
async function choose(key,label){
  const input=document.getElementById('student-filter-'+key);fireEvent.keyDown(input,{key:'ArrowDown',code:'ArrowDown'});
  fireEvent.click(await screen.findByRole('option',{name:label,exact:true}));
}
afterEach(async()=>{await act(async()=>{Swal.close();await new Promise(resolve=>setTimeout(resolve,20));});cleanup();await waitFor(()=>assert(document.querySelector('.swal2-container')===null));});
after(()=>dom.window.close());

test('all saved fields, including historical academic year and Year 0, are selected on reopening',async()=>{
  setup();await ready();await open();for(const key of Object.keys(allFilters))assert.equal(selected(key),display[key],key);
  await close();await open();for(const key of Object.keys(allFilters))assert.equal(selected(key),display[key],key);
});
test('Apply without editing preserves every existing filter in storage and the API path',async()=>{
  setup();await ready();const before=saved();await open();await close('apply');
  await waitFor(()=>assert.equal(globalThis.F_CALLS.length,2));assert.equal(saved(),before);
  assert.equal(globalThis.F_CALLS.at(-1)[0],'/offline/student/byFilter/niswan/course/Active/old-year/Married/Yes/0/institute/Promoted');
});
test('editing one selection preserves all untouched fields',async()=>{
  setup();await ready();await open();await choose('maritalStatus',text('Single'));await close('apply');
  await waitFor(()=>assert.equal(localStorage.getItem('maritalStatus'),'Single'));
  for(const [key,value]of Object.entries(allFilters))if(key!=='maritalStatus')assert.equal(localStorage.getItem(key),value,key);
  await open();assert.equal(selected('maritalStatus'),text('Single'));
});
test('Cancel after edits preserves both storage and the applied results',async()=>{
  setup();await ready();const before=saved(),calls=globalThis.F_CALLS.length;await open();await choose('courseId','Other Course');await close();
  assert.equal(saved(),before);assert.equal(globalThis.F_CALLS.length,calls);await open();assert.equal(selected('courseId'),'Selected Course');
});
test('popup Reset only changes draft fields and Cancel restores all previously applied filters',async()=>{
  setup();await ready();const before=saved(),calls=globalThis.F_CALLS.length;await open();await resetDraft();
  assert.equal(selected('acYear'),'2025-2026');for(const key of Object.keys(allFilters))if(key!=='acYear')assert.equal(selected(key),'',key);
  assert.equal(saved(),before);assert.equal(globalThis.F_CALLS.length,calls);await close();assert.equal(saved(),before);
  await open();assert.equal(selected('year'),'0');assert.equal(selected('acYear'),'2025-2026');
});
test('popup Reset reads the saved year rather than the draft year and Apply uses that year',async()=>{
  setup();await ready();await open();await choose('acYear','2026-2027');assert.equal(selected('acYear'),'2026-2027');
  await resetDraft();assert.equal(selected('acYear'),'2025-2026');await close('apply');
  await waitFor(()=>assert.equal(globalThis.F_CALLS.length,2));assert.equal(localStorage.getItem('acYear'),'old-year');
  for(const key of Object.keys(allFilters))if(key!=='acYear')assert.equal(localStorage.getItem(key),null,key);
  assert.equal(localStorage.getItem('schoolId'),'niswan');assert.equal(localStorage.getItem('schoolName'),'N-001: Selected Niswan');
  assert.equal(globalThis.F_CALLS.at(-1)[0],'/offline/student/byFilter/niswan/null/null/old-year/null/null/null/null/null');
});
test('list Reset immediately clears other filters, keeps Niswan and reloads saved academic year',async()=>{
  setup();await ready();fireEvent.click(screen.getByRole('button',{name:text('Reset'),exact:true}));
  await waitFor(()=>assert.equal(globalThis.F_CALLS.length,2));assert.equal(localStorage.getItem('acYear'),'old-year');
  for(const key of Object.keys(allFilters))if(key!=='acYear')assert.equal(localStorage.getItem(key),null,key);
  assert.equal(localStorage.getItem('schoolId'),'niswan');assert.equal(localStorage.getItem('schoolName'),'N-001: Selected Niswan');
  assert.equal(globalThis.F_CALLS.at(-1)[0],'/offline/student/byFilter/niswan/null/null/old-year/null/null/null/null/null');
  await open();assert.equal(selected('acYear'),'2025-2026');assert.equal(selected('status'),'');
});
for(const value of [undefined,'','null','undefined','deleted-year'])test(`missing/invalid stored academic year (${String(value)}) falls back to the configured Active year`,async()=>{
  setup();if(value===undefined)localStorage.removeItem('acYear');else localStorage.setItem('acYear',value);
  await ready();await open();assert.equal(selected('acYear'),'2026-2027');await resetDraft();assert.equal(selected('acYear'),'2026-2027');
  await close('apply');await waitFor(()=>assert.equal(localStorage.getItem('acYear'),'current-year'));
});
test('remounting the list preserves saved selections and selected Niswan',async()=>{
  setup();const view=await ready();await open();await choose('maritalStatus',text('Single'));await close('apply');view.unmount();
  await ready();await open();assert.equal(selected('maritalStatus'),text('Single'));assert.equal(selected('acYear'),'2025-2026');assert.equal(selected('year'),'0');assert.equal(localStorage.getItem('schoolId'),'niswan');
});
test('filter waits for academic-year options before validating the saved year',async()=>{
  setup();let finish;globalThis.F_YEAR_LOADER=()=>new Promise(resolve=>{finish=resolve;});await ready();
  fireEvent.click(screen.getByRole('button',{name:'Filter'}));assert(document.getElementById('student-filter-courseId')===null);
  await act(async()=>{finish(globalThis.F_OPTIONS.academicYears);});
  await waitFor(()=>assert(document.getElementById('student-filter-courseId')));assert.equal(selected('acYear'),'2025-2026');assert.equal(localStorage.getItem('acYear'),'old-year');
});
test('failed option loading cannot erase applied filters and the next attempt can retry',async()=>{
  setup();globalThis.F_YEAR_LOADER=()=>undefined;await ready();const before=saved();
  fireEvent.click(screen.getByRole('button',{name:text('Reset'),exact:true}));await waitFor(()=>assert.equal(globalThis.F_ALERTS.length,1));
  assert.equal(saved(),before);globalThis.F_YEAR_LOADER=()=>globalThis.F_OPTIONS.academicYears;await open();assert.equal(selected('acYear'),'2025-2026');
});
test('storage helpers preserve numeric zero, remove empty keys and invalidate cached student rows',()=>{
  setup();localStorage.setItem('students','stale');saveStudentFilters({...allFilters,year:0,status:''},localStorage);
  assert.equal(localStorage.getItem('year'),'0');assert.equal(localStorage.getItem('status'),null);assert.equal(localStorage.getItem('students'),null);
  assert.equal(readStudentFilters(localStorage).year,'0');assert.equal(getStudentResetFilters(globalThis.F_OPTIONS.academicYears,localStorage).acYear,'old-year');
});
for(const language of ['en','ta','ur','ar','ml','kn','te'])test(`real popup retains translated fields/buttons and direction in ${language}`,async()=>{
  setup(language);await ready();await open();assert.equal(document.getElementById('student-filter-courseId').closest('[dir]').dir,['ar','ur'].includes(language)?'rtl':'ltr');
  assert.equal(Swal.getConfirmButton().textContent,text('Apply'));assert.equal(Swal.getCancelButton().textContent,text('Cancel'));assert(Swal.getDenyButton().textContent.includes(text('Reset')));
  assert.equal(selected('status'),text('Active'));assert.equal(selected('acYear'),'2025-2026');assert.equal(selected('year'),'0');
  assert(!Swal.getHtmlContainer().textContent.includes('\ufffd'));await resetDraft();assert.equal(selected('acYear'),'2025-2026');
});
