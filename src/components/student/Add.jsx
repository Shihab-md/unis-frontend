import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';
import { getInstitutesFromCache } from '../../utils/InstituteHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getDistrictStatesFromCache } from '../../utils/DistrictStateHelper';
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
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
      { value: "0", label: "0" },
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
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];
};

const Add = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(null);
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOADate, setSelectedDOADate] = useState(null);

  const [schools, setSchools] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [districtStates, setDistrictStates] = useState([]);

  const [fees1Val, setFees1Val] = useState("");
  const [fees2Val, setFees2Val] = useState("");
  const [fees3Val, setFees3Val] = useState("");
  const [fees4Val, setFees4Val] = useState("");
  const [fees5Val, setFees5Val] = useState("");
  const [fees6Val, setFees6Val] = useState("");

  const [acYear, setAcYear] = useState(null);

  const [showIslamicStudies, setShowIslamicStudies] = useState(false);
  const [showSchool, setShowSchool] = useState(false);
  const [showCollege, setShowCollege] = useState(false);
  const [showVocational, setShowVocational] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (checkAuth("studentAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const getSchoolsMap = async () => {
      const schools = await getSchoolsFromCache();
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  const activeAcademicYear = Array.isArray(academicYears)
    ? academicYears.find((item) => item.active === "Active")
    : null;

  useEffect(() => {
    setAcYear(activeAcademicYear?._id || "");
  }, [activeAcademicYear?._id]);

  useEffect(() => {
    const getAcademicYearsMap = async () => {
      const academicYears = await getAcademicYearsFromCache();
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
  }, []);

  useEffect(() => {
    const getDistrictStatesMap = async () => {
      const districtStates = await getDistrictStatesFromCache();
      setDistrictStates(districtStates);
    };
    getDistrictStatesMap();
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

  const hasRequiredValue = (value) => {
    return value !== undefined && value !== null && String(value).trim() !== "";
  };

  const hasSectionData = (values = []) => {
    return values.some((value) => hasRequiredValue(value));
  };

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
    setFormData((prev) => ({
      ...prev,
      instituteId4: "",
      courseId4: "",
      refNumber4: "",
      year4: "",
      fees4: "",
      discount4: "",
      status4: "",
    }));
    setFees4Val("");
  };

  const clearSchoolFields = () => {
    setFormData((prev) => ({
      ...prev,
      instituteId2: "",
      courseId2: "",
      refNumber2: "",
      year2: "",
      fees2: "",
      discount2: "",
      status2: "",
    }));
    setFees2Val("");
  };

  const clearCollegeFields = () => {
    setFormData((prev) => ({
      ...prev,
      instituteId3: "",
      courseId3: "",
      refNumber3: "",
      year3: "",
      fees3: "",
      discount3: "",
      status3: "",
    }));
    setFees3Val("");
  };

  const clearVocationalFields = () => {
    setFormData((prev) => ({
      ...prev,
      instituteId5: "",
      courseId5: "",
      refNumber5: "",
      year5: "",
      fees5: "",
      discount5: "",
      status5: "",
    }));
    setFees5Val("");
  };

  const handleIslamicCheckBox = async (event) => {
    const checked = event.target.checked;

    if (!checked) {
      const ok = await confirmClearSection("Islamic Home Science", [
        formData.instituteId4,
        formData.courseId4,
        formData.refNumber4,
        formData.year4,
        formData.fees4,
        fees4Val,
      ]);

      if (!ok) return;
      clearIslamicStudiesFields();
    }

    setShowIslamicStudies(checked);
  };

  const handleSchoolCheckBox = async (event) => {
    const checked = event.target.checked;

    if (!checked) {
      const ok = await confirmClearSection("School Education", [
        formData.instituteId2,
        formData.courseId2,
        formData.refNumber2,
        formData.year2,
        formData.fees2,
        fees2Val,
      ]);

      if (!ok) return;
      clearSchoolFields();
    }

    setShowSchool(checked);
  };

  const handleCollegeCheckBox = async (event) => {
    const checked = event.target.checked;

    if (!checked) {
      const ok = await confirmClearSection("College Education", [
        formData.instituteId3,
        formData.courseId3,
        formData.refNumber3,
        formData.year3,
        formData.fees3,
        fees3Val,
      ]);

      if (!ok) return;
      clearCollegeFields();
    }

    setShowCollege(checked);
  };

  const handleVocationalCheckBox = async (event) => {
    const checked = event.target.checked;

    if (!checked) {
      const ok = await confirmClearSection("Vocational Course", [
        formData.instituteId5,
        formData.courseId5,
        formData.refNumber5,
        formData.year5,
        formData.fees5,
        fees5Val,
      ]);

      if (!ok) return;
      clearVocationalFields();
    }

    setShowVocational(checked);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
      return;
    }

    if (name === "acYear") {
      setAcYear(value);
    }

    let nextFormData = {
      ...formData,
      [name]: value,
    };

    if (name === "courseId1") {
      const selectedCourse = getCourseById(courses, value);
      const nextFees1 = selectedCourse?.fees || "";
      setFees1Val(nextFees1);
      nextFormData.fees1 = nextFees1;

      const makthabOptions = getMakthabYearOptions(selectedCourse?.name);
      if (makthabOptions.length > 0) {
        nextFormData.year1 = String(makthabOptions[0].value);
      }
    } else if (name === "courseId2") {
      const selectedCourse = getCourseById(courses, value);
      const nextFees2 = selectedCourse?.fees || "";
      setFees2Val(nextFees2);
      nextFormData.fees2 = nextFees2;
    } else if (name === "courseId3") {
      const selectedCourse = getCourseById(courses, value);
      const nextFees3 = selectedCourse?.fees || "";
      setFees3Val(nextFees3);
      nextFormData.fees3 = nextFees3;
    } else if (name === "courseId4") {
      const selectedCourse = getCourseById(courses, value);
      const nextFees4 = selectedCourse?.fees || "";
      setFees4Val(nextFees4);
      nextFormData.fees4 = nextFees4;
    } else if (name === "courseId5") {
      const selectedCourse = getCourseById(courses, value);
      const nextFees5 = selectedCourse?.fees || "";
      setFees5Val(nextFees5);
      nextFormData.fees5 = nextFees5;
    } else if (name === "hostelFees") {
      setFees6Val(value);
    }

    if (name === "fees1") {
      setFees1Val(value);
      nextFormData.fees1 = value;
    } else if (name === "fees2") {
      setFees2Val(value);
      nextFormData.fees2 = value;
    } else if (name === "fees3") {
      setFees3Val(value);
      nextFormData.fees3 = value;
    } else if (name === "fees4") {
      setFees4Val(value);
      nextFormData.fees4 = value;
    } else if (name === "fees5") {
      setFees5Val(value);
      nextFormData.fees5 = value;
    }

    setFormData(nextFormData);
  };

  const validateOptionalCourses = () => {
    const validations = [
      {
        enabled: !!showIslamicStudies,
        section: "Islamic Home Science",
        fields: [
          { label: "Institute", value: formData.instituteId4 },
          { label: "Course", value: formData.courseId4 },
          { label: "Fees", value: hasRequiredValue(formData.fees4) ? formData.fees4 : fees4Val },
        ],
      },
      {
        enabled: !!showSchool,
        section: "School Education",
        fields: [
          { label: "Institute", value: formData.instituteId2 },
          { label: "Course", value: formData.courseId2 },
          { label: "Fees", value: hasRequiredValue(formData.fees2) ? formData.fees2 : fees2Val },
        ],
      },
      {
        enabled: !!showCollege,
        section: "College Education",
        fields: [
          { label: "Institute", value: formData.instituteId3 },
          { label: "Course", value: formData.courseId3 },
          { label: "Year", value: formData.year3 },
          { label: "Fees", value: hasRequiredValue(formData.fees3) ? formData.fees3 : fees3Val },
        ],
      },
      {
        enabled: !!showVocational,
        section: "Vocational Course",
        fields: [
          { label: "Institute", value: formData.instituteId5 },
          { label: "Course", value: formData.courseId5 },
          { label: "Fees", value: hasRequiredValue(formData.fees5) ? formData.fees5 : fees5Val },
        ],
      },
    ];

    for (const item of validations) {
      if (!item.enabled) continue;

      for (const field of item.fields) {
        if (!hasRequiredValue(field.value)) {
          showSwalAlert("Info!", `${item.section} - ${field.label} is required.`, "info");
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

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

    if (!validateOptionalCourses()) {
      setProcessing(false);
      return;
    }

    const formDataObj = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== "" && value !== null && value !== undefined) {
        formDataObj.append(key, value);
      }
    });

    try {
      formDataObj.append('dob', selectedDOBDate);
      formDataObj.append('doa', selectedDOADate);

      if (acYear) {
        formDataObj.delete('acYear');
        formDataObj.append('acYear', acYear);
      }

      formDataObj.append('schoolId', localStorage.getItem('schoolId'));

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      };

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

  const selectedCourse1 = getCourseById(courses, formData.courseId1);
  const makthabYearOptions = getMakthabYearOptions(selectedCourse1?.name);
  const isMakthabLevelCourse = makthabYearOptions.length > 0;

  return (
    <>
      <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-sm lg:text-xl font-semibold items-center justify-center">Enter Student Details</h2>
          <Link to="/dashboard/students" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="py-2 px-3 lg:px-5 border mt-5 mb-3 items-center justify-center shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-5">

              {/* School */}
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Niswan <span className="text-red-700">*</span>
                </label>
                <select
                  name="schoolId"
                  value={localStorage.getItem('schoolId')}
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
            </div>
            <div className="flex space-x-3 mb-5" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Student Name <span className="text-red-700">*</span>
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

            <div className="grid mt-2 grid-cols-1 md:grid-cols-4 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
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
                <label className="block text-sm font-medium text-slate-500">
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
                <label className="block text-sm font-medium text-slate-500">
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
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid mt-7 grid-cols-1 md:grid-cols-2 gap-5">
              {/* Identification Mark-1 */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
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
                <label className="block text-sm font-medium text-slate-500">
                  Identification Mark-2
                </label>
                <input
                  type="text"
                  name="idMark2"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
            </div>

            <div className="grid mt-2 grid-cols-1 md:grid-cols-1 gap-5">
              {/* About */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  More details about the Student
                </label>
                <input
                  type="text"
                  name="about"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid mt-2 grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />
              <div className="hidden lg:block flex space-x-3 mb-5" />

              {/* Father's Name */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
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
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Hostel Reference  */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Reference
                </label>
                <input
                  type="text"
                  name="hostelRefNumber"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Hostel Fees */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Monthly Fees
                </label>
                <input
                  type="number"
                  name="hostelFees"
                  value={fees6Val}
                  onChange={handleChange}
                  min="0"
                  onPaste={preventPasteNegative}
                  onKeyPress={preventMinus}
                  onKeyDown={handleKeyDown}
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

                <input type="hidden" name="acYear" value={acYear} />

                <select
                  value={acYear}
                  disabled
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100 text-slate-700"
                >
                  <option value={activeAcademicYear?._id || ""}>
                    {activeAcademicYear?.acYear || ""}
                  </option>
                </select>
              </div>
              <div className="hidden lg:block flex space-x-3 mb-5" />
            </div>

            <div className="grid mt-10 grid-cols-1 gap-5 mb-3">
              <ViewCard type="header" text="Deeniyath Education" />
            </div>

            <div className="grid mt-5 grid-cols-1 md:grid-cols-2 gap-5">
              {/* Institute 1 --------------------------------------------- */}
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Select Institute <span className="text-red-700">*</span>
                </label>
                <select
                  name="instituteId1"
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
                  value={formData.courseId1 || ""}
                  onChange={handleChange}
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
                  Reference Number
                </label>
                <input
                  type="text"
                  name="refNumber1"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Year1 */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Year / Grade <span className="text-red-700">*</span>
                  </label>

                  {isMakthabLevelCourse ? (
                    <select
                      name="year1"
                      value={formData.year1 || ""}
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      required
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
                      value={formData.year1 || ""}
                      onChange={handleChange}
                      min="1"
                      onPaste={preventPasteNegative}
                      onKeyPress={preventMinus}
                      onKeyDown={handleKeyDown}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      required
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
                    value={fees1Val}
                    disabled={true}
                    onChange={handleChange}
                    min="0"
                    onPaste={preventPasteNegative}
                    onKeyPress={preventMinus}
                    onKeyDown={handleKeyDown}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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

              {/* For Mobile display*/}
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

              {/* For Screen display*/}
              <div className="hidden lg:block">
                <div className="flex justify-center">
                  <div>
                    <input className="ml-5"
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
                    <input className="ml-5"
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
                    <input className="ml-5"
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
                    <input className="ml-5"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                    <label className="block md:mt-2 text-sm font-medium text-slate-500">
                      Select Course
                    </label>
                    <select
                      name="courseId4"
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className='md:col-span-1'>
                    <label className="block md:mt-2 text-sm font-medium text-slate-500">
                      Fees
                    </label>
                    <input
                      type="number"
                      name="fees4"
                      value={fees4Val}
                      disabled={true}
                      onChange={handleChange}
                      min="0"
                      onPaste={preventPasteNegative}
                      onKeyPress={preventMinus}
                      onKeyDown={handleKeyDown}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      required={!!showSchool}
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
                    <label className="block md:mt-2 text-sm font-medium text-slate-500">
                      Select Course
                    </label>
                    <select
                      name="courseId2"
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      required={!!showSchool}
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className='md:col-span-1'>
                    <label className="block md:mt-2 text-sm font-medium text-slate-500">
                      Fees
                    </label>
                    <input
                      type="number"
                      name="fees2"
                      value={fees2Val}
                      disabled={true}
                      min="0"
                      onChange={handleChange}
                      onPaste={preventPasteNegative}
                      onKeyPress={preventMinus}
                      onKeyDown={handleKeyDown}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      required={!!showSchool}
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                        onChange={handleChange}
                        min="1"
                        onPaste={preventPasteNegative}
                        onKeyPress={preventMinus}
                        onKeyDown={handleKeyDown}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-500">
                        Fees
                      </label>
                      <input
                        type="number"
                        name="fees3"
                        value={fees3Val}
                        disabled={true}
                        min="0"
                        onPaste={preventPasteNegative}
                        onKeyPress={preventMinus}
                        onKeyDown={handleKeyDown}
                        onChange={handleChange}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
                      onChange={handleChange}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className='md:col-span-1'>
                    <label className="block md:mt-2 text-sm font-medium text-slate-500">
                      Fees
                    </label>
                    <input
                      type="number"
                      name="fees5"
                      value={fees5Val}
                      disabled={true}
                      onChange={handleChange}
                      min="0"
                      onPaste={preventPasteNegative}
                      onKeyPress={preventMinus}
                      onKeyDown={handleKeyDown}
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
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
            Add Student
          </button>
        </form>
      </div>
    </>
  );
};

export default Add;