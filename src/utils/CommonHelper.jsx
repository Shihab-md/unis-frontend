
import { Link } from 'react-router-dom';
import { FaPlusSquare, FaArrowAltCircleLeft } from "react-icons/fa";

const authorizedScreensFor_SA_HQ_Roles = [
  "supervisorsList", "supervisorAdd", "supervisorEdit", "supervisorView",
  "schoolsList", "schoolAdd", "schoolEdit", "schoolView",
  "employeesList", "employeeAdd", "employeeEdit", "employeeView",
  "studentsList", "studentAdd", "studentEdit", "studentView",
  "institutesList", "instituteAdd", "instituteEdit", "instituteView",
  "coursesList", "courseAdd", "courseEdit", "courseView",
  "acYearsList", "acYearAdd", "acYearEdit", "acYearView",
  "certificatesList", "certificateAdd", "certificateEdit", "certificateView",
  "templatesList", "templateAdd", "templateEdit", "templateView",
  "settings"
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
  "studentsList", "studentAdd", "studentEdit", "studentView",
  "settings"
];

export const getBaseUrl = async () => {
  return "https://unis-server.vercel.app/api/";

};

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

export function handleRightClick(event) {
  event.preventDefault();
}

export function getSpinner() {
  return <div className='flex p-16 items-center justify-center rounded-lg h-screen content-center'>
    <img width={340} className='flex items-center justify-center rounded-full shadow-xl border' src="/spinner.gif" />
  </div>
}

export function getBackIcon(toPage) {
  return <Link to={toPage} > <FaArrowAltCircleLeft className="text-3xl bg-blue-700 text-white rounded shadow-lg" /> </Link>
}

export function getAddIcon(toPage) {
  return <Link to={toPage} > <FaPlusSquare className="text-3xl bg-teal-700 text-white rounded shadow-lg" /></Link>
}

