import test, { afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { translateUiPhrase } from '../src/i18n/uiPhrases.js';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom'), esbuild = require('esbuild');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://local.test' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement, Element: dom.window.Element, Node: dom.window.Node,
  MutationObserver: dom.window.MutationObserver, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.scrollTo = () => {};
const React = require('react');
const { render, screen, fireEvent, waitFor, cleanup } = require('@testing-library/react');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(join(tmpdir(), 'unis-student-adjustments-'));
await esbuild.build({
  stdin: { contents: `export {StudentButtons} from './src/utils/StudentHelper.jsx'; export {default as StudentEdit} from './src/components/student/Edit.jsx'; export {default as CourseChange} from './src/components/student/CourseChange.jsx';`, resolveDir: root, loader: 'jsx' },
  outfile: join(temporary, 'pages.cjs'), bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', loader: { '.css': 'empty' },
  define: { 'import.meta.env': JSON.stringify({ VITE_UNIS_TIMEZONE: 'Asia/Kolkata' }) }, logLevel: 'silent',
  plugins: [{ name: 'offline-adapters', setup(build) {
    build.onResolve({ filter: /^react(?:-dom)?(?:\/.*)?$/ }, args => ({ path: require.resolve(args.path), external: true }));
    build.onResolve({ filter: /^react-router-dom$|^axios$|^sweetalert2$|(?:context\/AuthContext|i18n\/LanguageContext|api\/studentCourseChangeApi|utils\/(?:CommonHelper|SchoolHelper|AcademicYearHelper|InstituteHelper|CourseHelper|DistrictStateHelper))$/ }, args => ({ path: args.path.split('/').at(-1), namespace: 'offline' }));
    build.onLoad({ filter: /.*/, namespace: 'offline' }, ({ path }) => ({ loader: 'jsx', resolveDir: root, contents: {
      'react-router-dom': `import React from 'react'; export const useParams=()=>({id:'student-test'}); const navigate=(path)=>globalThis.A_NAV.push(path); export const useNavigate=()=>navigate; export const Link=({to,children,...p})=><a href={to} {...p}>{children}</a>;`,
      axios: `export default {get:async()=>({data:{success:true,student:globalThis.A_STUDENT}}),put:async(...args)=>{globalThis.A_SAVES.push(args);return {data:{success:true}}},delete:async()=>{throw Error('Unexpected delete')}};`,
      sweetalert2: `export default {fire:async()=>({isConfirmed:false})};`,
      AuthContext: `export const useAuth=()=>({user:{role:globalThis.A_ROLE},can:(key)=>globalThis.A_PERMISSIONS.has(key)});`,
      LanguageContext: `import React from 'react';import {translateUiPhrase} from './src/i18n/uiPhrases.js';export const useLanguage=()=>({language:globalThis.A_LANG,direction:['ar','ur'].includes(globalThis.A_LANG)?'rtl':'ltr',fontFamily:'sans-serif',tr:t=>translateUiPhrase(t,globalThis.A_LANG)});export const UiText=({text})=><span>{translateUiPhrase(text,globalThis.A_LANG)}</span>;export const AutoText=({as:C='span',text,children,variant,...p})=><C {...p}>{children??text}</C>;`,
      CommonHelper: `export const getBaseUrl=async()=>'/offline/';export const getButtonStyle=t=>t;export const getButtonTooltip=t=>t;export const showSwalAlert=(...args)=>globalThis.A_ALERTS.push(args);export const showConfirmationSwalAlert=async()=>({isConfirmed:false});export const checkAuth=()=>'YES';export const getSpinner=()=>null;export const getPrcessing=()=>null;export const handleRightClickAndFullScreen=()=>{};`,
      SchoolHelper: `export const getSchoolsFromCache=async()=>globalThis.A_SCHOOLS;`,
      AcademicYearHelper: `export const getAcademicYearsFromCache=async()=>globalThis.A_YEARS;`,
      InstituteHelper: `export const getInstitutesFromCache=async()=>globalThis.A_INSTITUTES;`,
      CourseHelper: `export const getCoursesFromCache=async()=>globalThis.A_COURSES;`,
      DistrictStateHelper: `export const getDistrictStatesFromCache=async()=>[];`,
      studentCourseChangeApi: `export const studentCourseRequest=(...args)=>globalThis.A_REQUEST(...args);`,
    }[path] }));
  } }],
});
const { StudentButtons, StudentEdit, CourseChange } = require(join(temporary, 'pages.cjs'));
afterEach(cleanup); after(() => dom.window.close());
const SCHOOL='507f1f77bcf86cd799439011', YEAR='507f1f77bcf86cd799439012', C1='507f1f77bcf86cd799439013', C3='507f1f77bcf86cd799439014', I1='507f1f77bcf86cd799439015', I3='507f1f77bcf86cd799439016';
function setup(role='superadmin', language='en') {
  globalThis.A_ROLE=role;globalThis.A_LANG=language;globalThis.A_NAV=[];globalThis.A_SAVES=[];globalThis.A_ALERTS=[];globalThis.A_CALLS=[];
  globalThis.A_PERMISSIONS=new Set(['student.view','student.edit','student.delete',...(['superadmin','hquser'].includes(role)?['student.course.change']:[])]);
  localStorage.clear();sessionStorage.clear();localStorage.setItem('preferredLanguage',language);
  globalThis.A_SCHOOLS=[{_id:SCHOOL,code:'N-1',nameEnglish:'Niswan',active:'Active'}];
  globalThis.A_YEARS=[{_id:YEAR,acYear:'2026-2027',active:'Active'}];
  globalThis.A_COURSES=[{_id:C1,code:'D-1',name:'Deeniyath',type:'Deeniyath Education',years:3,fees:1000}, {_id:C3,code:'C-1',name:'College',type:'College Education',years:3,fees:1200}];
  globalThis.A_INSTITUTES=[{_id:I1,iCode:'I-1',name:'Institute',type:'Deeniyath Education'},{_id:I3,iCode:'I-3',name:'College Institute',type:'College Education'}];
  globalThis.A_STUDENT={userId:{name:'தமிழ் العربية اردو'},schoolId:{_id:SCHOOL},rollNumber:'N-001',active:'Active',dob:'2005-01-01T00:00:00.000Z',doa:'2026-06-01T00:00:00.000Z',
    _academics:[{acYear:{_id:YEAR},instituteId1:{_id:I1},courseId1:{_id:C1},year1:2,fees1:1000,discount1:100,instituteId3:{_id:I3},courseId3:{_id:C3},year3:1,fees3:1200}]};
  globalThis.A_OPTIONS={student:{name:'தமிழ் العربية اردو',rollNumber:'N-001',active:'Active',school:{code:'N-1',nameEnglish:'Niswan'}},
    academics:[{_id:'academic',acYear:{acYear:'2026-2027'},courseId1:'old',instituteId1:'institute',year1:1,discount1:100,status1:'Studying'}],
    courses:[{_id:'old',code:'OLD',name:'Old Course',type:'Deeniyath Education',fees:1000,allowedYears:[1,2]},{_id:'new',code:'NEW',name:'New Course',type:'Deeniyath Education',fees:1500,allowedYears:[1,2]}],
    institutes:[{_id:'institute',iCode:'I-1',name:'Institute',type:'Deeniyath Education'}],history:[]};
  globalThis.A_REQUEST=async(...args)=>{
    globalThis.A_CALLS.push(args);
    if(args[0]==='GET')return {data:globalThis.A_OPTIONS};
    if(args[2]==='/preview')return {data:{confirmationToken:'server-confirmation',quote:{oldSlot:{courseCode:'OLD',courseName:'Old Course',netPaise:90000},newSlot:{courseCode:'NEW',courseName:'New Course',netPaise:150000},differencePaise:60000}}};
    return {data:{noInvoiceCreated:true}};
  };
}
async function editReady() {
  const view=render(React.createElement(StudentEdit));
  await waitFor(()=>assert.equal(view.container.querySelector('[name="name"]').value,'தமிழ் العربية اردو'));
  return view;
}
async function courseReady() {
  const view=render(React.createElement(CourseChange));await screen.findByText('தமிழ் العربية اردو');return view;
}
test('list removes Course action and shows an icon-only unlinked Transfer control',()=>{
  setup();render(React.createElement(StudentButtons,{Id:'student-test',student:{active:'Active'}}));
  assert.equal(screen.queryByRole('button',{name:'Change Student Course'}),null);
  assert.equal(screen.queryByRole('button',{name:'Course'}),null);
  const transfer=screen.getByRole('button',{name:'Transfer Student'});
  assert(transfer.disabled);assert(transfer.querySelector('svg'));assert.equal(transfer.textContent,'');
  fireEvent.click(transfer);assert.deepEqual(globalThis.A_NAV,[]);assert.equal(globalThis.A_CALLS.length,0);
  fireEvent.click(screen.getByRole('button',{name:'View'}));assert.deepEqual(globalThis.A_NAV,['/dashboard/students/student-test']);
});
test('Transfer respects existing edit permission',()=>{
  setup();globalThis.A_PERMISSIONS.delete('student.edit');render(React.createElement(StudentButtons,{Id:'student-test'}));
  assert.equal(screen.queryByRole('button',{name:'Transfer Student'}),null);assert(screen.getByRole('button',{name:'View'}));
});
test('completed student keeps disabled edit and Transfer actions',()=>{
  setup();render(React.createElement(StudentButtons,{Id:'student-test',student:{active:'Graduated'}}));
  assert(screen.getByRole('button',{name:'Completed student cannot be edited'}).disabled);
  assert(screen.getByRole('button',{name:'Transfer Student'}).disabled);
});
for(const role of ['superadmin','hquser','hqadmin','admin','staff','teacher','supervisor'])test(`Student Edit locks both year fields for ${role}`,async()=>{
  setup(role);const view=await editReady();
  for(const name of ['year1','year3','acYear'])assert(view.container.querySelector(`[name="${name}"]`).disabled,name);
  assert.equal(view.container.querySelector('[name="year1"]').value,'2');assert.equal(view.container.querySelector('[name="year3"]').value,'1');
  assert(!view.container.querySelector('[name="name"]').disabled);
});
for(const value of [0,1,3])test(`readonly Makthab grade ${value} remains intact`,async()=>{
  setup();globalThis.A_COURSES[0].name='Makthab_Level1';globalThis.A_STUDENT._academics[0].year1=value;
  const view=await editReady();const field=view.container.querySelector('[name="year1"]');assert.equal(field.tagName,'SELECT');assert(field.disabled);
  assert.equal(field.value,String(value));fireEvent.submit(view.container.querySelector('form'));
  await waitFor(()=>assert.equal(globalThis.A_SAVES.length,1));assert.equal(globalThis.A_SAVES[0][1].year1,String(value));
});
test('empty Makthab year remains empty rather than being silently auto-filled',async()=>{
  setup();globalThis.A_COURSES[0].name='Makthab_Level2';globalThis.A_STUDENT._academics[0].year1=null;
  const view=await editReady();assert.equal(view.container.querySelector('[name="year1"]').value,'');assert(view.container.querySelector('[name="year1"]').disabled);
});
test('programmatic changes to disabled years are ignored and save preserves stored years',async()=>{
  setup();const view=await editReady();for(const name of ['year1','year3'])fireEvent.change(view.container.querySelector(`[name="${name}"]`),{target:{value:'3'}});
  fireEvent.change(view.container.querySelector('[name="name"]'),{target:{value:'தமிழ் العربية اردو updated'}});
  fireEvent.submit(view.container.querySelector('form'));
  await waitFor(()=>assert.equal(globalThis.A_SAVES.length,1));const payload=globalThis.A_SAVES[0][1];
  assert.equal(payload.year1,'2');assert.equal(payload.year3,1);assert.equal(payload.name,'தமிழ் العربية اردو updated');
});
for(const role of ['superadmin','hquser'])test(`Course Change remains accessible from Student Edit for ${role}`,async()=>{
  setup(role);await editReady();assert.equal(screen.getByRole('link',{name:'Change Student Course'}).getAttribute('href'),'/dashboard/students/course-change/student-test');
});
test('Course Change back icon targets Students List',async()=>{
  setup();await courseReady();const back=screen.getByRole('link',{name:'Back: Students'});assert.equal(back.getAttribute('href'),'/dashboard/students');assert(back.querySelector('svg'));
  assert.equal(screen.queryByRole('link',{name:'Back to Student'}),null);
});
test('Course Change places two selectors in row one and three in row two with no Discount input',async()=>{
  setup();const view=await courseReady();const form=view.container.querySelector('form'),rows=form.querySelectorAll(':scope > div.grid');
  assert.equal(rows.length,2);assert(rows[0].classList.contains('md:grid-cols-2'));assert(rows[1].classList.contains('md:grid-cols-3'));
  assert.deepEqual([...rows[0].querySelectorAll('select')].map(el=>el.getAttribute('aria-label')),['Academic Year','Course Slot']);
  assert.deepEqual([...rows[1].querySelectorAll('select')].map(el=>el.getAttribute('aria-label')),['Course','Institute','Year of Study']);
  assert.equal(screen.queryByLabelText('Discount'),null);assert(screen.getByLabelText('Reason (Optional)'));
});
test('hiding Discount retains the stored discount when only year changes',async()=>{
  setup();await courseReady();fireEvent.change(screen.getByLabelText('Year of Study'),{target:{value:'2'}});fireEvent.submit(document.querySelector('form'));
  await waitFor(()=>assert(globalThis.A_CALLS.some(args=>args[2]==='/preview')));
  const request=globalThis.A_CALLS.find(args=>args[2]==='/preview')[3];assert.equal(request.discount,'100');assert.equal(request.year,'2');assert.equal(request.courseId,'old');
});
test('new-course discount behavior remains compatible with existing fee preview',async()=>{
  setup();await courseReady();fireEvent.change(screen.getByLabelText('Course'),{target:{value:'new'}});fireEvent.submit(document.querySelector('form'));
  await waitFor(()=>assert(globalThis.A_CALLS.some(args=>args[2]==='/preview')));
  const request=globalThis.A_CALLS.find(args=>args[2]==='/preview')[3];assert.equal(request.discount,'0');assert.equal(request.courseId,'new');assert(request.requestKey);
});
for(const language of ['en','ta','ur','ar','ml','kn','te'])test(`Transfer and Course Change controls preserve ${language} language support`,async()=>{
  setup('superadmin',language);const list=render(React.createElement(StudentButtons,{Id:'student-test'}));
  assert(screen.getByRole('button',{name:translateUiPhrase('Transfer Student',language)}));list.unmount();
  const view=await courseReady();assert.equal(view.container.firstElementChild.dir,['ur','ar'].includes(language)?'rtl':'ltr');
  const back=screen.getByRole('link',{name:`${translateUiPhrase('Back',language)}: ${translateUiPhrase('Students',language)}`});assert.equal(back.getAttribute('href'),'/dashboard/students');
  assert.equal(screen.queryByLabelText(translateUiPhrase('Discount',language)),null);assert(!view.container.textContent.includes('\ufffd'));
});
