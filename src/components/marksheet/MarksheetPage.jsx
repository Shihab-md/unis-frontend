import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaArrowAltCircleLeft, FaCommentDots, FaDownload, FaEdit, FaPrint, FaSave, FaSearch } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import {
  checkAuth,
  getPrcessing,
  getSpinner,
  handleRightClickAndFullScreen,
  showSwalAlert,
} from "../../utils/CommonHelper";
import {
  fetchConsolidatedMarksheet,
  fetchConsolidatedStudents,
  fetchMarksheetEntryStudents,
  fetchMarksheetExam,
  fetchMarksheetExams,
  fetchMarksheetOptions,
  printConsolidatedMarksheetPdf,
  printMarksheetExamPdf,
  saveBulkMarksheet,
} from "../../api/marksheetApi";

const clean = (value) => (value === undefined || value === null ? "" : String(value).trim());
const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeConduct = (value) => clean(value).toLowerCase().replace(/\s+/g, " ");
const getDisplayGrade = (grade, result) => (clean(result) === "Fail" ? "F" : clean(grade));

const getOfficialPdfStatus = (exam = {}) => {
  if (clean(exam.status) !== "Finalized") {
    return { label: "-", className: "bg-slate-50 text-slate-400", title: "Official PDF starts after finalization." };
  }

  const pdf = exam.marksheetPdf || {};
  const status = clean(pdf.status) || "Pending";
  if (status === "Generated") {
    const generatedCount = Number(pdf.individualGeneratedCount || 0);
    const totalStudents = Number(pdf.totalStudents || exam.totalStudents || 0);
    return {
      label: totalStudents > 0 ? `Generated ${generatedCount}/${totalStudents}` : "Generated",
      className: "bg-emerald-50 text-emerald-700",
      title: pdf.generatedAt ? `Generated: ${new Date(pdf.generatedAt).toLocaleString()}` : "Official marksheet PDFs generated.",
    };
  }
  if (status === "Generating") {
    return { label: "Generating", className: "bg-violet-50 text-violet-700", title: "Official marksheet PDF generation is in progress." };
  }
  if (status === "Failed") {
    return { label: "Failed", className: "bg-rose-50 text-rose-700", title: clean(pdf.lastError) || "Official marksheet PDF generation failed." };
  }

  return pdf.templateReady
    ? { label: "Pending Generation", className: "bg-blue-50 text-blue-700", title: "Normal marksheet template is available; official generation is pending." }
    : { label: "Pending Template", className: "bg-amber-50 text-amber-700", title: "Upload the Normal marksheet template for this course to continue official PDF generation." };
};

const getGradeFromRules = ({ percentage, attendancePercentage, result, conduct = "", gradeRules = [] }) => {
  if (result === "Fail") return "F";
  if (result !== "Pass") return "";
  if (attendancePercentage === "" || attendancePercentage === null || attendancePercentage === undefined) return "";

  const attendance = Number(attendancePercentage);
  const mark = Number(percentage);
  if (!Number.isFinite(attendance) || !Number.isFinite(mark)) return "";

  const normalizedConduct = normalizeConduct(conduct);
  const rules = [...(Array.isArray(gradeRules) ? gradeRules : [])]
    .filter((rule) => String(rule?.active || "Active") === "Active")
    .sort((a, b) => {
      const orderDiff = Number(a?.displayOrder || 9999) - Number(b?.displayOrder || 9999);
      if (orderDiff !== 0) return orderDiff;
      const markDiff = Number(b?.minMarkPercentage || 0) - Number(a?.minMarkPercentage || 0);
      if (markDiff !== 0) return markDiff;
      return Number(b?.minAttendancePercentage || 0) - Number(a?.minAttendancePercentage || 0);
    });

  for (const rule of rules) {
    if (mark < Number(rule.minMarkPercentage || 0) || attendance < Number(rule.minAttendancePercentage || 0)) continue;
    const requiredConduct = normalizeConduct(rule.conduct);
    if (requiredConduct && requiredConduct !== normalizedConduct) continue;
    return clean(rule.grade).toUpperCase();
  }
  return "";
};

const getYearLabel = (year) => {
  const value = Number(year || 0);
  if (!Number.isFinite(value) || value <= 0) return "-";
  if (value === 1) return "1st Year";
  if (value === 2) return "2nd Year";
  if (value === 3) return "3rd Year";
  return `${value}th Year`;
};

const calculateRow = (papers = [], attendancePercentage = null, conduct = "", gradeRules = []) => {
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;
  let allEntered = true;
  let hasFail = false;

  papers.forEach((paper) => {
    const maxMarks = toNumber(paper.maxMarks, 0);
    const passMarks = toNumber(paper.passMarks, 0);
    const raw = paper.obtainedMarks;
    const hasMark = raw !== "" && raw !== null && raw !== undefined;
    totalMaxMarks += maxMarks;

    if (!hasMark) {
      allEntered = false;
      return;
    }

    const obtained = toNumber(raw, 0);
    totalObtainedMarks += obtained;
    if (obtained < passMarks) hasFail = true;
  });

  const percentage = totalMaxMarks > 0 ? Number(((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2)) : 0;
  const result = allEntered ? (hasFail ? "Fail" : "Pass") : "";
  const grade = getGradeFromRules({ percentage, attendancePercentage, result, conduct, gradeRules });

  return { totalMaxMarks, totalObtainedMarks, percentage, result, grade };
};

const getCourseYears = (courseId, courses = []) => {
  const course = courses.find((item) => String(item._id) === String(courseId));
  const years = Number(course?.years || 0);
  const safeYears = Number.isFinite(years) && years > 0 ? years : 3;
  return Array.from({ length: safeYears }, (_, idx) => idx + 1);
};

const downloadPdfResponse = (data, fallbackFileName = "marksheet.pdf") => {
  if (!data?.file) {
    throw new Error("PDF file data not received.");
  }

  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${data.file}`;
  link.download = data.fileName || fallbackFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const MarksheetPage = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");

  const [access, setAccess] = useState({ examTypes: [] });
  const [schools, setSchools] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    schoolId: "",
    acYear: "",
    courseId: "",
    studyingYear: "1",
    examType: "Quarterly",
  });

  const [coursePapers, setCoursePapers] = useState([]);
  const [gradeRules, setGradeRules] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [consolidatedCourseId, setConsolidatedCourseId] = useState("");
  const [consolidatedStudents, setConsolidatedStudents] = useState([]);
  const [consolidatedStudentId, setConsolidatedStudentId] = useState("");
  const [consolidatedData, setConsolidatedData] = useState(null);

  const safeSchools = Array.isArray(schools) ? schools : [];
  const safeAcademicYears = Array.isArray(academicYears) ? academicYears : [];
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeStudents = Array.isArray(students) ? students : [];
  const safeConsolidatedStudents = Array.isArray(consolidatedStudents) ? consolidatedStudents : [];
  const safeExamTypes = Array.isArray(access?.examTypes) ? access.examTypes : [];

  const selectedCourse = useMemo(
    () => safeCourses.find((course) => String(course._id) === String(filters.courseId)),
    [safeCourses, filters.courseId]
  );

  const selectedSchool = useMemo(
    () => safeSchools.find((school) => String(school._id) === String(filters.schoolId)),
    [safeSchools, filters.schoolId]
  );

  const selectedAcademicYear = useMemo(
    () => safeAcademicYears.find((acYear) => String(acYear._id) === String(filters.acYear)),
    [safeAcademicYears, filters.acYear]
  );

  useEffect(() => {
    if (checkAuth("marksheetList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const loadOptions = async () => {
      try {
        setLoading(true);
        const data = await fetchMarksheetOptions();
        const loadedSchools = Array.isArray(data.schools) ? data.schools : [];
        const loadedAcademicYears = Array.isArray(data.academicYears) ? data.academicYears : [];
        const loadedCourses = Array.isArray(data.courses) ? data.courses : [];
        const loadedAccess = data.access || { examTypes: [] };
        const activeAcademicYear = loadedAcademicYears.find((item) => item.active === "Active") || loadedAcademicYears[0];

        setAccess(loadedAccess);
        setSchools(loadedSchools);
        setAcademicYears(loadedAcademicYears);
        setCourses(loadedCourses);
        setGradeRules(Array.isArray(data.gradeRules) ? data.gradeRules : []);
        const defaultCourseId = loadedCourses[0]?._id ? String(loadedCourses[0]._id) : "";
        setConsolidatedCourseId(defaultCourseId);
        setFilters((prev) => ({
          ...prev,
          schoolId: loadedSchools.length === 1 ? String(loadedSchools[0]._id) : prev.schoolId,
          acYear: activeAcademicYear?._id ? String(activeAcademicYear._id) : prev.acYear,
          courseId: defaultCourseId || prev.courseId,
          examType: loadedAccess.examTypes?.[0] || "Quarterly",
        }));
      } catch (error) {
        showSwalAlert("Error!", error?.response?.data?.error || error.message || "Load marksheet options failed.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!filters.courseId) return;
    const years = getCourseYears(filters.courseId, safeCourses);
    if (!years.includes(Number(filters.studyingYear))) {
      setFilters((prev) => ({ ...prev, studyingYear: String(years[0] || 1) }));
    }
  }, [filters.courseId, safeCourses]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCoursePapers([]);
    setStudents([]);
    setCurrentExam(null);
    setViewData(null);
  };

  const handleConsolidatedCourseChange = (event) => {
    setConsolidatedCourseId(event.target.value);
    setConsolidatedStudents([]);
    setConsolidatedStudentId("");
    setConsolidatedData(null);
  };

  const loadStudentsForFilters = async (targetFilters = filters) => {
    const data = await fetchMarksheetEntryStudents(targetFilters);
    const loadedStudents = Array.isArray(data.students) ? data.students : [];
    const loadedGradeRules = Array.isArray(data.gradeRules) ? data.gradeRules : gradeRules;
    const isFinalized = data.exam?.status === "Finalized";
    setCoursePapers(Array.isArray(data.coursePapers) ? data.coursePapers : []);
    setGradeRules(loadedGradeRules);
    setStudents(
      loadedStudents.map((student) => {
        if (isFinalized) return student;
        const calculated = calculateRow(
          student.papers || [],
          student.attendancePercentage,
          student.conduct,
          loadedGradeRules
        );
        return { ...student, ...calculated };
      })
    );
    setCurrentExam(data.exam || null);

    if (loadedStudents.length === 0) {
      showSwalAlert("Info!", "No students found for selected course/year.", "info");
    }

    return data;
  };

  const loadStudents = async () => {
    try {
      setProcessing(true);
      await loadStudentsForFilters(filters);
      setActiveTab("entry");
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Load students failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const updateStudentMark = (studentIndex, subjectNo, value) => {
    setStudents((prev) =>
      prev.map((student, idx) => {
        if (idx !== studentIndex) return student;
        const papers = (student.papers || []).map((paper) =>
          Number(paper.subjectNo) === Number(subjectNo)
            ? { ...paper, obtainedMarks: value }
            : paper
        );
        return { ...student, papers, ...calculateRow(papers, student.attendancePercentage, student.conduct, gradeRules) };
      })
    );
  };

  const updateAttendance = (studentIndex, value) => {
    setStudents((prev) =>
      prev.map((student, idx) => {
        if (idx !== studentIndex) return student;
        const nextStudent = { ...student, attendancePercentage: value };
        return {
          ...nextStudent,
          ...calculateRow(nextStudent.papers || [], value, nextStudent.conduct, gradeRules),
        };
      })
    );
  };

  const updateConduct = (studentIndex, value) => {
    setStudents((prev) =>
      prev.map((student, idx) => {
        if (idx !== studentIndex) return student;
        const nextStudent = { ...student, conduct: value };
        return {
          ...nextStudent,
          ...calculateRow(nextStudent.papers || [], nextStudent.attendancePercentage, value, gradeRules),
        };
      })
    );
  };

  const updateRemarks = (studentIndex, value) => {
    setStudents((prev) => prev.map((student, idx) => (idx === studentIndex ? { ...student, remarks: value } : student)));
  };

  const handlePasteMarks = (event, startStudentIndex, startSubjectNo) => {
    const pasted = event.clipboardData?.getData("text");
    if (!pasted || !pasted.includes("\t")) return;

    event.preventDefault();
    const rows = pasted.trim().split(/\r?\n/).map((row) => row.split("\t"));
    const paperIndex = coursePapers.findIndex((paper) => Number(paper.subjectNo) === Number(startSubjectNo));
    if (paperIndex < 0) return;

    setStudents((prev) => {
      const next = prev.map((student) => ({ ...student, papers: (student.papers || []).map((paper) => ({ ...paper })) }));
      rows.forEach((rowValues, rIdx) => {
        const studentIdx = startStudentIndex + rIdx;
        if (!next[studentIdx]) return;
        rowValues.forEach((cellValue, cIdx) => {
          const paper = coursePapers[paperIndex + cIdx];
          if (!paper) return;
          const targetPaper = next[studentIdx].papers.find((p) => Number(p.subjectNo) === Number(paper.subjectNo));
          if (targetPaper) targetPaper.obtainedMarks = clean(cellValue);
        });
        Object.assign(next[studentIdx], calculateRow(next[studentIdx].papers, next[studentIdx].attendancePercentage, next[studentIdx].conduct, gradeRules));
      });
      return next;
    });
  };

  const handleSave = async (status) => {
    if (safeStudents.length === 0) {
      showSwalAlert("Info!", "Please load students first.", "info");
      return;
    }

    if (status === "Finalized" && gradeRules.length === 0) {
      showSwalAlert("Info!", "Please configure at least one Active Grade in Grade Master before finalizing.", "info");
      return;
    }

    const result = await Swal.fire({
      title: `${status} marks?`,
      text: status === "Finalized"
        ? "Finalized marks will be locked as official academic data. Official PDF generation is tracked separately and will not roll back finalization if the template or Google Drive is unavailable."
        : "Draft marks can be edited later.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: status,
      background: "url(/bg_card.png)",
    });

    if (!result.isConfirmed) return;

    try {
      setProcessing(true);
      const data = await saveBulkMarksheet({ ...filters, status, students: safeStudents });
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        await Swal.fire({
          title: "Saved with warnings",
          html: `<b>${data.message}</b><br/><br/>${data.errors.slice(0, 8).map((e) => `${e.name || e.studentId}: ${e.reason}`).join("<br/>")}`,
          icon: "warning",
          background: "url(/bg_card.png)",
        });
      } else if (status === "Finalized") {
        const pdfStatus = getOfficialPdfStatus({ status: "Finalized", totalStudents: safeStudents.length, marksheetPdf: data.marksheetPdf });
        await Swal.fire({
          title: "Finalized Successfully",
          html: `Marks are now locked as official academic data.<br/><br/><b>Official Marksheet PDF:</b> ${pdfStatus.label}<br/><span style="font-size:12px;color:#64748b">PDF generation is independent from finalization.</span>`,
          icon: "success",
          background: "url(/bg_card.png)",
        });
      } else {
        showSwalAlert("Success!", data.message || "Marks saved.", "success");
      }
      await loadStudents();
      await loadExams();
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        await Swal.fire({
          title: error?.response?.data?.error || "Please correct marksheet rows",
          html: apiErrors.slice(0, 12).map((item) => `<b>${item.name || item.studentId || "Student"}</b>: ${item.reason}`).join("<br/>") ,
          icon: "error",
          background: "url(/bg_card.png)",
        });
      } else {
        showSwalAlert("Error!", error?.response?.data?.error || error.message || "Save marks failed.", "error");
      }
    } finally {
      setProcessing(false);
    }
  };

  const loadExams = async () => {
    try {
      setProcessing(true);
      const data = await fetchMarksheetExams({
        schoolId: filters.schoolId,
        acYear: filters.acYear,
        courseId: filters.courseId,
        studyingYear: filters.studyingYear,
        examType: filters.examType,
      });
      setExams(Array.isArray(data.exams) ? data.exams : []);
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Load exams failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "list") return;
    loadExams();
  }, [activeTab, filters.schoolId, filters.acYear, filters.courseId, filters.studyingYear, filters.examType]);

  const loadConsolidatedStudents = async (courseId = consolidatedCourseId) => {
    if (!courseId) {
      setConsolidatedStudents([]);
      setConsolidatedStudentId("");
      return;
    }

    try {
      setProcessing(true);
      const data = await fetchConsolidatedStudents({ courseId });
      const loadedStudents = Array.isArray(data.students) ? data.students : [];
      setConsolidatedStudents(loadedStudents);
      setConsolidatedStudentId((current) =>
        loadedStudents.some((student) => String(student.studentId) === String(current)) ? current : ""
      );
    } catch (error) {
      setConsolidatedStudents([]);
      setConsolidatedStudentId("");
      showSwalAlert(
        "Error!",
        error?.response?.data?.error || error.message || "Load completed students failed.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "consolidated" || !access?.canConsolidated) return;
    loadConsolidatedStudents(consolidatedCourseId);
  }, [activeTab, consolidatedCourseId, access?.canConsolidated]);

  const viewExam = async (examId) => {
    try {
      setProcessing(true);
      const data = await fetchMarksheetExam(examId);
      setViewData(data);
      setActiveTab("view");
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "View marksheet failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const editDraftExam = async (exam) => {
    if (!exam || exam.status !== "Draft") {
      showSwalAlert("Info!", "Only Draft marksheets can be edited.", "info");
      return;
    }

    const targetFilters = {
      schoolId: String(exam.schoolId?._id || exam.schoolId || ""),
      acYear: String(exam.acYear?._id || exam.acYear || ""),
      courseId: String(exam.courseId?._id || exam.courseId || ""),
      studyingYear: String(exam.studyingYear || "1"),
      examType: exam.examType || "Quarterly",
    };

    try {
      setProcessing(true);
      setFilters(targetFilters);
      await loadStudentsForFilters(targetFilters);
      setActiveTab("entry");
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Load draft marksheet failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const downloadExamPdf = async (examId) => {
    try {
      setProcessing(true);
      const data = await printMarksheetExamPdf(examId);
      downloadPdfResponse(data, "marksheet.pdf");
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Download marksheet PDF failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const downloadConsolidatedPdf = async () => {
    if (!consolidatedStudentId || !consolidatedCourseId) {
      showSwalAlert("Info!", "Please select completed student and course.", "info");
      return;
    }

    try {
      setProcessing(true);
      const data = await printConsolidatedMarksheetPdf({ studentId: consolidatedStudentId, courseId: consolidatedCourseId });
      downloadPdfResponse(data, "consolidated_marksheet.pdf");
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Download consolidated PDF failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const loadConsolidated = async () => {
    if (!consolidatedStudentId || !consolidatedCourseId) {
      showSwalAlert("Info!", "Please select completed student and course.", "info");
      return;
    }

    try {
      setProcessing(true);
      const data = await fetchConsolidatedMarksheet({ studentId: consolidatedStudentId, courseId: consolidatedCourseId });
      setConsolidatedData(data);
      setActiveTab("consolidated");
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Load consolidated marksheet failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return getSpinner();
  if (processing) return getPrcessing();

  const canFinalize = user?.role === "superadmin" || (user?.role === "admin" && filters.examType !== "Annual");
  const isCurrentExamFinalized = currentExam?.status === "Finalized";
  const canEditCurrentExam = !isCurrentExamFinalized;

  const openRemarksEditor = async (studentIndex) => {
    const student = students[studentIndex];
    if (!student) return;

    const existingRemarks = clean(student.remarks);
    const studentLabel = `${student.rollNumber || "-"} - ${student.name || "Student"}`;

    if (!canEditCurrentExam) {
      if (!existingRemarks) return;
      await Swal.fire({
        title: "Remarks",
        text: existingRemarks,
        icon: "info",
        confirmButtonText: "Close",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Remarks - ${studentLabel}`,
      input: "textarea",
      inputValue: existingRemarks,
      inputPlaceholder: "Optional remarks, e.g. Absent, Medical Leave, Re-exam...",
      inputAttributes: {
        maxlength: "250",
        "aria-label": "Optional marksheet remarks",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValidator: (value) => (String(value || "").length > 250 ? "Remarks must be 250 characters or less." : undefined),
    });

    if (result.isConfirmed) {
      updateRemarks(studentIndex, clean(result.value).slice(0, 250));
    }
  };

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-3 lg:mt-5">
      <div className="print:hidden flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/exams")}
          className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-slate-200"
          title="Back to Exams"
          aria-label="Back to Exams"
        >
          <FaArrowAltCircleLeft className="mr-1" /> Back
        </button>
        <h2 className="text-lg lg:text-2xl font-bold text-slate-700 text-center">Exams / Results</h2>
        <button
          type="button"
          onClick={() => "#"}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-blue-700"
          title="Print"
          aria-label="Print"
        >
          <FaPrint className="mr-1" /> Print
        </button>
      </div>

      <div className="print:hidden rounded-md border bg-white/90 p-3 shadow-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500">Niswan</label>
            <select name="schoolId" value={filters.schoolId} onChange={handleFilterChange} className="mt-1 w-full rounded border p-2 text-xs">
              <option value="">Select Niswan</option>
              {safeSchools.map((school) => (
                <option key={school._id} value={school._id}>{school.code} - {school.nameEnglish}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500">AC Year</label>
            <select name="acYear" value={filters.acYear} onChange={handleFilterChange} className="mt-1 w-full rounded border p-2 text-xs">
              <option value="">Select AC Year</option>
              {safeAcademicYears.map((acYear) => (
                <option key={acYear._id} value={acYear._id}>{acYear.acYear} {acYear.active === "Active" ? "(Active)" : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500">Course</label>
            <select name="courseId" value={filters.courseId} onChange={handleFilterChange} className="mt-1 w-full rounded border p-2 text-xs">
              <option value="">Select Course</option>
              {safeCourses.map((course) => (
                <option key={course._id} value={course._id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500">Year of Study</label>
            <select name="studyingYear" value={filters.studyingYear} onChange={handleFilterChange} className="mt-1 w-full rounded border p-2 text-xs">
              {getCourseYears(filters.courseId, safeCourses).map((year) => (
                <option key={year} value={year}>{getYearLabel(year)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500">Exam Type</label>
            <select name="examType" value={filters.examType} onChange={handleFilterChange} className="mt-1 w-full rounded border p-2 text-xs">
              {safeExamTypes.map((examType) => (
                <option key={examType} value={examType}>{examType}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center">
          <button type="button" onClick={loadStudents} className="inline-flex items-center rounded-md bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-teal-700" title="Load students for bulk marksheet entry" aria-label="Load students for bulk marksheet entry">
            <FaSearch className="mr-1" /> Load Students
          </button>
        </div>
      </div>

      <div className="print:hidden mb-3 flex flex-wrap justify-center gap-2 text-xs">
        <button onClick={() => setActiveTab("entry")} className={`rounded-full px-3 py-1 font-semibold ${activeTab === "entry" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>Bulk Entry</button>
        <button onClick={() => setActiveTab("list")} className={`rounded-full px-3 py-1 font-semibold ${activeTab === "list" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>Saved Exams</button>
        {viewData ? <button onClick={() => setActiveTab("view")} className={`rounded-full px-3 py-1 font-semibold ${activeTab === "view" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>View / Print</button> : null}
        {access?.canConsolidated ? <button onClick={() => setActiveTab("consolidated")} className={`rounded-full px-3 py-1 font-semibold ${activeTab === "consolidated" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>Consolidated</button> : null}
      </div>

      {activeTab === "entry" ? (
        <div className="rounded-md border bg-white p-3 shadow-lg">
          <div className="mb-3 text-center">
            <h3 className="text-base font-bold text-slate-700">Bulk Marksheet Entry</h3>
            <p className="text-xs text-slate-500">
              {selectedSchool?.nameEnglish || "Niswan"} / {selectedAcademicYear?.acYear || "AC Year"} / {selectedCourse?.name || "Course"} / {getYearLabel(filters.studyingYear)} / {filters.examType}
            </p>
            {currentExam?.status ? (
              <p className={`text-xs font-semibold ${isCurrentExamFinalized ? "text-emerald-700" : "text-blue-600"}`}>
                Current Status: {currentExam.status}
                {isCurrentExamFinalized ? " - locked for editing" : " - draft can be edited"}
              </p>
            ) : null}
            {gradeRules.length === 0 && !isCurrentExamFinalized ? (
              <p className="mt-1 text-xs font-semibold text-amber-600">
                Grade Master is not configured. Draft can be saved, but finalization requires at least one Active Grade rule.
              </p>
            ) : null}
          </div>

          <div className="overflow-auto rounded border">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-blue-50 text-blue-800">
                <tr>
                  <th className="border px-2 py-2">S.No</th>
                  <th className="border px-2 py-2 min-w-[145px]">
                    <div>Roll No</div>
                    <div className="font-normal text-slate-600">Student Name</div>
                  </th>
                  {coursePapers.map((paper) => (
                    <th key={paper.subjectNo} className="border px-2 py-2 min-w-[110px]">
                      <div>{paper.subjectCode}</div>
                      <div className="font-normal text-slate-600">{paper.titleOfPaper}</div>
                      <div className="font-normal text-slate-500">Max {paper.maxMarks} / Pass {paper.passMarks}</div>
                    </th>
                  ))}
                  <th className="border px-2 py-2 min-w-[90px]">
                    <div>Total</div>
                    <div className="font-normal text-slate-600">Mark %</div>
                  </th>
                  <th className="border px-1 py-2 w-[72px] min-w-[72px] max-w-[72px]">
                    <div>Attendance</div>
                    <div className="font-normal text-slate-600">%</div>
                  </th>
                  <th className="border px-2 py-2 min-w-[150px]">Conduct / Behaviour</th>
                  <th className="border px-2 py-2 min-w-[82px]">
                    <div>Grade</div>
                    <div className="font-normal text-slate-600">Result</div>
                  </th>
                  <th className="border px-1 py-2 w-[58px] min-w-[58px] max-w-[58px] text-[10px]">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {safeStudents.length === 0 ? (
                  <tr><td colSpan={coursePapers.length + 7} className="border px-2 py-5 text-center text-slate-500">Load students to enter marks.</td></tr>
                ) : safeStudents.map((student, studentIndex) => (
                  <tr key={student.studentId} className="hover:bg-slate-50">
                    <td className="border px-2 py-1 text-center">{studentIndex + 1}</td>
                    <td className="border px-2 py-1.5 min-w-[145px]">
                      <div className="text-xs font-normal text-blue-700 mb-2">{student.rollNumber || "-"}</div>
                      <div className="mt-0.5 font-medium text-slate-700 leading-tight">{student.name || "-"}</div>
                    </td>
                    {coursePapers.map((paper) => {
                      const studentPaper = (student.papers || []).find((p) => Number(p.subjectNo) === Number(paper.subjectNo)) || paper;
                      return (
                        <td key={paper.subjectNo} className="border px-1 py-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max={paper.maxMarks}
                            value={studentPaper.obtainedMarks ?? ""}
                            onChange={(e) => updateStudentMark(studentIndex, paper.subjectNo, e.target.value)}
                            onPaste={(e) => handlePasteMarks(e, studentIndex, paper.subjectNo)}
                            disabled={!canEditCurrentExam}
                            className={`w-20 rounded border px-2 py-1 text-center ${!canEditCurrentExam ? "bg-slate-100 text-slate-500" : ""}`}
                            title={`${paper.titleOfPaper} marks`}
                            aria-label={`${paper.titleOfPaper} marks`}
                          />
                        </td>
                      );
                    })}
                    <td className="border px-2 py-1 text-center min-w-[90px]">
                      <div className="font-semibold text-slate-800 mb-2">{student.totalObtainedMarks || 0} / {student.totalMaxMarks || 0}</div>
                      <div className="mt-0.5 text-[11px] text-slate-600">{student.percentage || 0}%</div>
                    </td>
                    <td className="border px-1 py-1 text-center w-[72px] min-w-[72px] max-w-[72px]">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={student.attendancePercentage ?? ""}
                        onChange={(e) => updateAttendance(studentIndex, e.target.value)}
                        disabled={!canEditCurrentExam}
                        className={`w-14 rounded border px-1 py-1 text-center ${!canEditCurrentExam ? "bg-slate-100 text-slate-500" : ""}`}
                        title="Attendance Percentage"
                        aria-label="Attendance Percentage"
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <input
                        type="text"
                        value={student.conduct || ""}
                        onChange={(e) => updateConduct(studentIndex, e.target.value)}
                        disabled={!canEditCurrentExam}
                        className={`w-full min-w-[130px] rounded border px-2 py-1 ${!canEditCurrentExam ? "bg-slate-100 text-slate-500" : ""}`}
                        placeholder="Optional"
                        title="Conduct / Behaviour (optional)"
                        aria-label="Conduct / Behaviour"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center min-w-[82px]">
                      <div className="text-sm font-bold text-slate-800 mb-2">{getDisplayGrade(student.grade, student.result) || "-"}</div>
                      <div className={`mt-0.5 text-[12px] font-semibold ${student.result === "Fail" ? "text-rose-600" : student.result === "Pass" ? "text-emerald-600" : "text-slate-500"}`}>
                        {student.result || "-"}
                      </div>
                    </td>
                    <td className="border px-1 py-1 text-center w-[58px] min-w-[58px] max-w-[58px]">
                      {canEditCurrentExam || clean(student.remarks) ? (
                        <button
                          type="button"
                          onClick={() => openRemarksEditor(studentIndex)}
                          className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                            clean(student.remarks)
                              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
                          } ${!canEditCurrentExam ? "cursor-default" : ""}`}
                          title={clean(student.remarks) ? `Remarks: ${clean(student.remarks)}` : "Add optional remarks"}
                          aria-label={
                            clean(student.remarks)
                              ? canEditCurrentExam ? "View or edit remarks" : "View remarks"
                              : "Add optional remarks"
                          }
                        >
                          <FaCommentDots />
                          {clean(student.remarks) ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" /> : null}
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="print:hidden mt-4 flex flex-wrap justify-center gap-3">
            {canEditCurrentExam ? (
              <>
                <button type="button" onClick={() => handleSave("Draft")} className="inline-flex items-center rounded-md bg-slate-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-700" title="Save Draft" aria-label="Save Draft">
                  <FaSave className="mr-1" /> Save Draft
                </button>
                {canFinalize ? (
                  <button type="button" onClick={() => handleSave("Finalized")} className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700" title="Finalize Marks" aria-label="Finalize Marks">
                    <FaSave className="mr-1" /> Finalize
                  </button>
                ) : null}
              </>
            ) : (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                This marksheet is finalized. Draft marksheets only can be edited.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "list" ? (
        <div className="rounded-md border bg-white p-3 shadow-lg">
          <h3 className="mb-1 text-center text-base font-bold text-slate-700">Saved Marksheet Exams</h3>
          <p className="mb-3 text-center text-[11px] text-slate-500">
            {selectedSchool?.nameEnglish || "All permitted Niswans"} / {selectedAcademicYear?.acYear || "All AC Years"} / {selectedCourse?.name || "All Courses"} / {getYearLabel(filters.studyingYear)} / {filters.examType || "All Exams"}
          </p>
          <div className="overflow-auto rounded border">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="border px-2 py-2">S.No</th>
                  <th className="border px-2 py-2">Niswan</th>
                  <th className="border px-2 py-2">AC Year</th>
                  <th className="border px-2 py-2">Course</th>
                  <th className="border px-2 py-2">Year</th>
                  <th className="border px-2 py-2">Exam</th>
                  <th className="border px-2 py-2">Students</th>
                  <th className="border px-2 py-2">Status</th>
                  <th className="border px-2 py-2">Marksheet PDF</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr><td colSpan="10" className="border px-2 py-5 text-center text-slate-500">No saved exams found.</td></tr>
                ) : exams.map((exam, index) => (
                  <tr key={exam._id} className="hover:bg-slate-50">
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1">{exam.schoolId?.code} - {exam.schoolId?.nameEnglish}</td>
                    <td className="border px-2 py-1">{exam.acYear?.acYear}</td>
                    <td className="border px-2 py-1">{exam.courseId?.name}</td>
                    <td className="border px-2 py-1 text-center">{getYearLabel(exam.studyingYear)}</td>
                    <td className="border px-2 py-1 text-center">{exam.examType}</td>
                    <td className="border px-2 py-1 text-center">{exam.totalStudents || 0}</td>
                    <td className="border px-2 py-1 text-center font-semibold">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${exam.status === "Draft" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="border px-2 py-1 text-center font-semibold">
                      {(() => {
                        const pdfStatus = getOfficialPdfStatus(exam);
                        return (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${pdfStatus.className}`} title={pdfStatus.title}>
                            {pdfStatus.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        <button type="button" onClick={() => viewExam(exam._id)} className="rounded bg-blue-600 px-2 py-1 text-white" title="View marksheet" aria-label="View marksheet">View</button>
                        {exam.status === "Draft" ? (
                          <button type="button" onClick={() => editDraftExam(exam)} className="inline-flex items-center rounded bg-amber-500 px-2 py-1 text-white" title="Edit draft marksheet" aria-label="Edit draft marksheet">
                            <FaEdit className="mr-1" /> Edit
                          </button>
                        ) : null}
                        <button type="button" onClick={() => downloadExamPdf(exam._id)} className="inline-flex items-center rounded bg-emerald-600 px-2 py-1 text-white" title="Download PDF" aria-label="Download PDF">
                          <FaDownload className="mr-1" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "view" && viewData ? (
        <>
          <div className="print:hidden mb-3 flex justify-center">
            <button
              type="button"
              onClick={() => downloadExamPdf(viewData?.exam?._id)}
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
              title="Download marksheet PDF using uploaded template"
              aria-label="Download marksheet PDF using uploaded template"
            >
              <FaDownload className="mr-1" /> Download Template PDF
            </button>
          </div>
          <SingleMarksheetView data={viewData} />
        </>
      ) : null}

      {activeTab === "consolidated" && access?.canConsolidated ? (
        <div className="rounded-md border bg-white p-3 shadow-lg">
          <div className="print:hidden mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500">Course</label>
              <select value={consolidatedCourseId} onChange={handleConsolidatedCourseChange} className="mt-1 w-full rounded border p-2 text-xs">
                <option value="">Select Course</option>
                {safeCourses.map((course) => <option key={course._id} value={course._id}>{course.code} - {course.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500">Completed Student</label>
              <select value={consolidatedStudentId} onChange={(e) => setConsolidatedStudentId(e.target.value)} className="mt-1 w-full rounded border p-2 text-xs">
                <option value="">Select Student</option>
                {safeConsolidatedStudents.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.rollNumber} - {student.name}{student.schoolCode ? ` (${student.schoolCode})` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                {consolidatedCourseId && safeConsolidatedStudents.length === 0
                  ? "No completed students found for the selected course."
                  : "Completed students are loaded automatically from the selected course across Niswans."}
              </p>
            </div>
            <div className="flex items-end gap-2">
              <button type="button" onClick={loadConsolidated} className="w-full rounded bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700" title="Load consolidated marksheet" aria-label="Load consolidated marksheet">Load Consolidated</button>
              <button type="button" onClick={downloadConsolidatedPdf} className="w-full rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700" title="Download consolidated PDF" aria-label="Download consolidated PDF">PDF</button>
            </div>
          </div>
          {consolidatedData ? <ConsolidatedMarksheetView data={consolidatedData} /> : <p className="text-center text-sm text-slate-500">Select completed student and load consolidated marksheet.</p>}
        </div>
      ) : null}
    </div>
  );
};

const SingleMarksheetView = ({ data }) => {
  const exam = data?.exam || {};
  const records = Array.isArray(data?.records) ? data.records : [];
  const school = exam.schoolId || {};
  const course = exam.courseId || {};
  const acYear = exam.acYear || {};

  return (
    <div className="rounded-md border bg-white p-4 shadow-lg print:shadow-none print:border-0">
      <div className="text-center border-b pb-3">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-wide">UNIS ACADEMY</h1>
        <h2 className="mt-2 text-lg font-bold text-slate-800">STATEMENT OF MARKS - {exam.examType} EXAMINATION</h2>
        <p className="text-xs text-slate-500">{school.nameEnglish} / {school.code} / {acYear.acYear}</p>
      </div>

      {records.map((record) => {
        const student = record.studentId || {};
        return (
          <div key={record._id} className="mt-5 page-break-after border rounded p-3">
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div><b>Name of the Student:</b> {student.userId?.name || "-"}</div>
              <div><b>Register Number:</b> {student.rollNumber || "-"}</div>
              <div><b>Name of the Course:</b> {course.name || "-"}</div>
              <div><b>Year of Study:</b> {getYearLabel(exam.studyingYear)}</div>
              <div><b>Name of the Niswan:</b> {school.nameEnglish || "-"}</div>
              <div><b>Date of Issue:</b> {new Date().toLocaleDateString("en-GB")}</div>
              <div className="col-span-2"><b>Address of the Niswan:</b> {school.address || "-"}</div>
            </div>

            <table className="w-full border-collapse text-xs">
              <thead className="bg-orange-100">
                <tr>
                  <th className="border px-2 py-2">Subject Code</th>
                  <th className="border px-2 py-2">Title of the Paper</th>
                  <th className="border px-2 py-2">Marks Obtained</th>
                  <th className="border px-2 py-2">Result P/F</th>
                </tr>
              </thead>
              <tbody>
                {(record.papers || []).map((paper) => (
                  <tr key={paper.subjectNo}>
                    <td className="border px-2 py-1 text-center">{paper.subjectCode}</td>
                    <td className="border px-2 py-1">{paper.titleOfPaper}</td>
                    <td className="border px-2 py-1 text-center">{paper.obtainedMarks} / {paper.maxMarks}</td>
                    <td className="border px-2 py-1 text-center font-bold">{paper.result}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-orange-50">
                  <td className="border px-2 py-2" colSpan="2">Total Marks</td>
                  <td className="border px-2 py-2 text-center">{record.totalObtainedMarks} / {record.totalMaxMarks}</td>
                  <td className="border px-2 py-2 text-center">{record.result}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm font-bold">
              <div>Mark %: {record.percentage}%</div>
              <div>Attendance: {record.attendancePercentage === null || record.attendancePercentage === undefined ? "-" : `${record.attendancePercentage}%`}</div>
              <div>Conduct: {record.conduct || "-"}</div>
              <div>Grade: {getDisplayGrade(record.grade, record.result) || "-"}</div>
              <div>Result: {record.result || "-"}</div>
              {clean(record.remarks) ? (
                <div className="col-span-2 md:col-span-5 font-normal text-slate-600">
                  <b className="text-slate-800">Remarks:</b> {record.remarks}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ConsolidatedMarksheetView = ({ data }) => {
  const student = data?.student || {};
  const course = data?.course || {};
  const school = student.schoolId || {};
  const years = Array.isArray(data?.years) ? data.years : [];

  return (
    <div className="rounded-md border bg-white p-4 shadow-lg print:shadow-none print:border-0">
      <div className="text-center border-b pb-3">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-wide">UNIS ACADEMY</h1>
        <h2 className="mt-2 text-lg font-bold text-slate-800">CONSOLIDATED STATEMENT OF MARKS</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs my-3">
        <div><b>Name of the Student:</b> {student.userId?.name || "-"}</div>
        <div><b>Register Number:</b> {student.rollNumber || "-"}</div>
        <div><b>Name of the Course:</b> {course.name || "-"}</div>
        <div><b>Batch:</b> -</div>
        <div><b>Name of the Niswan:</b> {school.nameEnglish || "-"}</div>
        <div><b>Niswan Code:</b> {school.code || "-"}</div>
        <div className="col-span-2"><b>Address of the Niswan:</b> {school.address || "-"}</div>
      </div>

      {data?.missingCount > 0 ? (
        <div className="print:hidden mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          Missing exam records: {data.missingCount}. Blank sections will appear until all marks are entered.
        </div>
      ) : null}

      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-[10px] md:text-xs">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="border px-1 py-2">Year</th>
              <th className="border px-1 py-2">Exam</th>
              <th className="border px-1 py-2">Subject Code</th>
              <th className="border px-1 py-2">Title of the Paper</th>
              <th className="border px-1 py-2">Marks</th>
              <th className="border px-1 py-2">Result P/F</th>
              <th className="border px-1 py-2">Total / Mark % / Attendance / Grade</th>
            </tr>
          </thead>
          <tbody>
            {years.map((yearBlock) =>
              yearBlock.exams.map((examBlock, examIndex) => {
                const record = examBlock.record;
                const papers = record?.papers?.length ? record.papers : [{ subjectCode: "-", titleOfPaper: "Not Entered", obtainedMarks: "", maxMarks: "", result: "" }];
                return papers.map((paper, paperIndex) => (
                  <tr key={`${yearBlock.year}-${examBlock.examType}-${paperIndex}`}>
                    {examIndex === 0 && paperIndex === 0 ? <td rowSpan="3" className="border px-1 py-1 text-center font-bold">{getYearLabel(yearBlock.year)}</td> : null}
                    {paperIndex === 0 ? <td rowSpan={papers.length} className="border px-1 py-1 text-center font-semibold">{examBlock.examType}</td> : null}
                    <td className="border px-1 py-1 text-center">{paper.subjectCode}</td>
                    <td className="border px-1 py-1">{paper.titleOfPaper}</td>
                    <td className="border px-1 py-1 text-center">{paper.obtainedMarks !== "" && paper.obtainedMarks !== null ? `${paper.obtainedMarks} / ${paper.maxMarks}` : "-"}</td>
                    <td className="border px-1 py-1 text-center font-bold">{paper.result || "-"}</td>
                    {paperIndex === 0 ? <td rowSpan={papers.length} className="border px-1 py-1 text-center font-bold">{record ? `${record.totalObtainedMarks} / ${record.totalMaxMarks} | ${record.percentage}% | Att ${record.attendancePercentage === null || record.attendancePercentage === undefined ? "-" : `${record.attendancePercentage}%`} | ${getDisplayGrade(record.grade, record.result) || "-"}` : "-"}</td> : null}
                  </tr>
                ));
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-center text-xs font-bold">
        <div className="border-t pt-2">Signature of the Student</div>
        <div className="border-t pt-2">Controller of Examinations<br />UNIS Academy, Chennai</div>
      </div>
    </div>
  );
};

export default MarksheetPage;
