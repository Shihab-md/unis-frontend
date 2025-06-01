import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getSchools } from '../../utils/SchoolHelper';
import { getAcademicYears } from '../../utils/AcademicYearHelper';
import { getInstitutes } from '../../utils/InstituteHelper';
import { getCourses } from '../../utils/CourseHelper';
import { getBaseUrl, handleRightClick, checkAuth } from '../../utils/CommonHelper';;
import Swal from 'sweetalert2';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [formData, setFormData] = useState({});
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

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("studentAdd") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }
  });

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchools(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const getAcademicYearsMap = async (id) => {
      const academicYears = await getAcademicYears(id);
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
  }, []);

  useEffect(() => {
    const getInstitutesMap = async (id) => {
      const institutes = await getInstitutes(id);
      setInstitutes(institutes);
    };
    getInstitutesMap();
  }, []);

  useEffect(() => {
    const getCoursesMap = async (id) => {
      const courses = await getCourses(id);
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

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key])
    })

    try {
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
        Swal.fire({
          title: "Success!",
          html: "<b>Successfully Added!</b>",
          icon: "success",
          timer: 1600,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        navigate("/dashboard/students");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        Swal.fire('Error!', error.response.data.error, 'error');
      }
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md shadow-md">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Enter Student Details</h2>
          <Link to="/dashboard/students" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* School */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Niswan <span className="text-red-700">*</span>
                </label>
                <select
                  name="schoolId"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Niswan</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>

              {/* Roll Number (Email) */}
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
              </div>

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

              {/* Date of Addmission */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Date of Addmission <span className="text-red-700">*</span>
                </label>
                <input
                  type="date"
                  name="doa"
                  onChange={handleChange}
                  //    placeholder="DOB"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-700">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  onChange={handleChange}
                  //    placeholder="DOB"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

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
                  <option value="">Select Gender</option>
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
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
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
              <div className="flex space-x-3 mb-5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

              {/* State / District */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State / District <span className="text-red-700">*</span>
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
            </div>

            <div className="grid mt-3 grid-cols-1 md:grid-cols-1 gap-5 ">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />

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
              <ViewCard type="header" text="Deeniyath Education" />
              <div className="flex space-x-3 mb-5" />

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

              <div className="grid grid-cols-2 gap-7 justify-between">
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

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount1"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Final Fees 
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Final Fees
                  </label>
                  <input
                    type="number"
                    name="finalFees1"
                    onChange={handleChange}
                    disabled={true}
                    value={finalFees1Val}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>*/}
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />
              <ViewCard type="header" text="School Education" />
              <div className="flex space-x-3 mb-5" />

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

              <div className="grid grid-cols-2 gap-7 justify-between">
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

                {/* Discount 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount2"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Final Fees 2 
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Final Fees
                  </label>
                  <input
                    type="number"
                    name="finalFees2"
                    onChange={handleChange}
                    disabled={true}
                    value={finalFees2Val}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>*/}
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />
              <ViewCard type="header" text="College Education" />
              <div className="flex space-x-3 mb-5" />

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

              <div className="grid grid-cols-2 gap-7 justify-between">
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

                {/* Discount 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount3"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Final Fees 3 
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Final Fees
                  </label>
                  <input
                    type="number"
                    name="finalFees3"
                    onChange={handleChange}
                    disabled={true}
                    value={finalFees3Val}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>*/}
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />
              <ViewCard type="header" text="Vocational Course - 1" />
              <div className="flex space-x-3 mb-5" />

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
                  {institutes.filter(institute => institute.type === "Vocational Courses").map((institute) => (
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
                  {courses.filter(course => course.type === "Vocational Courses").map((course) => (
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

              <div className="grid grid-cols-2 gap-7 justify-between">
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

                {/* Discount 4 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount4"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Final Fees 4 
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Final Fees
                  </label>
                  <input
                    type="number"
                    name="finalFees4"
                    onChange={handleChange}
                    disabled={true}
                    value={finalFees4Val}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>*/}
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />
              <ViewCard type="header" text="Vocational Course - 2" />
              <div className="flex space-x-3 mb-5" />

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

              <div className="grid grid-cols-2 gap-7 justify-between">
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

                {/* Discount 5 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount5"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Final Fees 5 
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Final Fees
                  </label>
                  <input
                    type="number"
                    name="finalFees5"
                    onChange={handleChange}
                    disabled={true}
                    value={finalFees5Val}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>*/}
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />
              <ViewCard type="header" text="Hostel Details" />
              <div className="flex space-x-3 mb-5" />

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

              <div className="flex space-x-3 mb-5" />

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

              <div className="grid grid-cols-2 gap-7 justify-between">
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

                {/* Hostel Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="hostelDiscount"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Hostel Final Fees 
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Final Fees
                  </label>
                  <input
                    type="number"
                    name="hostelFinalFees"
                    onChange={handleChange}
                    disabled={true}
                    value={finalFees6Val}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>*/}
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />

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
        </form>
      </div>
    </>
  );
};

export default Add;