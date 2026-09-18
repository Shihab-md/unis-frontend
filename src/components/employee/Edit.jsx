import React, { useEffect, useState } from "react";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext'
import {
  getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth,
  getPrcessing, showSwalAlert
} from '../../utils/CommonHelper';
import {
  FaRegTimesCircle
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getBusinessTodayDate } from "../../utils/dateRules";
import { AutoText, useLanguage } from "../../i18n/LanguageContext";
import { formatAge, formatWorkingExperience } from "../../utils/employeeProfileUtils";

const SHOW_EXTENDED_EMPLOYEE_FIELDS = false;

const Edit = () => {
  const { tr, t, direction, fontFamily } = useLanguage();

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const [processing, setProcessing] = useState(null)
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOJDate, setSelectedDOJDate] = useState(null);

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    role: "",
    contactNumber: "",
    address: "",
    routeName: "",
    qualification: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    doj: "",
    designation: "",
    fatherGuardianName: "",
    salary: "",
    travellingAllowance: "",
    otherDesignation: "",
    activitiesCarriedOut: "",
    bankAccountDetails: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const [schools, setSchools] = useState([]);

  const { user } = useAuth();

  const roleOptions = [
    { value: "superadmin", label: t("roles.superadmin", "SuperAdmin") },
    { value: "hquser", label: t("roles.hquser", "HQUser") },
    { value: "admin", label: t("roles.admin", "Admin") },
    { value: "teacher", label: t("roles.teacher", "Teacher") },
    { value: "usthadh", label: t("roles.usthadh", "Usthadh") },
    { value: "warden", label: t("roles.warden", "Warden") }
  ];

  const getAllowedRoleValues = (loginRole) => {
    const r = String(loginRole || "").toLowerCase();

    if (r === "superadmin") {
      return roleOptions.map((o) => o.value); // all
    }

    if (r === "hquser") {
      return roleOptions
        .filter((o) => o.value !== "superadmin") // all except superadmin
        .map((o) => o.value);
    }

    if (r === "supervisor") {
      return ["admin"];
    }

    if (r === "admin") {
      return ["usthadh", "warden", "staff"];
    }

    return []; // safe default
  };

  const allowed = new Set(getAllowedRoleValues(user?.role));

  const sortedRoleOptions = roleOptions
    .filter((o) => allowed.has(o.value))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("employeeEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const employee = responnse.data.employee;

          setSelectedDOBDate(employee.dob);
          setSelectedDOJDate(employee.doj);

          setEmployee((prev) => ({
            ...prev,
            name: employee.userId.name,
            email: employee.userId.email,
            role: employee.userId.role,
            schoolId: employee.schoolId._id,
            employeeId: employee.employeeId,
            contactNumber: employee.contactNumber,
            address: employee.address,
            designation: employee.designation,
            qualification: employee.qualification,
            fatherGuardianName: employee.fatherGuardianName || "",
            gender: employee.gender,
            maritalStatus: employee.maritalStatus,
            salary: employee.salary,
            travellingAllowance: employee.travellingAllowance ?? 0,
            otherDesignation: employee.otherDesignation || "",
            activitiesCarriedOut: employee.activitiesCarriedOut || "",
            bankAccountDetails: employee.bankAccountDetails || "",
            active: employee.active
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/employees");
        }
      }
    };

    fetchEmployee();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      const file = files?.[0];

      if (!file) {
        setEmployee((prevData) => ({ ...prevData, file: null }));
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2 MB

      if (file.size > maxSize) {
        showSwalAlert("Error!", "Image size must be less than 2 MB.", "error");
        e.target.value = "";
        return;
      }
      setEmployee((prevData) => ({ ...prevData, [name]: file }));
    } else {
      setEmployee((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (selectedDOBDate) {
        employee.dob = selectedDOBDate;
      } else {
        employee.dob = "";
      }
      if (selectedDOJDate) {
        employee.doj = selectedDOJDate;
      } else {
        employee.doj = "";
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }
      const response = await axios.put(
        (await getBaseUrl()).toString() + `employee/${id}`,
        employee,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
        navigate("/dashboard/employees");
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <>
      {employee ? (
        <div dir={direction} style={{ fontFamily }} className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <AutoText as="h2" text={tr("Update Employee Details") } variant="button" className="font-semibold items-center justify-center" />
            <Link to="/dashboard/employees" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-5 mb-3">

                {/* School */}
                <div className='md:col-span-2'>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Select Niswan")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="schoolId"
                    value={employee.schoolId}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    disabled={true}
                  >
                    <option value=""></option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.code + " : " + school.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Name")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={employee.name}
                    onChange={handleChange}
                    //      placeholder={tr("Name")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Email")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={employee.email}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder={tr("Email")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 mt-7">
                {/* Employee ID */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Employee ID")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={employee.employeeId}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder={tr("Employee ID")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Role")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="role"
                    value={employee.role || ""}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    disabled={user.role !== "superadmin"}
                  >
                    <option value=""></option>

                    {sortedRoleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active */}
                <div>
                  <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Status")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="active"
                    value={employee.active}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    <option value="Active">{tr("Active")}</option>
                    <option value="In-Active">{tr("In-Active")}</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Contact Number")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={employee.contactNumber}
                    onChange={handleChange}
                    min="0"
                    //     placeholder={tr("Contact Number")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-7">
                {/* Address */}
                <div className='md:col-span-2'>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Address")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={employee.address}
                    onChange={handleChange}
                    //    placeholder={tr("Address")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Qualification")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={employee.qualification}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Father / Guardian Name */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Father / Guardian Name")}
                  </label>
                  <input
                    type="text"
                    name="fatherGuardianName"
                    value={employee.fatherGuardianName || ""}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">

                {/* Date of Birth 
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Date of Birth")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={moment(new Date(employee.dob)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //    placeholder={tr("Date of Birth")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>*/}

                {/* Date of Birth */}
                <div className="grid grid-cols-1">
                  <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Date of Birth")} <span className="text-red-700">*</span>
                  </label>
                  <DatePicker
                    name="dob"
                    maxDate={getBusinessTodayDate()}
                    selected={selectedDOBDate}
                    onChange={(date) => setSelectedDOBDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    isClearable
                  //showIcon
                  //toggleCalendarOnIconClick
                  />
                  <div className="mt-1 h-4 text-[10px] font-normal text-slate-500 leading-4">
                    {selectedDOBDate ? (
                      <>
                        {tr("Age")}: <span className="text-blue-700">{formatAge(selectedDOBDate, tr)}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Gender")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="gender"
                    value={employee.gender}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    <option value="Male">{tr("Male")}</option>
                    <option value="Female">{tr("Female")}</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Marital Status")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={employee.maritalStatus}
                    onChange={handleChange}
                    placeholder={tr("Marital Status")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    <option value="Single">{tr("Single")}</option>
                    <option value="Married">{tr("Married")}</option>
                  </select>
                </div>

                {/* Date of Joining 
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Date of Joining")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="doj"
                    value={moment(new Date(employee.doj)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //     placeholder={tr("Date of Joining")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>*/}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
                {/* Date of Joining */}
                <div className="grid grid-cols-1">
                  <label className="block mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Date of Joining")} <span className="text-red-700">*</span>
                  </label>
                  <DatePicker
                    name="doj"
                    maxDate={getBusinessTodayDate()}
                    selected={selectedDOJDate}
                    onChange={(date) => setSelectedDOJDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="mb-4 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    isClearable
                  //showIcon
                  //toggleCalendarOnIconClick
                  />
                  <div className="mt-1 h-4 text-[10px] font-normal text-slate-500 leading-4">
                    {selectedDOJDate ? (
                      <>
                        {tr("Working Experience")}: <span className="text-blue-700">{formatWorkingExperience(selectedDOJDate, tr)}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Hadhiya")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="salary"
                    onChange={handleChange}
                    value={employee.salary}
                    min="0"
                    //    placeholder={tr("Salary")}
                    className="mt-1 mb-3 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                    {tr("Update Image")}
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    placeholder={tr("Upload Image")}
                    accept="image/*"
                    className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {SHOW_EXTENDED_EMPLOYEE_FIELDS && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7">
                    {/* Travelling Allowance */}
                    <div>
                      <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                        {tr("Travelling Allowance")}
                      </label>
                      <input
                        type="number"
                        name="travellingAllowance"
                        value={employee.travellingAllowance ?? ""}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Other Designation */}
                    <div>
                      <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                        {tr("Other Designation")}
                      </label>
                      <textarea
                        name="otherDesignation"
                        value={employee.otherDesignation || ""}
                        onChange={handleChange}
                        rows={2}
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7 mb-5">
                    {/* Activities carried out */}
                    <div>
                      <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                        {tr("Activities carried out")}
                      </label>
                      <textarea
                        name="activitiesCarriedOut"
                        value={employee.activitiesCarriedOut || ""}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                      />
                    </div>

                    {/* Bank account details */}
                    <div>
                      <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                        {tr("Bank account details")}
                      </label>
                      <textarea
                        name="bankAccountDetails"
                        value={employee.bankAccountDetails || ""}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
            >
              <AutoText text={tr("Update Employee") } variant="button" className="font-bold" />
            </button>
          </form>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default Edit;
