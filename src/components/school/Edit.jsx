import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSupervisorsFromCache } from '../../utils/SupervisorHelper';
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Edit = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [processing, setProcessing] = useState(null)
  const [selectedDOEDate, setSelectedDOEDate] = useState(null);

  const [school, setSchool] = useState({
    code: "",
    nameEnglish: "",
    nameArabic: "",
    nameNative: "",
    address: "",
    district: "",
    email: "",
    active: "",
    supervisorId: "",
    incharge1: "",
    incharge2: "",
    incharge3: "",
    incharge4: "",
    incharge5: "",
    incharge6: "",
    incharge7: "",
  });

  const [supervisors, setSupervisors] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getSupervisorsMap = async (id) => {
      const supervisors = await getSupervisorsFromCache(id);
      setSupervisors(supervisors);
    };
    getSupervisorsMap();
  }, []);

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("schoolEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchSchool = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `school/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const school = responnse.data.school;

          setSelectedDOEDate(school.doe);

          setSchool((prev) => ({
            ...prev,
            code: school.code,
            nameEnglish: school.nameEnglish,
            nameArabic: school.nameArabic,
            nameNative: school.nameNative,
            address: school.address,
            district: school.district,
            state: school.state,
            contactNumber: school.contactNumber,
            email: school.email,
            active: school.active,
            supervisorId: school.supervisorId,
            incharge1: school.incharge1,
            incharge1Number: school.incharge1Number,
            incharge2: school.incharge2,
            incharge2Number: school.incharge2Number,
            incharge3: school.incharge3,
            incharge3Number: school.incharge3Number,
            incharge4: school.incharge4,
            incharge4Number: school.incharge4Number,
            incharge5: school.incharge5,
            incharge5Number: school.incharge5Number,
            incharge6: school.incharge6,
            incharge6Number: school.incharge6Number,
            incharge7: school.incharge7,
            incharge7Number: school.incharge7Number,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/schools/");
        }
      }
    };

    fetchSchool();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchool((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (selectedDOEDate) {
        school.doe = selectedDOEDate;
      } else {
        school.doe = "";
      }

      const response = await axios.put(
        (await getBaseUrl()).toString() + `school/${id}`,
        school,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
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

  return (
    <>
      {school ? (
        <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Niswan Details</h2>
            <Link to="/dashboard/schools" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit} autocomplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={school.code}
                    disabled={true}
                    onChange={handleChange}
                    placeholder="Insert Code"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Name English*/}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name in English <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="nameEnglish"
                    value={school.nameEnglish}
                    onChange={handleChange}
                    // disabled={true}
                    //  placeholder="Insert Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Name Arabic*/}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name in Arabic
                  </label>
                  <input
                    type="text"
                    name="nameArabic"
                    value={school.nameArabic}
                    onChange={handleChange}
                    //  disabled={true}
                    //  placeholder="Insert Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                {/* Name Native*/}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name in Native
                  </label>
                  <input
                    type="text"
                    name="nameNative"
                    value={school.nameNative}
                    onChange={handleChange}
                    //  disabled={true}
                    //  placeholder="Insert Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={school.address}
                    onChange={handleChange}
                    //  placeholder="Insert Address"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      District <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={school.district}
                      onChange={handleChange}
                      //  placeholder="Insert District / State"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={school.state}
                      onChange={handleChange}
                      //  placeholder="Insert District / State"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={school.contactNumber}
                    onChange={handleChange}
                    //  placeholder="Insert Contact Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={school.email}
                    onChange={handleChange}
                    //  placeholder="Insert Email"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Date of Establishment */}
                <div className="grid grid-cols-1">
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
                    Active <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="active"
                    value={school.active}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="In-Active">In-Active</option>
                  </select>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />

                {/* Supervisor Id */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Supervisor <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="supervisorId"
                    value={school.supervisorId._id}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor._id} value={supervisor._id}>
                        {supervisor.supervisorId + " : " + supervisor.userId.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supervisor Id 
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supervisor Id <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="supervisorId"
                    value={school.supervisorId}
                    onChange={handleChange}
                    //  placeholder="Incharge1 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>*/}

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />

                {/* Incharge-1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-1 Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="incharge1"
                    value={school.incharge1}
                    onChange={handleChange}
                    //  placeholder="Incharge1 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Incharge-1 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-1 Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="incharge1Number"
                    value={school.incharge1Number}
                    onChange={handleChange}
                    //  placeholder="Incharge1 Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Incharge-2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-2 Name
                  </label>
                  <input
                    type="text"
                    name="incharge2"
                    value={school.incharge2}
                    onChange={handleChange}
                    //  placeholder="Incharge2 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-2 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-2 Number
                  </label>
                  <input
                    type="number"
                    name="incharge2Number"
                    value={school.incharge2Number}
                    onChange={handleChange}
                    //  placeholder="Incharge2 Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-3 Name
                  </label>
                  <input
                    type="text"
                    name="incharge3"
                    value={school.incharge3}
                    onChange={handleChange}
                    //  placeholder="Incharge3 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-3 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-3 Number
                  </label>
                  <input
                    type="number"
                    name="incharge3Number"
                    value={school.incharge3Number}
                    onChange={handleChange}
                    //  placeholder="Incharge3 Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-4 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-4 Name
                  </label>
                  <input
                    type="text"
                    name="incharge4"
                    value={school.incharge4}
                    onChange={handleChange}
                    //  placeholder="Incharge4 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-4 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-4 Number
                  </label>
                  <input
                    type="number"
                    name="incharge4Number"
                    value={school.incharge4Number}
                    onChange={handleChange}
                    //  placeholder="Incharge4 Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-5 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-5 Name
                  </label>
                  <input
                    type="text"
                    name="incharge5"
                    value={school.incharge5}
                    onChange={handleChange}
                    //  placeholder="Incharge5 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-5 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-5 Number
                  </label>
                  <input
                    type="number"
                    name="incharge5Number"
                    value={school.incharge5Number}
                    onChange={handleChange}
                    //  placeholder="Incharge5 Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-6 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-6 Name
                  </label>
                  <input
                    type="text"
                    name="incharge6"
                    value={school.incharge6}
                    onChange={handleChange}
                    //  placeholder="Incharge5 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-6 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-6 Number
                  </label>
                  <input
                    type="number"
                    name="incharge6Number"
                    value={school.incharge6Number}
                    onChange={handleChange}
                    //  placeholder="Incharge5 Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-7 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-7 Name
                  </label>
                  <input
                    type="text"
                    name="incharge7"
                    value={school.incharge7}
                    onChange={handleChange}
                    //  placeholder="Incharge5 Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>

                {/* Incharge-7 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-7 Number
                  </label>
                  <input
                    type="number"
                    name="incharge7Number"
                    value={school.incharge7Number}
                    onChange={handleChange}
                    //  placeholder="Incharge5 Number"
                    className="mt-1 mb-3 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              data-ripple-light="true"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Niswan
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
