
import { Link } from 'react-router-dom';
import {
  FaPlusSquare, FaArrowAltCircleLeft, FaRegCaretSquareDown, FaFilter, FaSearch, FaTasks, FaCheck
} from "react-icons/fa";
import Swal from 'sweetalert2';

const authorizedScreensFor_SA_HQ_Roles = [
  "supervisorsList", "supervisorAdd", "supervisorEdit", "supervisorView",
  "schoolsList", "schoolAdd", "schoolEdit", "schoolView",
  "employeesList", "employeeAdd", "employeeEdit", "employeeView",
  "studentsList", "studentAdd", "studentEdit", "studentPromote", "studentView",
  "institutesList", "instituteAdd", "instituteEdit", "instituteView",
  "coursesList", "courseAdd", "courseEdit", "courseView",
  "acYearsList", "acYearAdd", "acYearEdit", "acYearView",
  "certificatesList", "certificateAdd", "certificateEdit", "certificateView",
  "templatesList", "templateAdd", "templateEdit", "templateView",
  "settings",
  "districtStateAdd", "districtStateEdit", "districtStateView", "districtStateList"
];

const authorizedScreensFor_SUP_Role = [
  "supervisorsList",
  "schoolsList", "schoolView",
  "employeesList", "employeeView",
  "settings"
];

const authorizedScreensFor_ADMIN_Role = [
  "schoolsList", "schoolEdit", "schoolView",
  "employeesList", "employeeAdd", "employeeEdit", "employeeView",
  "studentsList", "studentAdd", "studentEdit", "studentPromote", "studentView",
  "settings"
];

export function checkAuth(screenName) {

  const role = localStorage.getItem("role")

  if (role === "superadmin" || role === "hquser") {
    return "OK";

  } else if (role === "supervisor" && authorizedScreensFor_SUP_Role.includes(screenName)) {
    return "OK";

  } else if (role === "admin" && authorizedScreensFor_ADMIN_Role.includes(screenName)) {
    return "OK";

  } else if (role === "employee") {

  } else if (role === "teacher") {

  } else if (role === "student") {

  } else if (role === "parent") {

  }

  return "NO";

  // Supervisors
  //if (authorizedScreensFor_SA_HQ_Roles.includes(screenName)) {
  //  return ['superadmin', 'hquser'];
  //}
};

export const getBaseUrl = async () => {
  return "https://unis-server.vercel.app/api/";
  //return "http://localhost:5000/api/";
};

export function toCamelCase(inputString) {
  return inputString ? inputString.toLowerCase().replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase()) : null;
}

export function handleRightClickAndFullScreen() {
  const isDisableRightClick = true;
  const isOpenFullScreen = true;

  // ✅ Detect mobile only (Android/iOS + small screens)
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "") ||
    window.matchMedia?.("(max-width: 768px)")?.matches;

  if (!isMobile) return; // ✅ Do nothing for web/desktop

  // -------- Right click disable (mostly desktop feature; keep only if you want) --------
  const handleRightClick = (e) => e.preventDefault();

  if (isDisableRightClick) {
    document.removeEventListener("contextmenu", handleRightClick); // prevent duplicates
    document.addEventListener("contextmenu", handleRightClick);
  }

  // -------- Fullscreen (must be triggered by user gesture) --------
  if (isOpenFullScreen) {
    const enterFs = async () => {
      try {
        // Already fullscreen? no-op
        if (document.fullscreenElement) return;

        // Fullscreen API supported?
        const el = document.documentElement;
        if (el?.requestFullscreen) {
          await el.requestFullscreen();
        }
      } catch {
        // iOS Safari will usually fail; ignore silently
      }
    };

    // ✅ IMPORTANT: do NOT force fullscreen on ANY click.
    // Instead use a "one-time tap anywhere" on mobile only.
    document.body.removeEventListener("click", enterFs);
    document.body.addEventListener("click", enterFs, { once: true });
  }
}

{/*
export function handleRightClickAndFullScreen() {

  const isDisableRightClick = true;
  const isOpenFullScreen = true;

  if (isDisableRightClick) {
    document.addEventListener('contextmenu', handleRightClick);
  }
  if (isOpenFullScreen) {
    document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });
  }
} */}

export function handleRightClick(event) {
  event.preventDefault();
}

export function getSpinner() {
  return <div className='flex p-16 items-center justify-center rounded-lg h-screen content-center'>
    <img width={340} className='flex items-center justify-center rounded-full shadow-xl border' src="/spinner.gif" />
  </div>
}

export function getPrcessing() {
  return <div className='flex p-16 items-center justify-center rounded-lg h-screen content-center'><dialog
    className="dialog rounded-lg"
    style={{ position: 'absolute' }}
    open
  >
    <img width={320} className='flex items-center justify-center rounded-lg shadow-xl border' src="/spinner1.gif" />
  </dialog></div>
}

// Strong password: 8–64 chars, 1 upper, 1 lower, 1 number, 1 special, no spaces
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,64}$/;

export const validatePassword = (pw) => {
  if (!pw) return "Password is required";
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (pw.length > 64) return "Password must be at most 64 characters";
  if (/\s/.test(pw)) return "Password must not contain spaces";
  if (!/[a-z]/.test(pw)) return "Password must include a lowercase letter";
  if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter";
  if (!/\d/.test(pw)) return "Password must include a number";
  if (!/[^\w\s]/.test(pw)) return "Password must include a special character";
  return "";
};

export const isPasswordStrong = (pw) => PASSWORD_REGEX.test(pw || "");

export function getFilterGif() {
  return <div className="p-5 mt-7 rounded-lg">
    <dialog
      className="bg-[url(/bg-img.jpg)] dialog rounded-3xl"
      style={{ position: 'absolute' }}
      open
    >
      <img width={160} className='flex items-center justify-center rounded-3xl shadow-2xl border' src="/filter.gif" />
    </dialog>
  </div>
}

export function LinkIcon(toPage, purpose) {
  if (purpose === "Add") {
    return <Link to={toPage} >
      <FaPlusSquare className="text-3xl lg:text-4xl bg-teal-700 text-white rounded shadow-lg" /></Link>

  } else if (purpose === "Back") {
    return <Link to={toPage} >
      <FaArrowAltCircleLeft className="text-3xl lg:text-4xl bg-blue-700 text-white rounded shadow-lg" /> </Link>

  } else if (purpose === "Import") {
    return <Link to={toPage} >
      <FaRegCaretSquareDown className="text-3xl lg:text-4xl bg-indigo-700 text-white rounded shadow-lg" /> </Link>

  } else if (purpose === "Filter") {
    return <Link to={toPage} >
      <FaTasks className="text-3xl lg:text-4xl text-fuchsia-500 bg-white rounded shadow-lg border-2 border-fuchsia-700 p-1 lg:p-1.5" /> </Link>

  } else if (purpose === "FeesPaid") {
    return <Link to={toPage} >
      <FaCheck className="text-3xl lg:text-4xl bg-white text-yellow-700 border-2 border-yellow-700 rounded shadow-lg p-1 lg:p-1.5" /> </Link>

  } else if (purpose === "Search") {
    return <Link to={toPage} >
      <FaSearch className="text-3xl text-cyan-700 rounded p-1" /> </Link>
  }
}

export function getFormattedDate(dateString) {
  if (dateString) {
    let date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } else {
    return "";
  }
}

export function showSwalAlert(title, message, icon) {
  return Swal.fire({
    title: title,
    html: "<b>" + message + "</b>",
    icon: icon,
    timer: 5700,
    timerProgressBar: true,
    showConfirmButton: false,
    background: "url(/bg_card.png)",
  });
}

export function showConfirmationSwalAlert(title, message, icon) {
  return Swal.fire({
    title: title,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    background: "url(/bg_card.png)",
  });
}

export function getButtonStyle(buttonType) {

  if (buttonType === 'View') {
    return "px-1.5 py-1 m-1 bg-teal-600 text-base text-teal-100 rounded-md shadow-md shadow-teal-200";

  } else if (buttonType === 'Edit') {
    return "px-1.5 py-1 m-1 bg-blue-600 text-base text-blue-100 rounded-md shadow-md shadow-blue-200";

  } else if (buttonType === 'Delete') {
    return "px-1.5 py-1 m-1 bg-red-600 text-base text-red-100 rounded-md shadow-md shadow-red-200";

  } else if (buttonType === 'Promote') {
    return "px-1.5 py-1 m-1 bg-purple-500 text-base text-purple-100 rounded-md shadow-md shadow-purple-200";

  } else if (buttonType === 'Transfer') {
    return "px-1.5 py-1 m-1 bg-yellow-700 text-base text-yellow-100 rounded-md shadow-md shadow-yellow-200";

  }
}

export function removeLocalStorage() {

  localStorage.removeItem("schoolId");
  localStorage.removeItem("schoolName");

  // Supervisor Filter
  localStorage.removeItem('supSchoolId');
  localStorage.removeItem('supStatus');
  localStorage.removeItem('supType');

  // Student Filter
  localStorage.removeItem("students");
  localStorage.removeItem('courseId');
  localStorage.removeItem('status');
  localStorage.removeItem("acYear");
  localStorage.removeItem('maritalStatus');
  localStorage.removeItem('hosteller');
  localStorage.removeItem('year');
  localStorage.removeItem('instituteId');
  localStorage.removeItem('courseStatus');

  // School Filter
  localStorage.removeItem('supervisors');
  localStorage.removeItem('supervisorId');
  localStorage.removeItem('districtStateId');
  localStorage.removeItem('schStatus');

  // Employee Filter
  localStorage.removeItem('employees');
  localStorage.removeItem('empSchoolId');
  localStorage.removeItem('empRole');
  localStorage.removeItem('empStatus');

  // Certificate Filter
  localStorage.removeItem('certificates');
  localStorage.removeItem('certSchoolId');
  localStorage.removeItem('certCourseId');
  localStorage.removeItem('certACYearId');
}