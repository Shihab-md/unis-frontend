import React, { useEffect, useState } from "react";
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';
import { getInstitutesFromCache } from '../../utils/InstituteHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import ViewCard from "../dashboard/ViewCard";
import { FaRegTimesCircle } from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Promote = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();
  const [processing, setProcessing] = useState(null)

  const [student, setStudent] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    dob: "",
    gender: "",
    maritalStatus: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const [schools, setSchools] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [acYear, setAcYear] = useState("");

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("studentPromote") === "NO") {
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
    const getAcademicYearsMap = async (id) => {
      const academicYears = await getAcademicYearsFromCache(id);
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
  }, []);

  useEffect(() => {
    const getInstitutesMap = async (id) => {
      const institutes = await getInstitutesFromCache(id);
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

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `student/promote/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, }, }
        );

        if (responnse.data.success) {
          const student = responnse.data.student;
          const academics = student._academics;

          setAcYear(academics[0]?.acYear && academics[0]?.acYear?._id ? academics[0]?.acYear?._id : null);

          setStudent((prev) => ({
            ...prev,
            name: student.userId && student.userId.name ? student.userId.name : "",
            schoolId: student.schoolId && student.schoolId._id ? student.schoolId._id : "",
            rollNumber: student.rollNumber,

            active: student.active,
            remarks: student.remarks,

            hostel: student.hostel,
            hostelRefNumber: student.hostelRefNumber,
            hostelFees: student.hostelFees,
            hostelDiscount: student.hostelDiscount,

            acYear: academics[0]?.acYear && academics[0]?.acYear?._id ? academics[0]?.acYear?._id : null,

            instituteId1: academics[0]?.instituteId1 && academics[0]?.instituteId1?._id ? academics[0]?.instituteId1?._id : null,
            courseId1: academics[0]?.courseId1 && academics[0]?.courseId1?._id ? academics[0]?.courseId1?._id : null,
            refNumber1: academics[0]?.refNumber1,
            year1: academics[0]?.year1,
            status1: academics[0]?.status1,
            fees1: academics[0]?.fees1,
            discount1: academics[0]?.discount1,

            instituteId2: academics[0]?.instituteId2 && academics[0]?.instituteId2?._id ? academics[0]?.instituteId2?._id : null,
            courseId2: academics[0]?.courseId2 && academics[0]?.courseId2?._id ? academics[0]?.courseId2?._id : null,
            refNumber2: academics[0]?.refNumber2,
            year2: academics[0]?.year2,
            status2: academics[0]?.status2,
            fees2: academics[0]?.fees2,
            discount2: academics[0]?.discount2,

            instituteId3: academics[0]?.instituteId3 && academics[0]?.instituteId3?._id ? academics[0]?.instituteId3?._id : null,
            courseId3: academics[0]?.courseId3 && academics[0]?.courseId3?._id ? academics[0]?.courseId3?._id : null,
            refNumber3: academics[0]?.refNumber3,
            year3: academics[0]?.year3,
            status3: academics[0]?.status3,
            fees3: academics[0]?.fees3,
            discount3: academics[0]?.discount3,

            instituteId4: academics[0]?.instituteId4 && academics[0]?.instituteId4?._id ? academics[0]?.instituteId4?._id : null,
            courseId4: academics[0]?.courseId4 && academics[0]?.courseId4?._id ? academics[0]?.courseId4?._id : null,
            refNumber4: academics[0]?.refNumber4,
            year4: academics[0]?.year4,
            status4: academics[0]?.status4,
            fees4: academics[0]?.fees4,
            discount4: academics[0]?.discount4,

            instituteId5: academics[0]?.instituteId5 && academics[0]?.instituteId5?._id ? academics[0]?.instituteId5?._id : null,
            courseId5: academics[0]?.courseId5 && academics[0]?.courseId5?._id ? academics[0]?.courseId5?._id : null,
            refNumber5: academics[0]?.refNumber5,
            year5: academics[0]?.year5,
            status5: academics[0]?.status5,
            fees5: academics[0]?.fees5,
            discount5: academics[0]?.discount5,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/students/");
        }
      }
    };

    fetchStudent();
  }, []);

  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (name === "file") {
      setStudent((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setStudent((prevData) => ({
        ...prevData, [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {

      if (acYear) {
        student.acYear = acYear;
      }
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }
      const response = await axios.put(
        (await getBaseUrl()).toString() + `student/promote/${id}`,
        student,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
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
      {student ? (
        <div className="max-w-4xl mx-auto mt-2 p-3 lg:p-5 rounded-md shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Promote Student</h2>
            <Link to="/dashboard/students" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit} autocomplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-1 gap-5">

                {/* School */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Niswan <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="schoolId"
                    value={student.schoolId}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Niswan</option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.code + " : " + school.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid mt-5 grid-cols-1 md:grid-cols-2 gap-5">
                {/* Roll Number (Email) */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Roll Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={student.rollNumber}
                    disabled={true}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={student.name}
                    disabled={true}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="hidden lg:block flex space-x-3 mb-5" />

              <div className="grid mt-10 grid-cols-1 md:grid-cols-3 gap-5">
                <div className="hidden lg:block flex space-x-3 mb-5" />
                {/* Academic Year */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Academic Year <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="acYear"
                    value={student.acYear}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Academic Year</option>
                    {academicYears.map((acYear) => (
                      <option key={acYear._id} value={acYear._id}>
                        {acYear.acYear}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hidden lg:block flex space-x-3 mb-5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex space-x-3 " />
                <div className="flex space-x-3 mb-3 lg:mb-5" />
                <ViewCard type="header" text="Deeniyath Education" />
                <div className="hidden lg:block flex space-x-3" />

                {/* Institute 1 --------------------------------------------- */}
                <div>
                  <label className="block mt-2 lg:mt-0 text-sm font-medium text-slate-500">
                    Institute <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="instituteId1"
                    value={student.instituteId1}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    disabled={true}
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
                  <label className="block mt-2 lg:mt-0 text-sm font-medium text-slate-500">
                    Course <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="courseId1"
                    value={student.courseId1}
                    onChange={handleChange}
                    disabled={true}
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
              </div>

              <div className="grid mt-7 mb-7 grid-cols-1 md:grid-cols-4 gap-5">
                {/* Reference Number-1 */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Reference Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="refNumber1"
                    value={student.refNumber1}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Year1 */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Current Year / Std.<span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="year1"
                    value={student.year1}
                    min="0"
                    onChange={handleChange}
                    disabled={true}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Status1 */}
                <div>
                  <label className="block mt-2 lg:mt-0 text-sm font-medium text-slate-500">
                    Status <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="status1"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Promoted">Promoted</option>
                    <option value="Completed">Completed</option>
                    <option value="Not-Promoted">Not-Promoted</option>
                  </select>
                </div>

                {/* Fees1 */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Fees
                  </label>
                  <input
                    type="number"
                    name="fees1"
                    value={student.fees1}
                    min="0"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {student.instituteId2 && student.courseId2 ?
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex space-x-3 " />
                    <div className="flex space-x-3 mb-3 lg:mb-5" />
                    <ViewCard type="header" text="School Education" />
                    <div className="hidden lg:block flex space-x-3" />

                    {/* Institute 2 --------------------------------------------- */}
                    <div>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Institute
                      </label>
                      <select
                        name="instituteId2"
                        value={student.instituteId2}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
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
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Course
                      </label>
                      <select
                        name="courseId2"
                        value={student.courseId2}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
                      >
                        <option value="">Select Course</option>
                        {courses.filter(course => course.type === "School Education").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid mt-7 mb-7 grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Reference Number-2 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        name="refNumber2"
                        value={student.refNumber2}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
                      />
                    </div>

                    {/* Year2 
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Current Std.
                      </label>
                      <input
                        type="number"
                        name="year2"
                        value={student.year2}
                        min="0"
                        onChange={handleChange}
                        disabled={true}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                      />
                    </div>*/}

                    {/* Status2 */}
                    <div>
                      <label className="block mt-2 lg:mt-0 text-sm font-medium text-slate-500">
                        Status <span className="text-red-700">*</span>
                      </label>
                      <select
                        name="status2"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Promoted">Promoted</option>
                        <option value="Completed">Completed</option>
                        <option value="Not-Promoted">Not-Promoted</option>
                      </select>
                    </div>

                    {/* Next Course 2 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Next Course
                      </label>
                      <select
                        name="nextCourseId"
                        //  value={student.courseId2}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //  disabled={true}
                      >
                        <option value="">Select Course</option>
                        {courses.filter(course => course.type === "School Education").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fees 2 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees2"
                        value={student.fees2}
                        min="0"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                </div> : null}

              {student.instituteId3 && student.courseId3 ?
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex space-x-3 " />
                    <div className="flex space-x-3 mb-3 lg:mb-5" />
                    <ViewCard type="header" text="College Education" />
                    <div className="hidden lg:block flex space-x-3 " />

                    {/* Institute 3 --------------------------------------------- */}
                    <div>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Institute
                      </label>
                      <select
                        name="instituteId3"
                        value={student.instituteId3}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                        disabled={true}
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
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Course
                      </label>
                      <select
                        name="courseId3"
                        value={student.courseId3}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                        disabled={true}
                      >
                        <option value="">Select Course</option>
                        {courses.filter(course => course.type === "College Education").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid mt-7 mb-7 grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Reference Number-3 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        name="refNumber3"
                        value={student.refNumber3}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
                      />
                    </div>

                    {/* Year3 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Current Year
                      </label>
                      <input
                        type="number"
                        name="year3"
                        value={student.year3}
                        min="0"
                        onChange={handleChange}
                        disabled={true}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Status3 */}
                    <div>
                      <label className="block mt-2 lg:mt-0 text-sm font-medium text-slate-500">
                        Status <span className="text-red-700">*</span>
                      </label>
                      <select
                        name="status3"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Promoted">Promoted</option>
                        <option value="Completed">Completed</option>
                        <option value="Not-Promoted">Not-Promoted</option>
                      </select>
                    </div>

                    {/* Fees 3 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees3"
                        value={student.fees3}
                        min="0"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div> : null}

              {student.instituteId4 && student.courseId4 ?
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex space-x-3 " />
                    <div className="flex space-x-3 mb-3 lg:mb-5" />
                    <ViewCard type="header" text="Islamic Home Science" />
                    <div className="hidden lg:block flex space-x-3 " />

                    {/* Institute 4 --------------------------------------------- */}
                    <div>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Institute
                      </label>
                      <select
                        name="instituteId4"
                        value={student.instituteId4}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
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
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Course
                      </label>
                      <select
                        name="courseId4"
                        value={student.courseId4}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
                      >
                        <option value="">Select Course</option>
                        {courses.filter(course => course.type === "Islamic Home Science").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid mt-7 mb-7 grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Reference Number-4 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        name="refNumber4"
                        value={student.refNumber4}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
                      />
                    </div>

                    {/* Year4 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Current Year
                      </label>
                      <input
                        type="number"
                        name="year4"
                        value={student.year4}
                        min="0"
                        onChange={handleChange}
                        disabled={true}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Status4 */}
                    <div>
                      <label className="block mt-2 lg:mt-0 text-sm font-medium text-slate-500">
                        Status <span className="text-red-700">*</span>
                      </label>
                      <select
                        name="status4"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Promoted">Promoted</option>
                        <option value="Completed">Completed</option>
                        <option value="Not-Promoted">Not-Promoted</option>
                      </select>
                    </div>

                    {/* Fees 4 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees4"
                        value={student.fees4}
                        min="0"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div> : null}

              {student.instituteId5 && student.courseId5 ?
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex space-x-3 " />
                    <div className="flex space-x-3 mb-3 lg:mb-5" />
                    <ViewCard type="header" text="Vocational Course" />
                    <div className="hidden lg:block flex space-x-3 " />

                    {/* Institute 5 --------------------------------------------- */}
                    <div>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Institute
                      </label>
                      <select
                        name="instituteId5"
                        value={student.instituteId5}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
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
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Course
                      </label>
                      <select
                        name="courseId5"
                        value={student.courseId5}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
                      >
                        <option value="">Select Course</option>
                        {courses.filter(course => course.type === "Vocational Courses").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid mt-7 mb-7 grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Reference Number-5 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        name="refNumber5"
                        value={student.refNumber5}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={true}
                      />
                    </div>

                    {/* Year5 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Current Year
                      </label>
                      <input
                        type="number"
                        name="year5"
                        value={student.year5}
                        min="0"
                        onChange={handleChange}
                        disabled={true}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Status5 */}
                    <div>
                      <label className="block mt-2 lg:mt-0 text-sm font-medium text-slate-500">
                        Status <span className="text-red-700">*</span>
                      </label>
                      <select
                        name="status5"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Promoted">Promoted</option>
                        <option value="Completed">Completed</option>
                        <option value="Not-Promoted">Not-Promoted</option>
                      </select>
                    </div>

                    {/* Fees 5 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees5"
                        value={student.fees5}
                        min="0"
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div> : null}

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              <button
                type="submit"
                className="w-full mt-3 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
              >
                Promote Student
              </button>
            </div >
          </form >
        </div >
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default Promote;