import React, { useEffect, useState } from "react";
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';
import { getInstitutesFromCache } from '../../utils/InstituteHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getDistrictStatesFromCache } from '../../utils/DistrictStateHelper';
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Edit = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();
  const [processing, setProcessing] = useState(null)
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOADate, setSelectedDOADate] = useState(null);

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
  const [districtStates, setDistrictStates] = useState([]);
  const [acYear, setAcYear] = useState(null);

  const [showIslamicStudies, setShowIslamicStudies] = useState(null)
  const [showSchool, setShowSchool] = useState(null)
  const [showCollege, setShowCollege] = useState(null)
  const [showVocational, setShowVocational] = useState(null)

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("studentEdit") === "NO") {
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
    const getAcYearMap = async (id) => {
      let accYear = (new Date().getFullYear() - 1) + "-" + new Date().getFullYear();
      if (new Date().getMonth() + 1 >= 4) {
        accYear = new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);
      }
      const academicYears = await getAcademicYearsFromCache(id);
      const acYear = academicYears?.filter(acYear => acYear.acYear === accYear).map(acYear => acYear._id);
      // console.log("AC Year : " + acYear)
      setAcYear(acYear);
    };
    getAcYearMap();
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
    const getDistrictStatesMap = async (id) => {
      const districtStates = await getDistrictStatesFromCache(id);
      setDistrictStates(districtStates);
    };
    getDistrictStatesMap();
  }, []);

  const handleIslamicCheckBox = (event) => {
    setShowIslamicStudies(event.target.checked);
  };
  const handleSchoolCheckBox = (event) => {
    setShowSchool(event.target.checked);
  };
  const handleCollegeCheckBox = (event) => {
    setShowCollege(event.target.checked);
  };
  const handleVocationalCheckBox = (event) => {
    setShowVocational(event.target.checked);
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `student/edit/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (responnse.data.success) {
          const student = responnse.data.student;
          const academics = student._academics;
          //  const academicResponse = await axios.get(
          //    (await getBaseUrl()).toString() + `student/${student._id}/${'777'}`,
          //    {
          //      headers: {
          //        Authorization: `Bearer ${localStorage.getItem("token")}`,
          //      },
          //    }
          //  );

          // const academic = academicResponse.data.academic;
          setSelectedDOBDate(student.dob);
          setSelectedDOADate(student.doa);

          try {
            if (academics && academics[0] && academics[0].instituteId2 && academics[0].instituteId2._id) {
              setShowSchool(true);
            }
            if (academics && academics[0] && academics[0].instituteId3 && academics[0]?.instituteId3._id) {
              setShowCollege(true);
            }
            if (academics && academics[0] && academics[0].instituteId4 && academics[0]?.instituteId4._id) {
              setShowIslamicStudies(true);
            }
            if (academics && academics[0] && academics[0].instituteId5 && academics[0]?.instituteId5._id) {
              setShowVocational(true);
            }
          } catch (error) {
            console.log(error)
          }

          setStudent((prev) => ({
            ...prev,
            name: student.userId && student.userId.name ? student.userId.name : "",
            schoolId: student.schoolId && student.schoolId._id ? student.schoolId._id : "",
            rollNumber: student.rollNumber,

            gender: student.gender,
            maritalStatus: student.maritalStatus,
            motherTongue: student.motherTongue,
            bloodGroup: student.bloodGroup,
            idMark1: student.idMark1,
            idMark2: student.idMark2,
            about: student.about,

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
            city: student.city,
            pincode: student.pincode,
            landmark: student.landmark,
            districtStateId: student.districtStateId && student.districtStateId?._id ? student.districtStateId?._id : null,

            active: student.active,
            remarks: student.remarks,

            hostel: student.hostel,
            hostelRefNumber: student.hostelRefNumber,
            hostelFees: student.hostelFees,
            hostelDiscount: student.hostelDiscount,

            acYear: academics && academics[0] && academics[0]?.acYear && academics[0]?.acYear?._id ? academics[0]?.acYear?._id : acYear,

            instituteId1: academics && academics[0]?.instituteId1 && academics[0]?.instituteId1?._id ? academics[0]?.instituteId1?._id : null,
            courseId1: academics && academics[0]?.courseId1 && academics[0]?.courseId1?._id ? academics[0]?.courseId1?._id : null,
            refNumber1: academics && academics[0]?.refNumber1,
            year1: academics && academics[0]?.year1,
            status1: academics && academics[0]?.status1,
            fees1: academics && academics[0]?.fees1,
            discount1: academics && academics[0]?.discount1,

            instituteId2: academics && academics[0]?.instituteId2 && academics[0]?.instituteId2?._id ? academics[0]?.instituteId2?._id : null,
            courseId2: academics && academics[0]?.courseId2 && academics[0]?.courseId2?._id ? academics[0]?.courseId2?._id : null,
            refNumber2: academics && academics[0]?.refNumber2,
            year2: academics && academics[0]?.year2,
            status2: academics && academics[0]?.status2,
            fees2: academics && academics[0]?.fees2,
            discount2: academics && academics[0]?.discount2,

            instituteId3: academics && academics[0]?.instituteId3 && academics[0]?.instituteId3?._id ? academics[0]?.instituteId3?._id : null,
            courseId3: academics && academics[0]?.courseId3 && academics[0]?.courseId3?._id ? academics[0]?.courseId3?._id : null,
            refNumber3: academics && academics[0]?.refNumber3,
            year3: academics && academics[0]?.year3,
            status3: academics && academics[0]?.status3,
            fees3: academics && academics[0]?.fees3,
            discount3: academics && academics[0]?.discount3,

            instituteId4: academics && academics[0]?.instituteId4 && academics[0]?.instituteId4?._id ? academics[0]?.instituteId4?._id : null,
            courseId4: academics && academics[0]?.courseId4 && academics[0]?.courseId4?._id ? academics[0]?.courseId4?._id : null,
            refNumber4: academics && academics[0]?.refNumber4,
            year4: academics && academics[0]?.year4,
            status4: academics && academics[0]?.status4,
            fees4: academics && academics[0]?.fees4,
            discount4: academics && academics[0]?.discount4,

            instituteId5: academics && academics[0]?.instituteId5 && academics[0]?.instituteId5?._id ? academics[0]?.instituteId5?._id : null,
            courseId5: academics && academics[0]?.courseId5 && academics[0]?.courseId5?._id ? academics[0]?.courseId5?._id : null,
            refNumber5: academics && academics[0]?.refNumber5,
            year5: academics && academics[0]?.year5,
            status5: academics && academics[0]?.status5,
            fees5: academics && academics[0]?.fees5,
            discount5: academics && academics[0]?.discount5,
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
      if (selectedDOBDate) {
        student.dob = selectedDOBDate;
      } else {
        student.dob = "";
      }
      if (selectedDOADate) {
        student.doa = selectedDOADate;
      } else {
        student.doa = "";
      }
      //  if (!student.acYear) {
      //    student.acYear = acYear;
      //  }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }
      const response = await axios.put(
        (await getBaseUrl()).toString() + `student/${id}`,
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
      {student ? (
        <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Student Details</h2>
            <Link to="/dashboard/students" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="py-2 px-3 lg:px-5 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-4 gap-5">

                {/* School */}
                <div className="lg:col-span-3 lg:mb-3">
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
                    <option value="">Select Niswan</option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.code + " : " + school.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="grid mt-5 grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Student Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={student.name}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Date of Admission */}
                  <div className="grid grid-cols-1">
                    <label className="block mt-2 text-sm font-medium text-slate-500">
                      Admission Date <span className="text-red-700">*</span>
                    </label>
                    <DatePicker
                      name="doa"
                      selected={selectedDOADate}
                      onChange={(date) => setSelectedDOADate(date)}
                      dateFormat="dd/MM/yyyy"
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                    <label className="block mt-2 text-sm font-medium text-slate-500">
                      Date of Birth <span className="text-red-700">*</span>
                    </label>
                    <DatePicker
                      name="dob"
                      selected={selectedDOBDate}
                      onChange={(date) => setSelectedDOBDate(date)}
                      dateFormat="dd/MM/yyyy"
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Active */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Status <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="active"
                    value={student.active}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="In-Active">In-Active</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                {/* Remarks */}
                <div className='col-span-2'>
                  <label className="block text-sm font-medium text-slate-500">
                    Reason for Status change
                  </label>
                  <input
                    type="text"
                    name="remarks"
                    value={student.remarks}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //   required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 gap-y-7">
                <div className="flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Gender <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="gender"
                    value={student.gender}
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
                  <label className="block text-sm font-medium text-slate-500">
                    Marital Status <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={student.maritalStatus}
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
                  <label className="block text-sm font-medium text-slate-500">
                    Mother Tongue
                  </label>
                  <select
                    name="motherTongue"
                    value={student.motherTongue}
                    onChange={handleChange}
                    placeholder="Mother Tongue"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  >
                    <option value=""></option>
                    <option value="Tamil">Tamil</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="English">English</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    name="bloodGroup"
                    value={student.bloodGroup}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>
              </div>

              <div className="grid mt-7 grid-cols-1 md:grid-cols-2 gap-5 gap-y-7">
                {/* Identification Mark-1 */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Identification Mark-1 <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="idMark1"
                    value={student.idMark1}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Identification Mark-2 */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Identification Mark-2
                  </label>
                  <input
                    type="text"
                    name="idMark2"
                    value={student.idMark2}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>
              </div>

              <div className="grid mt-12 grid-cols-1 md:grid-cols-1 gap-5">
                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    More details about the Student
                  </label>
                  <input
                    type="text"
                    name="about"
                    value={student.about}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                <div className="flex space-x-3 mb-7" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 gap-y-7">
                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={student.fatherName}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                {/* Father's Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Father's Number
                  </label>
                  <input
                    type="number"
                    name="fatherNumber"
                    value={student.fatherNumber}
                    onChange={handleChange}
                    min="0"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                {/* Father's Occupation */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Father's Occupation
                  </label>
                  <input
                    type="text"
                    name="fatherOccupation"
                    value={student.fatherOccupation}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={student.motherName}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Mother's Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Mother's Number
                  </label>
                  <input
                    type="number"
                    name="motherNumber"
                    value={student.motherNumber}
                    onChange={handleChange}
                    min="0"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Mother's Occupation */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Mother's Occupation
                  </label>
                  <input
                    type="text"
                    name="motherOccupation"
                    value={student.motherOccupation}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>
              </div>

              <div className="grid mt-7 grid-cols-1 md:grid-cols-4 gap-5">
                {/* Guardian's Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Guardian's Name
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={student.guardianName}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Guardian's Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Guardian's Number
                  </label>
                  <input
                    type="number"
                    name="guardianNumber"
                    value={student.guardianNumber}
                    onChange={handleChange}
                    min="0"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Guardian's Occupation */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Guardian's Occupation
                  </label>
                  <input
                    type="text"
                    name="guardianOccupation"
                    value={student.guardianOccupation}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>

                {/* Guardian's Relationship */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Guardian's Relationship
                  </label>
                  <input
                    type="text"
                    name="guardianRelation"
                    value={student.guardianRelation}
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
                  <label className="block text-sm font-medium text-slate-500">
                    Door No. & Street <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={student.address}
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
                    value={student.city}
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
                    value={student.landmark}
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
                    value={student.pincode}
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
                    Select District & State <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="districtStateId"
                    value={student.districtStateId}
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

              <div className="grid mt-5 grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />
                {/* Hostel */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Hostel Admission Required? <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="hostel"
                    onChange={handleChange}
                    value={student.hostel}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Hostel Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="hostelRefNumber"
                    onChange={handleChange}
                    value={student.hostelRefNumber}
                    //    placeholder="Qualification"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Hostel Fees */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Fees
                  </label>
                  <input
                    type="number"
                    name="hostelFees"
                    //  disabled={student.hostelFees ? true : false}
                    value={student.hostelFees}
                    min="0"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />

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
                    <option value=""></option>
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
                <div className="flex space-x-3 mb-5" />
                <div className="hidden lg:block flex space-x-3 mb-5" />
                <ViewCard type="header" text="Deeniyath Education" />
                <div className="hidden lg:block flex space-x-3 mb-5" />

                {/* Institute 1 --------------------------------------------- */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Select Institute <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="instituteId1"
                    value={student.instituteId1}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    {institutes.filter(institute => institute.type === "Deeniyath Education").map((institute) => (
                      <option key={institute._id} value={institute._id}>
                        {institute.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course 1 */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Select Course <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="courseId1"
                    value={student.courseId1}
                    onChange={handleChange}
                    //    disabled={true}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    {courses.filter(course => course.type === "Deeniyath Education").map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                    //    placeholder="Qualification"
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Year1 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-500">
                      Year / Std.<span className="text-red-700">*</span>
                    </label>
                    <input
                      type="number"
                      name="year1"
                      value={student.year1}
                      min="0"
                      //    disabled={student.year ? true : false}
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {/* Fees */}
                  <div>
                    <label className="block text-sm font-medium text-slate-500">
                      Fees
                    </label>
                    <input
                      type="number"
                      name="fees1"
                      value={student.fees1}
                      min="0"
                      //   value={fees1Val}
                      //  disabled={student.fees1 ? true : false}
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 mt-10 mb-4 p-2 lg:p-5 gap-5 pt-5 lg:ml-16 lg:mr-20 border-2 border-green-500 rounded-md shadow-lg">
                <div className="flex justify-center">
                  <label className='flex text-sm lg:text-md text-pink-600 ml-2 lg:ml-1 mr-2 lg:mr-1'>
                    If the student is studying below courses also with our Niswan, Please check the relevant checkboxes and fill the details.</label>
                </div>

                {/* For Mobile display*/}
                <div className='block lg:hidden'>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={showIslamicStudies}
                      onChange={handleIslamicCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> Islamic Home Science</span>
                  </div>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={showSchool}
                      onChange={handleSchoolCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> School Education</span>
                  </div>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={showCollege}
                      onChange={handleCollegeCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> College Education</span>
                  </div>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={showVocational}
                      onChange={handleVocationalCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> Vocational Course</span>
                  </div>
                </div>

                {/* For Screen display*/}
                <div className="hidden lg:block">
                  <div className="flex justify-center">
                    <div>
                      <input className="ml-5"
                        type="checkbox"
                        checked={showIslamicStudies}
                        onChange={handleIslamicCheckBox}
                        style={{ transform: "scale(1.25)" }}
                      />
                    </div>
                    <div>
                      <p className='text-sm lg:text-md text-blue-600 ml-2'> Islamic Home Science</p>
                    </div>

                    <div>
                      <input className="ml-5"
                        type="checkbox"
                        checked={showSchool}
                        onChange={handleSchoolCheckBox}
                        style={{ transform: "scale(1.25)" }}
                      />
                    </div>
                    <div>
                      <p className='text-sm lg:text-md text-blue-600 ml-2'> School Education</p>
                    </div>

                    <div>
                      <input className="ml-5"
                        type="checkbox"
                        checked={showCollege}
                        onChange={handleCollegeCheckBox}
                        style={{ transform: "scale(1.25)" }}
                      />
                    </div>
                    <div>
                      <p className='text-sm lg:text-md text-blue-600 ml-2'> College Education</p>
                    </div>

                    <div>
                      <input className="ml-5"
                        type="checkbox"
                        checked={showVocational}
                        onChange={handleVocationalCheckBox}
                        style={{ transform: "scale(1.25)" }}
                      />
                    </div>
                    <div>
                      <p className='text-sm lg:text-md text-blue-600 ml-2'> Vocational Course</p>
                    </div>
                  </div>
                </div>
              </div>

              {showIslamicStudies ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex space-x-3" />
                  <div className="hidden lg:block flex space-x-3" />
                  <ViewCard type="header" text="Islamic Home Science" />
                  <div className="hidden lg:block flex space-x-3 mb-5" />

                  {/* Institute 4 --------------------------------------------- */}
                  <div>
                    <label className="block mt-2 text-sm font-medium text-slate-500">
                      Select Institute
                    </label>
                    <select
                      name="instituteId4"
                      value={student.instituteId4}
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    >
                      <option value=""></option>
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
                      Select Course
                    </label>
                    <select
                      name="courseId4"
                      value={student.courseId4}
                      onChange={handleChange}
                      //   disabled={student.courseId4 ? true : false}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    >
                      <option value=""></option>
                      {courses.filter(course => course.type === "Islamic Home Science").map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      //    placeholder="Qualification"
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Year4 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Year
                      </label>
                      <input
                        type="number"
                        name="year4"
                        value={student.year4}
                        min="0"
                        //    disabled={student.year ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //  required
                      />
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
                        //  value={fees4Val}
                        //  disabled={student.fees4 ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //    required
                      />
                    </div>
                  </div>
                </div> : null}

              {showSchool ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
                  <div className="flex space-x-3" />
                  <div className="hidden lg:block flex space-x-3" />
                  <ViewCard type="header" text="School Education" />
                  <div className="hidden lg:block flex space-x-3 mb-5" />

                  {/* Institute 2 --------------------------------------------- */}
                  <div>
                    <label className="block mt-2 text-sm font-medium text-slate-500">
                      Select Institute
                    </label>
                    <select
                      name="instituteId2"
                      value={student.instituteId2}
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    >
                      <option value=""></option>
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
                      Select Course
                    </label>
                    <select
                      name="courseId2"
                      value={student.courseId2}
                      onChange={handleChange}
                      //    disabled={student.courseId2 ? true : false}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    >
                      <option value=""></option>
                      {courses.filter(course => course.type === "School Education").map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      //    placeholder="Qualification"
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //   required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Year2 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Std.
                      </label>
                      <input
                        type="number"
                        name="year2"
                        value={student.year2}
                        min="0"
                        disabled={true}
                        //    disabled={student.year ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //  required
                      />
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
                        //   value={fees2Val}
                        //    disabled={student.fees2 ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //    required
                      />
                    </div>
                  </div>
                </div> : null}

              {showCollege ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
                  <div className="flex space-x-3" />
                  <div className="hidden lg:block flex space-x-3" />
                  <ViewCard type="header" text="College Education" />
                  <div className="hidden lg:block flex space-x-3 mb-5" />

                  {/* Institute 3 --------------------------------------------- */}
                  <div>
                    <label className="block mt-2 text-sm font-medium text-slate-500">
                      Select Institute
                    </label>
                    <select
                      name="instituteId3"
                      value={student.instituteId3}
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    >
                      <option value=""></option>
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
                      Select Course
                    </label>
                    <select
                      name="courseId3"
                      value={student.courseId3}
                      onChange={handleChange}
                      //   disabled={student.courseId3 ? true : false}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    >
                      <option value=""></option>
                      {courses.filter(course => course.type === "College Education").map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      //    placeholder="Qualification"
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //   required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Year3 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Year
                      </label>
                      <input
                        type="number"
                        name="year3"
                        value={student.year3}
                        min="0"
                        //    disabled={student.year ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //  required
                      />
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
                        //  value={fees3Val}
                        //   disabled={student.fees3 ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //    required
                      />
                    </div>
                  </div>
                </div> : null}

              {showVocational ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
                  <div className="flex space-x-3" />
                  <div className="hidden lg:block flex space-x-3" />
                  <ViewCard type="header" text="Vocational Course" />
                  <div className="hidden lg:block flex space-x-3 mb-5" />

                  {/* Institute 5 --------------------------------------------- */}
                  <div>
                    <label className="block mt-2 text-sm font-medium text-slate-500">
                      Select Institute
                    </label>
                    <select
                      name="instituteId5"
                      value={student.instituteId5}
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    >
                      <option value=""></option>
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
                      Select Course
                    </label>
                    <select
                      name="courseId5"
                      value={student.courseId5}
                      onChange={handleChange}
                      //  disabled={student.courseId5 ? true : false}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //   required
                    >
                      <option value=""></option>
                      {courses.filter(course => course.type === "Vocational Courses").map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      //    placeholder="Qualification"
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Year5 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Year
                      </label>
                      <input
                        type="number"
                        name="year5"
                        value={student.year5}
                        min="0"
                        //    disabled={student.year ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //  required
                      />
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
                        //  value={fees5Val}
                        //  disabled={student.fees5 ? true : false}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      //    required
                      />
                    </div>
                  </div>
                </div> : null}

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Image Upload 
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Update Image
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  placeholder="Upload Image"
                  accept="image/*"
                  className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
                />
              </div>*/}
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
        getSpinner()
      )}
    </>
  );
};

export default Edit;
