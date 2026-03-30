import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';
import { getInstitutesFromCache } from '../../utils/InstituteHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getDistrictStatesFromCache } from '../../utils/DistrictStateHelper';
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth,
  getPrcessing, showSwalAlert
} from '../../utils/CommonHelper';
import ViewCard from "../dashboard/ViewCard";
import { FaRegTimesCircle } from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const getCourseById = (courses, courseId) => {
  return courses.find((course) => String(course._id) === String(courseId));
};

const getMakthabYearOptions = (courseName = "") => {
  const name = String(courseName || "").trim();

  if (name.includes("Makthab_Level1")) {
    return [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
    ];
  }

  if (name.includes("Makthab_Level2")) {
    return [
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
    ];
  }

  if (name.includes("Makthab_Level3")) {
    return [
      { value: "7", label: "7" },
      { value: "8", label: "8" },
      { value: "9", label: "9" },
    ];
  }

  if (name.includes("Makthab_Level4")) {
    return [
      { value: "10", label: "10" },
      { value: "11", label: "11" },
      { value: "12", label: "12" },
    ];
  }

  return [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];
};

const Edit = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [processing, setProcessing] = useState(null);
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

  const [fieldLocks, setFieldLocks] = useState({});
  const didInitLocks = useRef(false);

  const hasValue = (v) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    return s !== "" && s !== "null" && s !== "undefined";
  };

  const hasSectionData = (values = []) => {
    return values.some((value) => hasValue(value));
  };

  const buildLocksFromLoadedStudent = (s) => ({
    about: hasValue(s.about),

    instituteId1: hasValue(s.instituteId1),
    courseId1: hasValue(s.courseId1),
    refNumber1: hasValue(s.refNumber1),
    year1: hasValue(s.year1),
    fees1: hasValue(s.fees1),

    instituteId2: hasValue(s.instituteId2),
    courseId2: hasValue(s.courseId2),
    refNumber2: hasValue(s.refNumber2),
    year2: hasValue(s.year2),
    fees2: hasValue(s.fees2),

    instituteId3: hasValue(s.instituteId3),
    courseId3: hasValue(s.courseId3),
    refNumber3: hasValue(s.refNumber3),
    year3: hasValue(s.year3),
    fees3: hasValue(s.fees3),

    instituteId4: hasValue(s.instituteId4),
    courseId4: hasValue(s.courseId4),
    refNumber4: hasValue(s.refNumber4),
    year4: hasValue(s.year4),
    fees4: hasValue(s.fees4),

    instituteId5: hasValue(s.instituteId5),
    courseId5: hasValue(s.courseId5),
    refNumber5: hasValue(s.refNumber5),
    year5: hasValue(s.year5),
    fees5: hasValue(s.fees5),
  });

  const UNLOCKED_FIELDS = new Set(["superadmin", "hquser"]);

  const navigate = useNavigate();
  const { user } = useAuth();

  const isLocked = (name) => !UNLOCKED_FIELDS.has(user?.role) && fieldLocks?.[name] === true;

  const canModifySection = (fields = []) => {
    if (UNLOCKED_FIELDS.has(user?.role)) return true;
    return !fields.some((field) => fieldLocks?.[field] === true);
  };

  const { id } = useParams();
  const [schools, setSchools] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [districtStates, setDistrictStates] = useState([]);
  const [acYear, setAcYear] = useState(null);

  const [showIslamicStudies, setShowIslamicStudies] = useState(false);
  const [showSchool, setShowSchool] = useState(false);
  const [showCollege, setShowCollege] = useState(false);
  const [showVocational, setShowVocational] = useState(false);

  useEffect(() => {
    if (checkAuth("studentEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const getSchoolsMap = async () => {
      const schools = await getSchoolsFromCache();
      setSchools(schools);
    };
    getSchoolsMap();
  }, [navigate]);

  useEffect(() => {
    const getAcademicYearsMap = async () => {
      const academicYears = await getAcademicYearsFromCache();
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
  }, []);

  useEffect(() => {
    const getAcYearMap = async () => {
      let accYear = (new Date().getFullYear() - 1) + "-" + new Date().getFullYear();
      if (new Date().getMonth() + 1 >= 4) {
        accYear = new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);
      }
      const academicYears = await getAcademicYearsFromCache();
      const acYear = academicYears?.filter((item) => item.acYear === accYear).map((item) => item._id);
      setAcYear(acYear);
    };
    getAcYearMap();
  }, []);

  useEffect(() => {
    const getInstitutesMap = async () => {
      const institutes = await getInstitutesFromCache();
      setInstitutes(institutes);
    };
    getInstitutesMap();
  }, []);

  useEffect(() => {
    const getCoursesMap = async () => {
      const courses = await getCoursesFromCache();
      setCourses(courses);
    };
    getCoursesMap();
  }, []);

  useEffect(() => {
    const getDistrictStatesMap = async () => {
      const districtStates = await getDistrictStatesFromCache();
      setDistrictStates(districtStates);
    };
    getDistrictStatesMap();
  }, []);

  const confirmClearSection = async (sectionName, values = []) => {
    if (!hasSectionData(values)) return true;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Remove ${sectionName} details? All entered values in this section will be cleared.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear",
      cancelButtonText: "No",
      reverseButtons: true,
      focusCancel: true,
    });

    return result.isConfirmed;
  };

  const clearIslamicStudiesFields = () => {
    setStudent((prev) => ({
      ...prev,
      instituteId4: "",
      courseId4: "",
      refNumber4: "",
      year4: "",
      status4: "",
      fees4: "",
      discount4: "",
    }));
  };

  const clearSchoolFields = () => {
    setStudent((prev) => ({
      ...prev,
      instituteId2: "",
      courseId2: "",
      refNumber2: "",
      year2: "",
      status2: "",
      fees2: "",
      discount2: "",
    }));
  };

  const clearCollegeFields = () => {
    setStudent((prev) => ({
      ...prev,
      instituteId3: "",
      courseId3: "",
      refNumber3: "",
      year3: "",
      status3: "",
      fees3: "",
      discount3: "",
    }));
  };

  const clearVocationalFields = () => {
    setStudent((prev) => ({
      ...prev,
      instituteId5: "",
      courseId5: "",
      refNumber5: "",
      year5: "",
      status5: "",
      fees5: "",
      discount5: "",
    }));
  };

  const handleIslamicCheckBox = async (event) => {
    const checked = event.target.checked;
    const sectionFields = ["instituteId4", "courseId4", "refNumber4", "year4", "fees4"];

    if (!checked) {
      if (!canModifySection(sectionFields)) {
        showSwalAlert("Info!", "You are not allowed to remove existing Islamic Home Science details.", "info");
        return;
      }

      const ok = await confirmClearSection("Islamic Home Science", [
        student.instituteId4,
        student.courseId4,
        student.refNumber4,
        student.year4,
        student.fees4,
      ]);

      if (!ok) return;
      clearIslamicStudiesFields();
    }

    setShowIslamicStudies(checked);
  };

  const handleSchoolCheckBox = async (event) => {
    const checked = event.target.checked;
    const sectionFields = ["instituteId2", "courseId2", "refNumber2", "year2", "fees2"];

    if (!checked) {
      if (!canModifySection(sectionFields)) {
        showSwalAlert("Info!", "You are not allowed to remove existing School Education details.", "info");
        return;
      }

      const ok = await confirmClearSection("School Education", [
        student.instituteId2,
        student.courseId2,
        student.refNumber2,
        student.year2,
        student.fees2,
      ]);

      if (!ok) return;
      clearSchoolFields();
    }

    setShowSchool(checked);
  };

  const handleCollegeCheckBox = async (event) => {
    const checked = event.target.checked;
    const sectionFields = ["instituteId3", "courseId3", "refNumber3", "year3", "fees3"];

    if (!checked) {
      if (!canModifySection(sectionFields)) {
        showSwalAlert("Info!", "You are not allowed to remove existing College Education details.", "info");
        return;
      }

      const ok = await confirmClearSection("College Education", [
        student.instituteId3,
        student.courseId3,
        student.refNumber3,
        student.year3,
        student.fees3,
      ]);

      if (!ok) return;
      clearCollegeFields();
    }

    setShowCollege(checked);
  };

  const handleVocationalCheckBox = async (event) => {
    const checked = event.target.checked;
    const sectionFields = ["instituteId5", "courseId5", "refNumber5", "year5", "fees5"];

    if (!checked) {
      if (!canModifySection(sectionFields)) {
        showSwalAlert("Info!", "You are not allowed to remove existing Vocational Course details.", "info");
        return;
      }

      const ok = await confirmClearSection("Vocational Course", [
        student.instituteId5,
        student.courseId5,
        student.refNumber5,
        student.year5,
        student.fees5,
      ]);

      if (!ok) return;
      clearVocationalFields();
    }

    setShowVocational(checked);
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          (await getBaseUrl()).toString() + `student/edit/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          const studentData = response.data.student;
          const academics = studentData._academics;

          setSelectedDOBDate(studentData.dob ? new Date(studentData.dob) : null);
          setSelectedDOADate(studentData.doa ? new Date(studentData.doa) : null);

          try {
            if (academics?.[0]?.instituteId2?._id) setShowSchool(true);
            if (academics?.[0]?.instituteId3?._id) setShowCollege(true);
            if (academics?.[0]?.instituteId4?._id) setShowIslamicStudies(true);
            if (academics?.[0]?.instituteId5?._id) setShowVocational(true);
          } catch (error) {
            console.log(error);
          }

          const loaded = {
            name: studentData.userId?.name || "",
            schoolId: studentData.schoolId?._id || "",
            rollNumber: studentData.rollNumber || "",

            gender: studentData.gender || "",
            maritalStatus: studentData.maritalStatus || "",
            motherTongue: studentData.motherTongue || "",
            bloodGroup: studentData.bloodGroup || "",
            idMark1: studentData.idMark1 || "",
            idMark2: studentData.idMark2 || "",
            about: studentData.about || "",

            fatherName: studentData.fatherName || "",
            fatherNumber: studentData.fatherNumber || "",
            fatherOccupation: studentData.fatherOccupation || "",
            motherName: studentData.motherName || "",
            motherNumber: studentData.motherNumber || "",
            motherOccupation: studentData.motherOccupation || "",
            guardianName: studentData.guardianName || "",
            guardianNumber: studentData.guardianNumber || "",
            guardianOccupation: studentData.guardianOccupation || "",
            guardianRelation: studentData.guardianRelation || "",

            address: studentData.address || "",
            city: studentData.city || "",
            pincode: studentData.pincode || "",
            landmark: studentData.landmark || "",
            districtStateId: studentData.districtStateId?._id || "",

            active: studentData.active || "",
            remarks: studentData.remarks || "",

            hostel: studentData.hostel || "",
            hostelRefNumber: studentData.hostelRefNumber || "",
            hostelFees: studentData.hostelFees || "",
            hostelDiscount: studentData.hostelDiscount || "",

            acYear: academics?.[0]?.acYear?._id ? academics[0].acYear._id : acYear,

            instituteId1: academics?.[0]?.instituteId1?._id || "",
            courseId1: academics?.[0]?.courseId1?._id || "",
            refNumber1: academics?.[0]?.refNumber1 || "",
            year1: academics?.[0]?.year1 ? String(academics[0].year1) : "",
            status1: academics?.[0]?.status1 || "",
            fees1: academics?.[0]?.fees1 || "",
            discount1: academics?.[0]?.discount1 || "",

            instituteId2: academics?.[0]?.instituteId2?._id || "",
            courseId2: academics?.[0]?.courseId2?._id || "",
            refNumber2: academics?.[0]?.refNumber2 || "",
            year2: academics?.[0]?.year2 || "",
            status2: academics?.[0]?.status2 || "",
            fees2: academics?.[0]?.fees2 || "",
            discount2: academics?.[0]?.discount2 || "",

            instituteId3: academics?.[0]?.instituteId3?._id || "",
            courseId3: academics?.[0]?.courseId3?._id || "",
            refNumber3: academics?.[0]?.refNumber3 || "",
            year3: academics?.[0]?.year3 || "",
            status3: academics?.[0]?.status3 || "",
            fees3: academics?.[0]?.fees3 || "",
            discount3: academics?.[0]?.discount3 || "",

            instituteId4: academics?.[0]?.instituteId4?._id || "",
            courseId4: academics?.[0]?.courseId4?._id || "",
            refNumber4: academics?.[0]?.refNumber4 || "",
            year4: academics?.[0]?.year4 || "",
            status4: academics?.[0]?.status4 || "",
            fees4: academics?.[0]?.fees4 || "",
            discount4: academics?.[0]?.discount4 || "",

            instituteId5: academics?.[0]?.instituteId5?._id || "",
            courseId5: academics?.[0]?.courseId5?._id || "",
            refNumber5: academics?.[0]?.refNumber5 || "",
            year5: academics?.[0]?.year5 || "",
            status5: academics?.[0]?.status5 || "",
            fees5: academics?.[0]?.fees5 || "",
            discount5: academics?.[0]?.discount5 || "",
          };

          setStudent((prev) => ({ ...prev, ...loaded }));

          if (!didInitLocks.current) {
            setFieldLocks(buildLocksFromLoadedStudent(loaded));
            didInitLocks.current = true;
          }
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/students/");
        }
      }
    };

    fetchStudent();
  }, [id, navigate, acYear]);

  const COURSE_FEE_FIELD_MAP = {
    courseId1: "fees1",
    courseId2: "fees2",
    courseId3: "fees3",
    courseId4: "fees4",
    courseId5: "fees5",
  };

  const getCourseFeeValue = (courseId) => {
    if (!courseId) return "";

    const selectedCourse = courses.find(
      (course) => String(course._id) === String(courseId)
    );

    return selectedCourse?.fees ?? "";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setStudent((prevData) => ({ ...prevData, [name]: files[0] }));
      return;
    }

    if (COURSE_FEE_FIELD_MAP[name]) {
      const feesField = COURSE_FEE_FIELD_MAP[name];
      const autoFee = getCourseFeeValue(value);

      if (name === "courseId1") {
        const selectedCourse = getCourseById(courses, value);
        const makthabOptions = getMakthabYearOptions(selectedCourse?.name);

        setStudent((prevData) => ({
          ...prevData,
          [name]: value,
          [feesField]: autoFee,
          year1:
            makthabOptions.length > 0
              ? String(makthabOptions[0].value)
              : prevData.year1,
        }));
        return;
      }

      setStudent((prevData) => ({
        ...prevData,
        [name]: value,
        [feesField]: autoFee,
      }));
      return;
    }

    setStudent((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const selectedCourse1 = getCourseById(courses, student?.courseId1);
  const makthabYearOptions = getMakthabYearOptions(selectedCourse1?.name);
  const isMakthabLevelCourse = makthabYearOptions.length > 0;

  useEffect(() => {
    if (!isMakthabLevelCourse) return;
    if (isLocked("year1")) return;

    const allowedValues = makthabYearOptions.map((item) => String(item.value));
    const currentValue = String(student?.year1 || "");

    if (!allowedValues.includes(currentValue)) {
      setStudent((prev) => ({
        ...prev,
        year1: String(makthabYearOptions[0]?.value || ""),
      }));
    }
  }, [student?.courseId1, courses.length]);

  const validateOptionalCourses = (payload) => {
    const validations = [
      {
        enabled: !!showIslamicStudies,
        section: "Islamic Home Science",
        fields: [
          { label: "Institute", value: payload.instituteId4 },
          { label: "Course", value: payload.courseId4 },
          { label: "Fees", value: payload.fees4 },
        ],
      },
      {
        enabled: !!showSchool,
        section: "School Education",
        fields: [
          { label: "Institute", value: payload.instituteId2 },
          { label: "Course", value: payload.courseId2 },
          { label: "Fees", value: payload.fees2 },
        ],
      },
      {
        enabled: !!showCollege,
        section: "College Education",
        fields: [
          { label: "Institute", value: payload.instituteId3 },
          { label: "Course", value: payload.courseId3 },
          { label: "Year", value: payload.year3 },
          { label: "Fees", value: payload.fees3 },
        ],
      },
      {
        enabled: !!showVocational,
        section: "Vocational Course",
        fields: [
          { label: "Institute", value: payload.instituteId5 },
          { label: "Course", value: payload.courseId5 },
          { label: "Fees", value: payload.fees5 },
        ],
      },
    ];

    for (const item of validations) {
      if (!item.enabled) continue;

      for (const field of item.fields) {
        if (!hasValue(field.value)) {
          showSwalAlert("Info!", `${item.section} - ${field.label} is required.`, "info");
          return false;
        }
      }
    }

    return true;
  };

  const normalizeEmptyOptionalCourseFields = (payload) => {
    const toNull = (value) => (value === "" ? null : value);

    return {
      ...payload,

      instituteId2: toNull(payload.instituteId2),
      courseId2: toNull(payload.courseId2),
      refNumber2: toNull(payload.refNumber2),
      year2: toNull(payload.year2),
      fees2: toNull(payload.fees2),
      discount2: toNull(payload.discount2),
      status2: toNull(payload.status2),

      instituteId3: toNull(payload.instituteId3),
      courseId3: toNull(payload.courseId3),
      refNumber3: toNull(payload.refNumber3),
      year3: toNull(payload.year3),
      fees3: toNull(payload.fees3),
      discount3: toNull(payload.discount3),
      status3: toNull(payload.status3),

      instituteId4: toNull(payload.instituteId4),
      courseId4: toNull(payload.courseId4),
      refNumber4: toNull(payload.refNumber4),
      year4: toNull(payload.year4),
      fees4: toNull(payload.fees4),
      discount4: toNull(payload.discount4),
      status4: toNull(payload.status4),

      instituteId5: toNull(payload.instituteId5),
      courseId5: toNull(payload.courseId5),
      refNumber5: toNull(payload.refNumber5),
      year5: toNull(payload.year5),
      fees5: toNull(payload.fees5),
      discount5: toNull(payload.discount5),
      status5: toNull(payload.status5),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (!selectedDOADate) {
        setProcessing(false);
        showSwalAlert("Info!", "Admission Date is required.", "info");
        return;
      }

      if (!selectedDOBDate) {
        setProcessing(false);
        showSwalAlert("Info!", "Date of Birth is required.", "info");
        return;
      }

      let payload = {
        ...student,
        dob: selectedDOBDate || "",
        doa: selectedDOADate || "",
      };

      if (!validateOptionalCourses(payload)) {
        setProcessing(false);
        return;
      }

      payload = normalizeEmptyOptionalCourseFields(payload);

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      };

      const response = await axios.put(
        (await getBaseUrl()).toString() + `student/${id}`,
        payload,
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
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <>
      {student ? (
        <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-sm lg:text-xl font-semibold items-center justify-center">Update Student Details</h2>
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
                    <option value=""></option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.code + " : " + school.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Roll Number */}
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
                    <option value=""></option>
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
                    disabled={isLocked("about")}
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
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                    value={student.hostelFees}
                    min="0"
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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

              <div className="grid mt-10 grid-cols-1 gap-5 mb-3">
                <ViewCard type="header" text="Deeniyath Education" />
              </div>

              <div className="grid mt-5 grid-cols-1 md:grid-cols-2 gap-5">
                {/* Institute 1 */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Select Institute <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="instituteId1"
                    value={student?.instituteId1 || ""}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    disabled={isLocked("instituteId1")}
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
                    value={student?.courseId1 || ""}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    disabled={isLocked("courseId1")}
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
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="refNumber1"
                    value={student.refNumber1}
                    onChange={handleChange}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    disabled={isLocked("refNumber1")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Year1 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-500">
                      Year / Grade<span className="text-red-700">*</span>
                    </label>

                    {isMakthabLevelCourse ? (
                      <select
                        name="year1"
                        value={student?.year1 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                        disabled={isLocked("year1")}
                      >
                        <option value=""></option>
                        {makthabYearOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        name="year1"
                        value={student?.year1 || ""}
                        min="0"
                        onChange={handleChange}
                        onPaste={preventPasteNegative}
                        onKeyPress={preventMinus}
                        onKeyDown={handleKeyDown}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        required
                        disabled={isLocked("year1")}
                      />
                    )}
                  </div>

                  {/* Fees1 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-500">
                      Fees
                    </label>
                    <input
                      type="number"
                      name="fees1"
                      value={student?.fees1 || ""}
                      min="0"
                      onChange={handleChange}
                      onPaste={preventPasteNegative}
                      onKeyPress={preventMinus}
                      onKeyDown={handleKeyDown}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100 cursor-not-allowed"
                      disabled
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 mt-14 mb-4 p-2 lg:p-5 gap-5 pt-5 lg:ml-16 lg:mr-20 border-2 border-green-500 rounded-md shadow-lg">
                <div className="flex justify-center">
                  <label className='flex text-sm lg:text-md text-pink-600 ml-2 lg:ml-1 mr-2 lg:mr-1'>
                    If the student is studying / planning to study below courses also with our Niswan, Please check the relevant checkboxes and fill the details.
                  </label>
                </div>

                {/* Mobile */}
                <div className='block lg:hidden'>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={!!showIslamicStudies}
                      onChange={handleIslamicCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> Islamic Home Science</span>
                  </div>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={!!showSchool}
                      onChange={handleSchoolCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> School Education</span>
                  </div>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={!!showCollege}
                      onChange={handleCollegeCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> College Education</span>
                  </div>
                  <div className="ml-14 justify-center items-center mb-3">
                    <input
                      type="checkbox"
                      checked={!!showVocational}
                      onChange={handleVocationalCheckBox}
                      style={{ transform: "scale(1.25)" }}
                    />
                    <span className='text-sm lg:text-md text-blue-600 ml-2'> Vocational Course</span>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden lg:block">
                  <div className="flex justify-center">
                    <div>
                      <input
                        className="ml-5"
                        type="checkbox"
                        checked={!!showIslamicStudies}
                        onChange={handleIslamicCheckBox}
                        style={{ transform: "scale(1.25)" }}
                      />
                    </div>
                    <div>
                      <p className='text-sm lg:text-md text-blue-600 ml-2'> Islamic Home Science</p>
                    </div>

                    <div>
                      <input
                        className="ml-5"
                        type="checkbox"
                        checked={!!showSchool}
                        onChange={handleSchoolCheckBox}
                        style={{ transform: "scale(1.25)" }}
                      />
                    </div>
                    <div>
                      <p className='text-sm lg:text-md text-blue-600 ml-2'> School Education</p>
                    </div>

                    <div>
                      <input
                        className="ml-5"
                        type="checkbox"
                        checked={!!showCollege}
                        onChange={handleCollegeCheckBox}
                        style={{ transform: "scale(1.25)" }}
                      />
                    </div>
                    <div>
                      <p className='text-sm lg:text-md text-blue-600 ml-2'> College Education</p>
                    </div>

                    <div>
                      <input
                        className="ml-5"
                        type="checkbox"
                        checked={!!showVocational}
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
                <div className="grid mt-3">
                  <div className="grid mt-10 grid-cols-1 gap-5">
                    <ViewCard type="header" text="Islamic Home Science" />
                  </div>

                  <div className="grid mt-5 grid-cols-1 md:grid-cols-10 gap-5 mt-2">
                    <div className='md:col-span-3'>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Institute
                      </label>
                      <select
                        name="instituteId4"
                        value={student?.instituteId4 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("instituteId4")}
                      >
                        <option value=""></option>
                        {institutes.filter(institute => institute.type === "Islamic Home Science").map((institute) => (
                          <option key={institute._id} value={institute._id}>
                            {institute.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='md:col-span-4'>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Course
                      </label>
                      <select
                        name="courseId4"
                        value={student?.courseId4 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("courseId4")}
                      >
                        <option value=""></option>
                        {courses.filter(course => course.type === "Islamic Home Science").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='md:col-span-2'>
                      <label className="block md:mt-2 text-sm font-medium text-slate-500">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        name="refNumber4"
                        value={student.refNumber4}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("refNumber4")}
                      />
                    </div>

                    <div className='md:col-span-1'>
                      <label className="block md:mt-2 text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees4"
                        value={student?.fees4 || ""}
                        min="0"
                        onPaste={preventPasteNegative}
                        onKeyPress={preventMinus}
                        onKeyDown={handleKeyDown}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100 cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div> : null}

              {showSchool ?
                <div className="grid mt-3">
                  <div className="grid mt-10 grid-cols-1 gap-5 mb-5">
                    <ViewCard type="header" text="School Education" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-10 gap-5 mt-2">
                    <div className='md:col-span-4'>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Institute
                      </label>
                      <select
                        name="instituteId2"
                        value={student?.instituteId2 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("instituteId2")}
                      >
                        <option value=""></option>
                        {institutes.filter(institute => institute.type === "School Education").map((institute) => (
                          <option key={institute._id} value={institute._id}>
                            {institute.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='md:col-span-3'>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Course
                      </label>
                      <select
                        name="courseId2"
                        value={student?.courseId2 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("courseId2")}
                      >
                        <option value=""></option>
                        {courses.filter(course => course.type === "School Education").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='md:col-span-2'>
                      <label className="block md:mt-2 text-sm font-medium text-slate-500">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        name="refNumber2"
                        value={student.refNumber2}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("refNumber2")}
                      />
                    </div>

                    <div className='md:col-span-1'>
                      <label className="block md:mt-2 text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees2"
                        value={student?.fees2 || ""}
                        min="0"
                        onPaste={preventPasteNegative}
                        onKeyPress={preventMinus}
                        onKeyDown={handleKeyDown}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100 cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div> : null}

              {showCollege ?
                <div className="grid mt-3">
                  <div className="grid mt-10 grid-cols-1 gap-5 mb-3">
                    <ViewCard type="header" text="College Education" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Institute
                      </label>
                      <select
                        name="instituteId3"
                        value={student?.instituteId3 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("instituteId3")}
                      >
                        <option value=""></option>
                        {institutes.filter(institute => institute.type === "College Education").map((institute) => (
                          <option key={institute._id} value={institute._id}>
                            {institute.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Course
                      </label>
                      <select
                        name="courseId3"
                        value={student?.courseId3 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("courseId3")}
                      >
                        <option value=""></option>
                        {courses.filter(course => course.type === "College Education").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

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
                        disabled={isLocked("refNumber3")}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-500">
                          Year
                        </label>
                        <input
                          type="number"
                          name="year3"
                          value={student?.year3 || ""}
                          min="1"
                          onChange={handleChange}
                          onPaste={preventPasteNegative}
                          onKeyPress={preventMinus}
                          onKeyDown={handleKeyDown}
                          className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                          disabled={isLocked("year3")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-500">
                          Fees
                        </label>
                        <input
                          type="number"
                          name="fees3"
                          value={student?.fees3 || ""}
                          min="0"
                          onPaste={preventPasteNegative}
                          onKeyPress={preventMinus}
                          onKeyDown={handleKeyDown}
                          className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100 cursor-not-allowed"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div> : null}

              {showVocational ?
                <div className="grid mt-3">
                  <div className="grid mt-10 grid-cols-1 gap-5 mb-5">
                    <ViewCard type="header" text="Vocational Course" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-10 gap-5 mt-2">
                    <div className='md:col-span-3'>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Institute
                      </label>
                      <select
                        name="instituteId5"
                        value={student?.instituteId5 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("instituteId5")}
                      >
                        <option value=""></option>
                        {institutes.filter(institute => institute.type === "Vocational Courses").map((institute) => (
                          <option key={institute._id} value={institute._id}>
                            {institute.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='md:col-span-4'>
                      <label className="block mt-2 text-sm font-medium text-slate-500">
                        Select Course
                      </label>
                      <select
                        name="courseId5"
                        value={student?.courseId5 || ""}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("courseId5")}
                      >
                        <option value=""></option>
                        {courses.filter(course => course.type === "Vocational Courses").map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='md:col-span-2'>
                      <label className="block md:mt-2 text-sm font-medium text-slate-500">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        name="refNumber5"
                        value={student.refNumber5}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                        disabled={isLocked("refNumber5")}
                      />
                    </div>

                    <div className='md:col-span-1'>
                      <label className="block md:mt-2 text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees5"
                        value={student?.fees5 || ""}
                        min="0"
                        onPaste={preventPasteNegative}
                        onKeyPress={preventMinus}
                        onKeyDown={handleKeyDown}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100 cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div> : null}

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
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