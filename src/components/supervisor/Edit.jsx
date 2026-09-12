import React, { useEffect, useState } from "react";
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
import { AutoText, useLanguage } from '../../i18n/LanguageContext';

const Edit = () => {
  const { tr, direction, fontFamily } = useLanguage();

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const navigate = useNavigate()
  const { user } = useAuth();
  const { id } = useParams();

  const [processing, setProcessing] = useState(null)
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOJDate, setSelectedDOJDate] = useState(null);

  const [supervisor, setSupervisor] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    routeName: "",
    qualification: "",
    fatherGuardianName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    doj: "",
    designation: "",
    salary: "",
    travellingAllowance: "",
    otherDesignation: "",
    activitiesCarriedOut: "",
    bankAccountDetails: "",
    jobType: "",
  });

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("supervisorEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchSupervisor = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const supervisor = responnse.data.supervisor;

          setSelectedDOBDate(supervisor.dob);
          setSelectedDOJDate(supervisor.doj);

          setSupervisor((prev) => ({
            ...prev,
            name: supervisor.userId.name,
            email: supervisor.userId.email,
            supervisorId: supervisor.supervisorId,
            contactNumber: supervisor.contactNumber,
            address: supervisor.address,
            routeName: supervisor.routeName,
            qualification: supervisor.qualification,
            fatherGuardianName: supervisor.fatherGuardianName || "",
            //  dob: supervisor.dob,
            gender: supervisor.gender,
            maritalStatus: supervisor.maritalStatus,
            //  doj: supervisor.doj,
            designation: supervisor.designation,
            salary: supervisor.salary,
            travellingAllowance: supervisor.travellingAllowance ?? 0,
            otherDesignation: supervisor.otherDesignation || "",
            activitiesCarriedOut: supervisor.activitiesCarriedOut || "",
            bankAccountDetails: supervisor.bankAccountDetails || "",
            jobType: supervisor.jobType,
            remarks: supervisor.remarks,
            active: supervisor.active
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/supervisors/");
        }
      }
    };

    fetchSupervisor();
  }, []);

  {/*
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setSupervisor((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setSupervisor((prevData) => ({ ...prevData, [name]: value }));
    }
  };
*/}
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      const file = files?.[0];

      if (!file) {
        setSupervisor((prevData) => ({ ...prevData, file: null }));
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2 MB

      if (file.size > maxSize) {
        showSwalAlert("Error!", "Image size must be less than 2 MB.", "error");
        e.target.value = "";
        return;
      }

      setSupervisor((prevData) => ({ ...prevData, file }));
    } else {
      setSupervisor((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const formData = new FormData();

      formData.append("name", supervisor.name || "");
      formData.append("email", supervisor.email || "");
      formData.append("supervisorId", supervisor.supervisorId || "");
      formData.append("contactNumber", supervisor.contactNumber || "");
      formData.append("address", supervisor.address || "");
      formData.append("routeName", supervisor.routeName || "");
      formData.append("qualification", supervisor.qualification || "");
      formData.append("fatherGuardianName", supervisor.fatherGuardianName || "");
      formData.append("gender", supervisor.gender || "");
      formData.append("maritalStatus", supervisor.maritalStatus || "");
      formData.append("designation", supervisor.designation || "");
      formData.append("salary", supervisor.salary || "");
      formData.append("travellingAllowance", supervisor.travellingAllowance ?? "");
      formData.append("otherDesignation", supervisor.otherDesignation || "");
      formData.append("activitiesCarriedOut", supervisor.activitiesCarriedOut || "");
      formData.append("bankAccountDetails", supervisor.bankAccountDetails || "");
      formData.append("jobType", supervisor.jobType || "");
      formData.append("remarks", supervisor.remarks || "");
      formData.append("active", supervisor.active || "");

      formData.append(
        "dob",
        selectedDOBDate ? new Date(selectedDOBDate).toISOString() : ""
      );

      formData.append(
        "doj",
        selectedDOJDate ? new Date(selectedDOJDate).toISOString() : ""
      );

      if (supervisor.file) {
        formData.append("file", supervisor.file);
      }

      const response = await axios.put(
        (await getBaseUrl()).toString() + `supervisor/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
        navigate("/dashboard/supervisors");
      }
    } catch (error) {
      setProcessing(false);
      console.log(error);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      } else {
        showSwalAlert("Error!", "Image upload failed.", "error");
      }
    }
  };

  {/*
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (selectedDOBDate) {
        supervisor.dob = selectedDOBDate;
      } else {
        supervisor.dob = "";
      }
      if (selectedDOJDate) {
        supervisor.doj = selectedDOJDate;
      } else {
        supervisor.doj = "";
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }
 
      const response = await axios.put(
        (await getBaseUrl()).toString() + `supervisor/${id}`,
        supervisor,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
        navigate("/dashboard/supervisors");
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    }
  };
*/}

  if (processing) {
    return getPrcessing();
  }

  return (
    <>
      {supervisor ? (
        <div dir={direction} style={{ fontFamily }} className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <AutoText as="h2" text={tr("Update Supervisor Details")} variant="button" className="font-semibold items-center justify-center" />
            <Link to="/dashboard/supervisors" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Name")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={supervisor.name}
                    onChange={handleChange}
                    //      placeholder="Insert Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Email")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={supervisor.email}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Insert Email"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3 mt-7">
                {/* Supervisor ID */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Supervisor ID")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="supervisorId"
                    value={supervisor.supervisorId}
                    onChange={handleChange}
                    //  disabled={true}
                    //      placeholder="Supervisor ID"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Contact Number")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={supervisor.contactNumber}
                    onChange={handleChange}
                    min="0"
                    //     placeholder="Contact Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Route Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Route Name")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="routeName"
                    value={supervisor.routeName}
                    onChange={handleChange}
                    //    placeholder="Route Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-7">
                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Address")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={supervisor.address}
                    onChange={handleChange}
                    //    placeholder="Address"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Qualification")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={supervisor.qualification}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Father / Guardian Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Father / Guardian Name")}
                  </label>
                  <input
                    type="text"
                    name="fatherGuardianName"
                    value={supervisor.fatherGuardianName || ""}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
                {/* Date of Birth */}
                <div className="grid grid-cols-1">
                  <label className="block mt-2 text-sm font-medium text-slate-500">
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
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Gender")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="gender"
                    value={supervisor.gender}
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
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Marital Status")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={supervisor.maritalStatus}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-7">
                {/* Job Type */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Job Type")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="jobType"
                    value={supervisor.jobType}
                    onChange={handleChange}
                    placeholder={tr("Job Type")}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    <option value="Full-Time">{tr("Full-Time")}</option>
                    <option value="Part-Time">{tr("Part-Time")}</option>
                  </select>
                </div>

                {/* Date of Joining */}
                <div className="grid grid-cols-1">
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Date of Joining")} <span className="text-red-700">*</span>
                  </label>
                  <DatePicker
                    name="doj"
                    maxDate={getBusinessTodayDate()}
                    selected={selectedDOJDate}
                    onChange={(date) => setSelectedDOJDate(date)}
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
                    {selectedDOJDate ? (
                      <>
                        {tr("Working Experience")}: <span className="text-blue-700">{formatWorkingExperience(selectedDOJDate, tr)}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Hadhiya")} <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="salary"
                    onChange={handleChange}
                    value={supervisor.salary}
                    min="0"
                    //    placeholder="Hadhiya"
                    className="mt-1 p-2 mb-3 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Active */}
                <div>
                  <label className="block mt-3 text-sm font-medium text-slate-500">
                    {tr("Status")} <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="active"
                    value={supervisor.active}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    <option value="Active">{tr("Active")}</option>
                    <option value="In-Active">{tr("In-Active")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
                {/* Travelling Allowance */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Travelling Allowance")}
                  </label>
                  <input
                    type="number"
                    name="travellingAllowance"
                    value={supervisor.travellingAllowance ?? ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>

                {/* Other Designation */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Other Designation")}
                  </label>
                  <textarea
                    name="otherDesignation"
                    value={supervisor.otherDesignation || ""}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
                {/* Activities carried out */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Activities carried out")}
                  </label>
                  <textarea
                    name="activitiesCarriedOut"
                    value={supervisor.activitiesCarriedOut || ""}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                  />
                </div>

                {/* Bank account details */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Bank account details")}
                  </label>
                  <textarea
                    name="bankAccountDetails"
                    value={supervisor.bankAccountDetails || ""}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
                {/* Image Upload */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("Update Image")}
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    placeholder={tr("Upload Image")}
                    accept="image/*"
                    className="mt-1 p-1 mb-5 block w-full border border-gray-300 rounded-md"
                  />
                </div>

                {/* More details about the Supervisor */}
                <div className="md:col-span-2">
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    {tr("More details about the Supervisor")}
                  </label>
                  <input
                    type="text"
                    name="remarks"
                    value={supervisor.remarks}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
            >
              <AutoText text={tr("Update Supervisor")} variant="button" className="font-bold" />
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
