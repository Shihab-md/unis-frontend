
import { Link } from 'react-router-dom';
import {
  FaPlusSquare, FaArrowAltCircleLeft, FaRegCaretSquareDown, FaFilter, FaSearch
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

};

export function handleRightClickAndFullScreen() {

  const isDisableRightClick = true;
  const isOpenFullScreen = false;

  if (isDisableRightClick) {
    document.addEventListener('contextmenu', handleRightClick);
  }
  if (isOpenFullScreen) {
    document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });
  }
}

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
      <FaFilter className="text-3xl lg:text-4xl text-fuchsia-500 bg-white rounded shadow-lg border-2 border-fuchsia-700 p-1 lg:p-2" /> </Link>

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
    timer: 1600,
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