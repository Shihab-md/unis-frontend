import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSupervisorsFromCache } from '../../utils/SupervisorHelper';
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import { getDistrictStatesFromCache } from '../../utils/DistrictStateHelper';
import {
  FaRegTimesCircle
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const [processing, setProcessing] = useState(null)
  const [selectedDOEDate, setSelectedDOEDate] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [districtStates, setDistrictStates] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({ code: "" });

  const navigate = useNavigate()

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("schoolAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  });

  useEffect(() => {
    const getSupervisorsMap = async (id) => {
      const supervisors = await getSupervisorsFromCache(id);
      setSupervisors(supervisors);
    };
    getSupervisorsMap();
  }, []);

  useEffect(() => {
    const getDistrictStatesMap = async (id) => {
      const districtStates = await getDistrictStatesFromCache(id);
      setDistrictStates(districtStates);
    };
    getDistrictStatesMap();
  }, []);

  const SCHOOL_PREFIX_REGEX = /^UN-[A-Z0-9]{2}$/;

  function normalizeSchoolPrefix(v) {
    return (v ?? "").toString().trim().toUpperCase();
  }

  function validateSchoolPrefix(v) {
    const value = normalizeSchoolPrefix(v);
    if (!value) return { ok: false, msg: "Prefix is required (example: UN-01)" };
    if (!SCHOOL_PREFIX_REGEX.test(value)) {
      return { ok: false, msg: "Invalid prefix. Use format like UN-01 / UN-AP / UN-75" };
    }
    return { ok: true, msg: "" };
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "code") {
      const normalized = normalizeSchoolPrefix(value);

      setFormData((p) => ({ ...p, code: normalized }));

      const v = validateSchoolPrefix(normalized);
      setErrors((p) => ({ ...p, code: v.ok ? "" : v.msg }));
      return;
    }

    if (name === "image") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validateSchoolPrefix(formData.code);
    if (!v.ok) {
      setErrors((p) => ({ ...p, code: v.msg }));
      return; // ❌ block submit
    }

    setProcessing(true);

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key])
    })

    try {
      if (selectedDOEDate) {
        formDataObj.append('doe', selectedDOEDate)
      }

      const response = await axios.post(
        (await getBaseUrl()).toString() + "school/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/schools");
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

  const preventMinus = (e) => {
    if (e.code === 'Minus') {
      e.preventDefault();
    }
  };

  const preventPasteNegative = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = parseFloat(clipboardData.getData('text'));

    if (pastedData < 0) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    // Prevent 'e', 'E', '+', and '-' from being entered
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto mt-2 p-5 content-center shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Enter Niswan Details</h2>
          <Link to="/dashboard/schools" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="py-2 px-3 lg:px-5 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Code */}
              <div>
                <label className="block mt-3 text-sm font-medium text-slate-500">
                  Code (Prefix) <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  onChange={handleChange}
                  placeholder="UN-XX"
                  className={`mt-1 p-2 block w-full border rounded-md ${errors.code ? "border-red-500" : "border-gray-300"
                    }`}
                  required
                />

                {errors.code && (
                  <p className="text-xs text-red-600 mt-1">{errors.code}</p>
                )}
              </div>

              {/* Date of Establishment */}
              <div className="grid mt-3 grid-cols-1">
                <label className="block text-sm font-medium text-slate-500">
                  Date of Establishment
                </label>
                <DatePicker
                  name="doe"
                  selected={selectedDOEDate}
                  onChange={(date) => setSelectedDOEDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  isClearable
                // showIcon
                // toggleCalendarOnIconClick
                />
              </div>

              {/* Active */}
              <div>
                <label className="block mt-3 text-sm font-medium text-slate-500">
                  Status <span className="text-red-700">*</span>
                </label>
                <select
                  name="active"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  <option value="Active">Active</option>
                  <option value="In-Active">In-Active</option>
                </select>
              </div>

              <div className="hidden lg:block flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 gap-y-7 mb-11">
              <div className="hidden lg:block flex space-x-3 mb-5" />
              {/* Name English*/}
              <div className='col-span-6'>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Name in English <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="nameEnglish"
                  onChange={handleChange}
                  placeholder=""
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="hidden lg:block flex space-x-3 mb-5" />

              <div className="hidden lg:block flex space-x-3 mb-5" />
              {/* Name Arabic*/}
              <div className='col-span-6'>
                <label className="block text-sm font-medium text-slate-500">
                  Name in Arabic
                </label>
                <input
                  type="text"
                  name="nameArabic"
                  onChange={handleChange}
                  placeholder=""
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
              <div className="hidden lg:block flex space-x-3 mb-5" />

              <div className="hidden lg:block flex space-x-3 mb-5" />
              {/* Name Native*/}
              <div className='col-span-6'>
                <label className="block text-sm font-medium text-slate-500">
                  Name in Native
                </label>
                <input
                  type="text"
                  name="nameNative"
                  onChange={handleChange}
                  placeholder=""
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
              <div className="hidden lg:block flex space-x-3 mb-5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Contact Number
                </label>
                <input
                  type="number"
                  name="contactNumber"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Insert Contact Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  //  placeholder="Insert Email"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>
            </div>

            <div className="grid mt-10 grid-cols-1 md:grid-cols-2 gap-5">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Door No. & Street <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Area & Town / City <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid mt-5 grid-cols-1 md:grid-cols-3 gap-5">
              {/* LandMark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  LandMark
                </label>
                <input
                  type="text"
                  name="landmark"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pincode <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="pincode"
                  onChange={handleChange}
                  min="0"
                  onPaste={preventPasteNegative}
                  onKeyPress={preventMinus}
                  onKeyDown={handleKeyDown}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* District & State*/}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Select District & State <span className="text-red-700">*</span>
                </label>
                <select
                  name="districtStateId"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  {districtStates.map((districtState) => (
                    <option key={districtState._id} value={districtState._id}>
                      {districtState.district + ", " + districtState.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid mt-10 grid-cols-1 md:grid-cols-5 gap-4">
              <div className="hidden lg:block flex space-x-3 mb-5" />
              {/* Supervisor Id */}
              <div className='lg:col-span-3'>
                <label className="block text-sm font-medium text-slate-500">
                  Select Supervisor <span className="text-red-700">*</span>
                </label>
                <select
                  name="supervisorId"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor._id} value={supervisor._id}>
                      {supervisor.supervisorId + " : " + supervisor.userId.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden lg:block flex space-x-3 mb-5" />
            </div>

            <div className="grid mt-10 grid-cols-1 md:grid-cols-4 gap-4 gap-y-7 mb-5">
              {/* Incharge1 */}
              <div className='lg:col-span-2'>
                <label className="block text-sm font-medium text-slate-500">
                  <span className='font-bold text-blue-400'>Incharge-1 : </span> <span>Name </span>
                  <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="incharge1"
                  onChange={handleChange}
                  //  placeholder="Incharge1 Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Incharge1 Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Mobile Number <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="incharge1Number"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Incharge1 Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation1"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Incharge2 */}
              <div className='lg:col-span-2'>
                <label className="block text-sm font-medium text-slate-500">
                  <span className='font-bold text-blue-400'>Incharge-2 : </span> <span>Name</span>
                </label>
                <input
                  type="text"
                  name="incharge2"
                  onChange={handleChange}
                  //  placeholder="Incharge2 Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              {/* Incharge2 Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="incharge2Number"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Incharge2 Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation2"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Incharge3 */}
              <div className='lg:col-span-2'>
                <label className="block text-sm font-medium text-slate-500">
                  <span className='font-bold text-blue-400'>Incharge-3 : </span> <span>Name</span>
                </label>
                <input
                  type="text"
                  name="incharge3"
                  onChange={handleChange}
                  //  placeholder="Incharge3 Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              {/* Incharge3 Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="incharge3Number"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Incharge3 Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation3"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Incharge4 */}
              <div className='lg:col-span-2'>
                <label className="block text-sm font-medium text-slate-500">
                  <span className='font-bold text-blue-400'>Incharge-4 : </span> <span>Name</span>
                </label>
                <input
                  type="text"
                  name="incharge4"
                  onChange={handleChange}
                  //  placeholder="Incharge4 Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              {/* Incharge4 Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="incharge4Number"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Incharge4 Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation4"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Incharge5 */}
              <div className='lg:col-span-2'>
                <label className="block text-sm font-medium text-slate-500">
                  <span className='font-bold text-blue-400'>Incharge-5 : </span> <span>Name</span>
                </label>
                <input
                  type="text"
                  name="incharge5"
                  onChange={handleChange}
                  //  placeholder="Incharge5 Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              {/* Incharge5 Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="incharge5Number"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Incharge5 Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation5"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Incharge6 */}
              <div className='lg:col-span-2'>
                <label className="block text-sm font-medium text-slate-500">
                  <span className='font-bold text-blue-400'>Incharge-6 : </span> <span>Name</span>
                </label>
                <input
                  type="text"
                  name="incharge6"
                  onChange={handleChange}
                  //  placeholder="Incharge5 Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              {/* Incharge6 Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="incharge6Number"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Incharge5 Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation6"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Incharge7 */}
              <div className='lg:col-span-2'>
                <label className="block text-sm font-medium text-slate-500">
                  <span className='font-bold text-blue-400'>Incharge-7 : </span> <span>Name</span>
                </label>
                <input
                  type="text"
                  name="incharge7"
                  onChange={handleChange}
                  //  placeholder="Incharge5 Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              {/* Incharge7 Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="incharge7Number"
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Incharge5 Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation7"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            data-ripple-light="true"
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
          >
            Add Niswan
          </button>
        </form>
      </div>
    </>
  );
};

export default Add;
