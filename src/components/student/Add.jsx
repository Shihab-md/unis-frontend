import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from "react-router-dom";
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';
import { getInstitutesFromCache } from '../../utils/InstituteHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(null)
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOADate, setSelectedDOADate] = useState(null);

  const [schools, setSchools] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);

  const [fees1Val, setFees1Val] = useState("");
  const [fees2Val, setFees2Val] = useState("");
  const [fees3Val, setFees3Val] = useState("");
  const [fees4Val, setFees4Val] = useState("");
  const [fees5Val, setFees5Val] = useState("");
  const [fees6Val, setFees6Val] = useState("");

  const navigate = useNavigate()
  const { user } = useAuth();

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("studentAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  });

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const getAcademicYearsMap = async (id) => {
      const academicYears = await getAcademicYearsFromCache(id);
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
  }, []);

  useEffect(() => {
    const getInstitutesMap = async (id) => {
      const institutes = await getInstitutesFromCache(id);
      // alert(institutes)
      setInstitutes(institutes);
    };
    getInstitutesMap();
  }, []);

  useEffect(() => {
    const getCoursesMap = async (id) => {
      const courses = await getCoursesFromCache(id);
      setCourses(courses);
    };
    getCoursesMap();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // set Fees after seletion of course
    if (name === "courseId1") {
      let fees1 = courses.filter(course => course._id === value).map(course => course.fees);
      setFees1Val(fees1);

    } else if (name === "courseId2") {
      let fees2 = courses.filter(course => course._id === value).map(course => course.fees);
      setFees2Val(fees2);

    } else if (name === "courseId3") {
      let fees3 = courses.filter(course => course._id === value).map(course => course.fees);
      setFees3Val(fees3);

    } else if (name === "courseId4") {
      let fees4 = courses.filter(course => course._id === value).map(course => course.fees);
      setFees4Val(fees4);

    } else if (name === "courseId5") {
      let fees5 = courses.filter(course => course._id === value).map(course => course.fees);
      setFees5Val(fees5);

    } else if (name === "hostelFees") {
      setFees6Val(value);

    }

    // to set fees value
    if (name === "fees1") {
      setFees1Val(value);
    } else if (name === "fees2") {
      setFees2Val(value);
    } else if (name === "fees3") {
      setFees3Val(value);
    } else if (name === "fees4") {
      setFees4Val(value);
    } else if (name === "fees5") {
      setFees5Val(value);
    }

    if (name === "file") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,

        fees1: fees1Val,
        fees2: fees2Val,
        fees3: fees3Val,
        fees4: fees4Val,
        fees5: fees5Val,

      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key])
    })

    try {
      if (selectedDOBDate) {
        formDataObj.append('dob', selectedDOBDate)
      }
      if (selectedDOADate) {
        formDataObj.append('doa', selectedDOADate)
      }
      formDataObj.append('schoolId', localStorage.getItem('schoolId'));

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const response = await axios.post(
        (await getBaseUrl()).toString() + "student/add",
        formDataObj,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/students");
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
      <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Enter Student Details</h2>
          <Link to="/dashboard/students" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autocomplete="off">
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-5">

              {/* School */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Niswan <span className="text-red-700">*</span>
                </label>
                <select
                  name="schoolId"
                  value={localStorage.getItem('schoolId')}
                  onChange={handleChange}
                  disabled={true}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Niswan</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.code + " : " + school.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mb-5" />
            {/* Roll Number (Email) 
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Roll Number <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>*/}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Name <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Date of Admission */}
                <div className="grid grid-cols-1">
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Date of Admission <span className="text-red-700">*</span>
                  </label>
                  <DatePicker
                    name="doa"
                    selected={selectedDOADate}
                    onChange={(date) => setSelectedDOADate(date)}
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
                </div>
                {/* Date of Birth */}
                <div className="grid grid-cols-1">
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-700">*</span>
                  </label>
                  <DatePicker
                    name="dob"
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
                </div>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
            </div>

            <div className="grid mt-2 grid-cols-1 md:grid-cols-3 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-700">*</span>
                </label>
                <select
                  name="gender"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marital Status <span className="text-red-700">*</span>
                </label>
                <select
                  name="maritalStatus"
                  onChange={handleChange}
                  placeholder="Marital Status"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              {/* Mother Tongue */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mother Tongue
                </label>
                <select
                  name="motherTongue"
                  onChange={handleChange}
                  placeholder="Mother Tongue"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value=""></option>
                  <option value="Tamil">Tamil</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Telugu">Telugu</option>
                  <option value="English">English</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blood Group
                </label>
                <input
                  type="text"
                  name="bloodGroup"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Identification Mark-1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Identification Mark-1 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="idMark1"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Identification Mark-2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Identification Mark-2
                </label>
                <input
                  type="text"
                  name="idMark2"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Father's Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Father's Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Number
                </label>
                <input
                  type="number"
                  name="fatherNumber"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Father's Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Occupation
                </label>
                <input
                  type="text"
                  name="fatherOccupation"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Mother's Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="motherName"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Mother's Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Number
                </label>
                <input
                  type="number"
                  name="motherNumber"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Mother's Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Occupation
                </label>
                <input
                  type="text"
                  name="motherOccupation"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>

            <div className="grid mt-5 grid-cols-1 md:grid-cols-4 gap-5">
              {/* Guardian's Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Guardian's Name
                </label>
                <input
                  type="text"
                  name="guardianName"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Guardian's Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Guardian's Number
                </label>
                <input
                  type="number"
                  name="guardianNumber"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Guardian's Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Guardian's Occupation
                </label>
                <input
                  type="text"
                  name="guardianOccupation"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Guardian's Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Guardian's Relationship
                </label>
                <input
                  type="text"
                  name="guardianRelation"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>
            </div>

            <div className="flex mt-5 space-x-3 mb-5" />
            <div className="hidden lg:block flex space-x-3 mb-5" />
            <div className="hidden lg:block flex space-x-3 mb-5" />

            <div className="grid mt-5 grid-cols-1 md:grid-cols-2 gap-5">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  onChange={handleChange}
                  //  placeholder="Address"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                    onChange={handleChange}
                    //  placeholder="Route Name"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                    onChange={handleChange}
                    //  placeholder="Route Name"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Academic Year */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Academic Year <span className="text-red-700">*</span>
                </label>
                <select
                  name="acYear"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((acYear) => (
                    <option key={acYear._id} value={acYear._id}>
                      {acYear.acYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <ViewCard type="header" text="Deeniyath Education" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Institute 1 --------------------------------------------- */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Institute <span className="text-red-700">*</span>
                </label>
                <select
                  name="instituteId1"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Institute</option>
                  {institutes.filter(institute => institute.type === "Deeniyath Education").map((institute) => (
                    <option key={institute._id} value={institute._id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course 1 */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Course <span className="text-red-700">*</span>
                </label>
                <select
                  name="courseId1"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.filter(course => course.type === "Deeniyath Education").map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number-1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="refNumber1"
                  onChange={handleChange}
                  //    placeholder="Qualification"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Year / Std. <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Fees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fees
                  </label>
                  <input
                    type="number"
                    name="fees1"
                    value={fees1Val}
                    disabled={true}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <ViewCard type="header" text="School Education" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Institute 2 --------------------------------------------- */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Institute
                </label>
                <select
                  name="instituteId2"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Institute</option>
                  {institutes.filter(institute => institute.type === "School Education").map((institute) => (
                    <option key={institute._id} value={institute._id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course 2 */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  name="courseId2"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Course</option>
                  {courses.filter(course => course.type === "School Education").map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number-2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="refNumber2"
                  onChange={handleChange}
                  //    placeholder="Qualification"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Fees 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fees
                </label>
                <input
                  type="number"
                  name="fees2"
                  value={fees2Val}
                  disabled={true}
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <ViewCard type="header" text="College Education" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Institute 3 --------------------------------------------- */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Institute
                </label>
                <select
                  name="instituteId3"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Institute</option>
                  {institutes.filter(institute => institute.type === "College Education").map((institute) => (
                    <option key={institute._id} value={institute._id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course 3 */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  name="courseId3"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Course</option>
                  {courses.filter(course => course.type === "College Education").map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number-3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="refNumber3"
                  onChange={handleChange}
                  //    placeholder="Qualification"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Fees 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fees
                </label>
                <input
                  type="number"
                  name="fees3"
                  value={fees3Val}
                  disabled={true}
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <ViewCard type="header" text="Islamic Home Science" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Institute 4 --------------------------------------------- */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Institute
                </label>
                <select
                  name="instituteId4"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Institute</option>
                  {institutes.filter(institute => institute.type === "Islamic Home Science").map((institute) => (
                    <option key={institute._id} value={institute._id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course 4 */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  name="courseId4"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Course</option>
                  {courses.filter(course => course.type === "Islamic Home Science").map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number-4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="refNumber4"
                  onChange={handleChange}
                  //    placeholder="Qualification"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Fees 4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fees
                </label>
                <input
                  type="number"
                  name="fees4"
                  value={fees4Val}
                  disabled={true}
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <ViewCard type="header" text="Vocational Course" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Institute 5 --------------------------------------------- */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Institute
                </label>
                <select
                  name="instituteId5"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Institute</option>
                  {institutes.filter(institute => institute.type === "Vocational Courses").map((institute) => (
                    <option key={institute._id} value={institute._id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course 5 */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  name="courseId5"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                >
                  <option value="">Select Course</option>
                  {courses.filter(course => course.type === "Vocational Courses").map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number-5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="refNumber5"
                  onChange={handleChange}
                  //    placeholder="Qualification"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Fees 5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fees
                </label>
                <input
                  type="number"
                  name="fees5"
                  value={fees5Val}
                  disabled={true}
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <ViewCard type="header" text="Hostel Details" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Hostel */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hostel Admission <span className="text-red-700">*</span>
                </label>
                <select
                  name="hostel"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Hostel Admission</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Hostel Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="hostelRefNumber"
                  onChange={handleChange}
                  //    placeholder="Qualification"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Hostel Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fees
                </label>
                <input
                  type="number"
                  name="hostelFees"
                  value={fees6Val}
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  placeholder="Upload Image"
                  accept="image/*"
                  className="mt-2 mb-5 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
          >
            Add Student
          </button>
        </form >
      </div >
    </>
  );
};

export default Add;