import React, { useEffect, useState } from "react";
import { getSchools } from "../../utils/SchoolHelper";
import { getAcademicYears } from '../../utils/AcademicYearHelper'
import { getInstitutes } from '../../utils/InstituteHelper'
import { getCourses } from '../../utils/CourseHelper'
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Edit = () => {
  const [student, setStudent] = useState({
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
    salary: "",
  });
  // const [departments, setDepartments] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [schools, setSchools] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);

  const [courseId1Val, setCourseId1Val] = useState("");
  const [courseId2Val, setCourseId2Val] = useState("");
  const [courseId3Val, setCourseId3Val] = useState("");
  const [courseId4Val, setCourseId4Val] = useState("");
  const [courseId5Val, setCourseId5Val] = useState("");

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

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/student/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (responnse.data.success) {
          const student = responnse.data.student;
          const academicResponse = await axios.get(
            `https://unis-server.vercel.app/api/student/${student._id}/${'777'}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const academic = academicResponse.data.academic;

          setCourseId1Val(academic.fees1);
          setCourseId2Val(academic.fees2);
          setCourseId3Val(academic.fees3);
          setCourseId4Val(academic.fees4);
          setCourseId5Val(academic.fees5);

          setStudent((prev) => ({
            ...prev,
            name: student.userId.name,
            schoolId: student.schoolId._id,
            rollNumber: student.rollNumber,
            doa: student.doa,
            dob: student.dob,
            gender: student.gender,
            maritalStatus: student.maritalStatus,
            bloodGroup: student.bloodGroup,
            idMark1: student.idMark1,
            idMark2: student.idMark2,

            fatherName: student.fatherName,
            fatherNumber: student.fatherNumber,
            fatherOccupation: student.fatherOccupation,
            motherName: student.motherName,
            motherNumber: student.motherNumber,
            motherOccupation: student.motherOccupation,
            guardianName: student.guardianName,
            guardianNumber: student.guardianNumber,
            guardianOccupation: student.guardianOccupation,
            guardianRelation: student.guardianRelation,
            address: student.address,
            district: student.district,

            acYear: academic.acYear,

            instituteId1: academic.instituteId1,
            courseId1: academic.courseId1,
            refNumber1: academic.refNumber1,
            // fees1: academic.fees1,
            discount1: academic.discount1,
            finalFees1: academic.finalFees1,
            paid1: academic.paid1,
            paidDate1: academic.paidDate1,
            balance1: academic.balance1,

            instituteId2: academic.instituteId2,
            courseId2: academic.courseId2,
            refNumber2: academic.refNumber2,
            //  fees2: academic.fees2,
            discount2: academic.discount2,
            finalFees2: academic.finalFees2,
            paid2: academic.paid2,
            paidDate2: academic.paidDate2,
            balance2: academic.balance2,

            instituteId3: academic.instituteId3,
            courseId3: academic.courseId3,
            refNumber3: academic.refNumber3,
            //  fees3: academic.fees3,
            discount3: academic.discount3,
            finalFees3: academic.finalFees3,
            paid3: academic.paid3,
            paidDate3: academic.paidDate3,
            balance3: academic.balance3,

            instituteId4: academic.instituteId4,
            courseId4: academic.courseId4,
            refNumber4: academic.refNumber4,
            //  fees4: academic.fees4,
            discount4: academic.discount4,
            finalFees4: academic.finalFees4,
            paid4: academic.paid4,
            paidDate4: academic.paidDate4,
            balance4: academic.balance4,

            instituteId5: academic.instituteId5,
            courseId5: academic.courseId5,
            refNumber5: academic.refNumber5,
            //  fees5: academic.fees5,
            discount5: academic.discount5,
            finalFees5: academic.finalFees5,
            paid5: academic.paid5,
            paidDate5: academic.paidDate5,
            balance5: academic.balance5,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchStudent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "courseId1") {
      setCourseId1Val(courses.filter(course => course._id === value).map(course => course.fees));
    } else if (name === "courseId2") {
      setCourseId2Val(courses.filter(course => course._id === value).map(course => course.fees));
    } else if (name === "courseId3") {
      setCourseId3Val(courses.filter(course => course._id === value).map(course => course.fees));
    } else if (name === "courseId4") {
      setCourseId4Val(courses.filter(course => course._id === value).map(course => course.fees));
    } else if (name === "courseId5") {
      setCourseId5Val(courses.filter(course => course._id === value).map(course => course.fees));
    }

    setStudent((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `https://unis-server.vercel.app/api/student/${id}`,
        student,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("Updated Successfully...");
        navigate("/admin-dashboard/students");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {student ? (
        <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Student Details</h2>
            <Link to="/admin-dashboard/students" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">

                {/* School */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Select Niswan <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="schoolId"
                    value={student.schoolId}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.rollNumber}
                    disabled={true}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.name}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={moment(new Date(student.doa)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //    placeholder="DOB"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={moment(new Date(student.dob)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //    placeholder="DOB"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.gender}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.maritalStatus}
                    onChange={handleChange}
                    placeholder="Marital Status"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.bloodGroup}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.idMark1}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.idMark2}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={student.fatherName}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.fatherNumber}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                {/* Father's Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Father's Occupation
                  </label>
                  <input
                    type="number"
                    name="fatherOccupation"
                    value={student.fatherOccupation}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.motherName}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.motherNumber}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Mother's Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mother's Occupation
                  </label>
                  <input
                    type="number"
                    name="motherOccupation"
                    value={student.motherOccupation}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.guardianName}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.guardianNumber}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Guardian's Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Father's Occupation
                  </label>
                  <input
                    type="number"
                    name="guardianOccupation"
                    value={student.guardianOccupation}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.guardianRelation}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.district}
                    onChange={handleChange}
                    //  placeholder="Route Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid mt-3 grid-cols-1 md:grid-cols-1 gap-4 ">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={student.address}
                    onChange={handleChange}
                    //  placeholder="Address"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />

                {/* Academic Year */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Select Academic Year <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="acYear"
                    value={student.acYear}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                <div className="flex space-x-3 mt-5 justify-center" >
                  <label className="block mt-2 text-sm font-bold text-blue-500">
                    *****   SELECT COURSE-1   *****
                  </label>
                </div>
                <div className="flex space-x-3 mb-5" />

                {/* Institute 1 --------------------------------------------- */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Select Institute <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="instituteId1"
                    value={student.instituteId1}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Institute</option>
                    {institutes.map((institute) => (
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
                    value={student.courseId1}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
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
                    value={student.refNumber1}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                      // value={student.fees1}
                      value={courseId1Val}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                      value={student.discount1}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Final Fees */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Final Fees
                    </label>
                    <input
                      type="number"
                      name="finalFees1"
                      value={student.finalFees1}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  {/* Paid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid
                    </label>
                    <input
                      type="number"
                      name="paid1"
                      value={student.paid1}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Paid Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid Date
                    </label>
                    <input
                      type="date"
                      name="paidDate1"
                      value={moment(new Date(student.paidDate1)).format("YYYY-MM-DD")}
                      onChange={handleChange}
                      //    placeholder="DOB"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  {/* Balance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Balance
                    </label>
                    <input
                      type="number"
                      name="balance1"
                      value={student.balance1}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mt-5 justify-center" >
                  <label className="block mt-2 text-sm font-bold text-blue-500">
                    *****   SELECT COURSE-2   *****
                  </label>
                </div>
                <div className="flex space-x-3 mb-5" />

                {/* Institute 2 --------------------------------------------- */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Select Institute
                  </label>
                  <select
                    name="instituteId2"
                    value={student.instituteId2}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  >
                    <option value="">Select Institute</option>
                    {institutes.map((institute) => (
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
                    value={student.courseId2}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reference Number-2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reference Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="refNumber2"
                    value={student.refNumber2}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //   required
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
                      // value={student.fees2}
                      value={courseId2Val}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                      value={student.discount2}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Final Fees 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Final Fees
                    </label>
                    <input
                      type="number"
                      name="finalFees2"
                      value={student.finalFees2}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  {/* Paid 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid
                    </label>
                    <input
                      type="number"
                      name="paid2"
                      value={student.paid2}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Paid Date 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid Date
                    </label>
                    <input
                      type="date"
                      name="paidDate2"
                      value={moment(new Date(student.paidDate2)).format("YYYY-MM-DD")}
                      onChange={handleChange}
                      //    placeholder="DOB"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  {/* Balance 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Balance
                    </label>
                    <input
                      type="number"
                      name="balance2"
                      value={student.balance2}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mt-5 justify-center" >
                  <label className="block mt-2 text-sm font-bold text-blue-500">
                    *****   SELECT COURSE-3   *****
                  </label>
                </div>
                <div className="flex space-x-3 mb-5" />

                {/* Institute 3 --------------------------------------------- */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Select Institute
                  </label>
                  <select
                    name="instituteId3"
                    value={student.instituteId3}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  >
                    <option value="">Select Institute</option>
                    {institutes.map((institute) => (
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
                    value={student.courseId3}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
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
                    value={student.refNumber3}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //   required
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
                      //value={student.fees3}
                      value={courseId3Val}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                      value={student.discount3}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Final Fees 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Final Fees
                    </label>
                    <input
                      type="number"
                      name="finalFees3"
                      value={student.finalFees3}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  {/* Paid 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid
                    </label>
                    <input
                      type="number"
                      name="paid3"
                      value={student.paid3}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Paid Date 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid Date
                    </label>
                    <input
                      type="date"
                      name="paidDate3"
                      value={moment(new Date(student.paidDate3)).format("YYYY-MM-DD")}
                      onChange={handleChange}
                      //    placeholder="DOB"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //     required
                    />
                  </div>

                  {/* Balance 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Balance
                    </label>
                    <input
                      type="number"
                      name="balance3"
                      value={student.balance3}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mt-5 justify-center" >
                  <label className="block mt-2 text-sm font-bold text-blue-500">
                    *****   SELECT COURSE-4   *****
                  </label>
                </div>
                <div className="flex space-x-3 mb-5" />

                {/* Institute 4 --------------------------------------------- */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Select Institute
                  </label>
                  <select
                    name="instituteId4"
                    value={student.instituteId4}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  >
                    <option value="">Select Institute</option>
                    {institutes.map((institute) => (
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
                    value={student.courseId4}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reference Number-4 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reference Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="refNumber4"
                    value={student.refNumber4}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
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
                      // value={student.fees4}
                      value={courseId4Val}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                      value={student.discount4}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Final Fees 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Final Fees
                    </label>
                    <input
                      type="number"
                      name="finalFees4"
                      value={student.finalFees4}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  {/* Paid 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid
                    </label>
                    <input
                      type="number"
                      name="paid4"
                      value={student.paid4}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Paid Date 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid Date
                    </label>
                    <input
                      type="date"
                      name="paidDate4"
                      value={moment(new Date(student.paidDate4)).format("YYYY-MM-DD")}
                      onChange={handleChange}
                      //    placeholder="DOB"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //     required
                    />
                  </div>

                  {/* Balance 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Balance
                    </label>
                    <input
                      type="number"
                      name="balance4"
                      value={student.balance4}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mt-5 justify-center" >
                  <label className="block mt-2 text-sm font-bold text-blue-500">
                    *****   SELECT COURSE-5   *****
                  </label>
                </div>
                <div className="flex space-x-3 mb-5" />

                {/* Institute 5 --------------------------------------------- */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Select Institute
                  </label>
                  <select
                    name="instituteId5"
                    value={student.instituteId5}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  >
                    <option value="">Select Institute</option>
                    {institutes.map((institute) => (
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
                    value={student.courseId5}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //   required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reference Number-5 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reference Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="refNumber5"
                    value={student.refNumber5}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
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
                      // value={student.fees5}
                      value={courseId5Val}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
                      value={student.discount5}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Final Fees 5 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Final Fees
                    </label>
                    <input
                      type="number"
                      name="finalFees5"
                      value={student.finalFees5}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  {/* Paid 5 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid
                    </label>
                    <input
                      type="number"
                      name="paid5"
                      value={student.paid5}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-7 justify-between">
                  {/* Paid Date 5 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paid Date
                    </label>
                    <input
                      type="date"
                      name="paidDate5"
                      value={moment(new Date(student.paidDate5)).format("YYYY-MM-DD")}
                      onChange={handleChange}
                      //    placeholder="DOB"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //     required
                    />
                  </div>

                  {/* Balance 5 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Balance
                    </label>
                    <input
                      type="number"
                      name="balance5"
                      value={student.balance5}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5" />

              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Student
            </button>
          </form>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default Edit;
