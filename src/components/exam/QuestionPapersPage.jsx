import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FaArrowAltCircleLeft,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaEdit,
  FaEye,
  FaFilePdf,
  FaHistory,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import {
  createExamQuestion,
  deleteExamQuestion,
  fetchExamQuestionDownloads,
  fetchExamQuestionFile,
  fetchExamQuestionOptions,
  fetchExamQuestions,
  updateExamQuestion,
} from "../../api/examQuestionApi";
import { getSpinner, showSwalAlert } from "../../utils/CommonHelper";

const clean = (value) => (value === undefined || value === null ? "" : String(value).trim());
const emptyFilters = { academicYearId: "", courseId: "", studyingYear: "", examType: "", status: "", search: "" };
const emptyForm = {
  academicYearId: "",
  courseId: "",
  studyingYear: "",
  examType: "",
  subjectNo: "",
  title: "",
  examDate: "",
  examStartTime: "",
  releaseDate: "",
  releaseTime: "",
  closeDate: "",
  closeTime: "",
  targetType: "ALL",
  targetSchoolIds: [],
  instructions: "",
  publicationStatus: "Draft",
};

const badgeClass = (status) => {
  if (status === "Released") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Scheduled") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "Draft") return "border-slate-200 bg-slate-100 text-slate-600";
  return "border-rose-200 bg-rose-50 text-rose-700";
};

const yearLabel = (year) => {
  const n = Number(year || 0);
  if (n === 1) return "1st Year";
  if (n === 2) return "2nd Year";
  if (n === 3) return "3rd Year";
  return n > 0 ? `${n}th Year` : "-";
};

const formatIst = (date, time) => (date && time ? `${date} ${time} IST` : "-");

const getDownloadName = (paper) => {
  const raw = clean(paper?.originalFileName || paper?.driveFileName || "question-paper.pdf");
  return /\.pdf$/i.test(raw) ? raw : `${raw}.pdf`;
};

const triggerBlob = (blob, { fileName, preview = false }) => {
  const url = URL.createObjectURL(blob);
  if (preview) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const QuestionPapersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || "").toLowerCase();
  const canManage = ["superadmin", "hquser"].includes(role);

  const [options, setOptions] = useState({ academicYears: [], courses: [], schools: [], examTypes: [] });
  const [filters, setFilters] = useState(emptyFilters);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editingPaper, setEditingPaper] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [tracking, setTracking] = useState(null);
  const [trackingPaper, setTrackingPaper] = useState(null);

  const safeAcademicYears = Array.isArray(options.academicYears) ? options.academicYears : [];
  const safeCourses = useMemo(
    () => [...(Array.isArray(options.courses) ? options.courses : [])].sort((a, b) =>
      String(a?.code || "").localeCompare(String(b?.code || ""), undefined, {
        sensitivity: "base",
        numeric: true,
      })
    ),
    [options.courses]
  );
  const safeSchools = Array.isArray(options.schools) ? options.schools : [];
  const safePapers = Array.isArray(papers) ? papers : [];

  const selectedFormCourse = useMemo(
    () => safeCourses.find((course) => String(course._id) === String(form.courseId)),
    [form.courseId, safeCourses]
  );
  const formYears = useMemo(
    () => Array.from({ length: Math.max(0, Number(selectedFormCourse?.years || 0)) }, (_, index) => index + 1),
    [selectedFormCourse]
  );
  const formSubjects = Array.isArray(selectedFormCourse?.subjects) ? selectedFormCourse.subjects : [];
  const lockedAfterDownload = Boolean(editingId && Number(editingPaper?.totalDownloads || 0) > 0);
  const displayFormSubjects = useMemo(() => {
    const current = [...formSubjects];
    if (
      editingPaper &&
      String(editingPaper.courseId?._id || editingPaper.courseId || "") === String(form.courseId) &&
      !current.some((subject) => Number(subject.subjectNo) === Number(editingPaper.subjectNo))
    ) {
      current.push({
        subjectNo: Number(editingPaper.subjectNo),
        subjectCode: editingPaper.subjectCode,
        subjectName: editingPaper.subjectName,
      });
    }
    return current.sort((a, b) => Number(a.subjectNo) - Number(b.subjectNo));
  }, [editingPaper, form.courseId, formSubjects]);

  const selectedFilterCourse = useMemo(
    () => safeCourses.find((course) => String(course._id) === String(filters.courseId)),
    [filters.courseId, safeCourses]
  );
  const filterYears = useMemo(
    () => Array.from({ length: Math.max(0, Number(selectedFilterCourse?.years || 0)) }, (_, index) => index + 1),
    [selectedFilterCourse]
  );

  const visibleSchools = useMemo(() => {
    const q = schoolSearch.trim().toLowerCase();
    if (!q) return safeSchools;
    return safeSchools.filter((school) => `${school.code || ""} ${school.nameEnglish || ""}`.toLowerCase().includes(q));
  }, [safeSchools, schoolSearch]);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchExamQuestionOptions();
      setOptions({
        academicYears: data?.academicYears || [],
        courses: data?.courses || [],
        schools: data?.schools || [],
        examTypes: data?.examTypes || [],
        access: data?.access || {},
      });
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Unable to load Question Paper options.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPapers = useCallback(async () => {
    try {
      setBusy(true);
      const data = await fetchExamQuestions({ ...filters, limit: 100 });
      setPapers(data?.papers || []);
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Unable to load Question Papers.", "error");
    } finally {
      setBusy(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (!loading) loadPapers();
  }, [loading, loadPapers]);

  const resetForm = () => {
    setForm(emptyForm);
    setPdfFile(null);
    setEditingId("");
    setEditingPaper(null);
    setSchoolSearch("");
  };

  const openAdd = () => {
    resetForm();
    const activeYear = safeAcademicYears.find((item) => item.active === "Active") || safeAcademicYears[0];
    setForm({ ...emptyForm, academicYearId: activeYear?._id || "" });
    setShowForm(true);
  };

  const openEdit = (paper) => {
    setEditingId(paper._id);
    setEditingPaper(paper);
    setPdfFile(null);
    setSchoolSearch("");
    setForm({
      academicYearId: paper.academicYearId?._id || paper.academicYearId || "",
      courseId: paper.courseId?._id || paper.courseId || "",
      studyingYear: String(paper.studyingYear || ""),
      examType: paper.examType || "",
      subjectNo: String(paper.subjectNo || ""),
      title: paper.title || "",
      examDate: paper.examDate || "",
      examStartTime: paper.examStartTime || "",
      releaseDate: paper.releaseDate || "",
      releaseTime: paper.releaseTime || "",
      closeDate: paper.closeDate || "",
      closeTime: paper.closeTime || "",
      targetType: paper.targetType || "ALL",
      targetSchoolIds: (paper.targetSchoolIds || []).map((school) => String(school?._id || school)),
      instructions: paper.instructions || "",
      publicationStatus: paper.publicationStatus || "Draft",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onFormChange = (field, value) => {
    if (field === "courseId") {
      setForm((prev) => ({ ...prev, courseId: value, studyingYear: "", subjectNo: "" }));
      return;
    }
    if (field === "targetType") {
      setForm((prev) => ({ ...prev, targetType: value, targetSchoolIds: value === "ALL" ? [] : prev.targetSchoolIds }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSchool = (schoolId) => {
    setForm((prev) => {
      const has = prev.targetSchoolIds.includes(String(schoolId));
      return {
        ...prev,
        targetSchoolIds: has
          ? prev.targetSchoolIds.filter((id) => id !== String(schoolId))
          : [...prev.targetSchoolIds, String(schoolId)],
      };
    });
  };

  const validateForm = () => {
    const required = [
      [form.academicYearId, "Academic Year"],
      [form.courseId, "Course"],
      [form.studyingYear, "Year of Study"],
      [form.examType, "Exam Type"],
      [form.subjectNo, "Subject"],
      [form.examDate, "Exam Date"],
      [form.examStartTime, "Exam Start Time"],
      [form.releaseDate, "Release Date"],
      [form.releaseTime, "Release Time"],
    ];
    const missing = required.find(([value]) => !clean(value));
    if (missing) return `${missing[1]} is required.`;
    if (!editingId && !pdfFile) return "Question Paper PDF is required.";
    if (pdfFile && !/\.pdf$/i.test(pdfFile.name || "")) return "Only PDF Question Papers are allowed.";
    if (pdfFile && Number(pdfFile.size || 0) > 15 * 1024 * 1024) return "Question Paper PDF must be 15 MB or smaller.";
    if (form.targetType === "SELECTED" && form.targetSchoolIds.length === 0) return "Please select at least one target Niswan.";
    if ((form.closeDate && !form.closeTime) || (!form.closeDate && form.closeTime)) return "Please provide both Close Date and Close Time.";
    const examAt = `${form.examDate}T${form.examStartTime}`;
    const releaseAt = `${form.releaseDate}T${form.releaseTime}`;
    if (releaseAt > examAt) return "Question Paper release time cannot be later than the Exam Start Time.";
    if (form.closeDate && form.closeTime) {
      const closeAt = `${form.closeDate}T${form.closeTime}`;
      if (closeAt <= releaseAt) return "Close time must be later than the release time.";
      if (closeAt <= examAt) return "Close time must be later than the Exam Start Time.";
    }
    return "";
  };

  const savePaper = async (event) => {
    event.preventDefault();
    const validation = validateForm();
    if (validation) return showSwalAlert("Error!", validation, "error");

    try {
      setBusy(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "targetSchoolIds") data.append(key, JSON.stringify(value));
        else data.append(key, value ?? "");
      });
      if (pdfFile) data.append("file", pdfFile);

      const response = editingId ? await updateExamQuestion(editingId, data) : await createExamQuestion(data);
      showSwalAlert("Success!", response?.message || "Question Paper saved successfully.", "success");
      setShowForm(false);
      resetForm();
      await loadPapers();
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Unable to save Question Paper.", "error");
    } finally {
      setBusy(false);
    }
  };

  const removePaper = async (paper) => {
    const result = await Swal.fire({
      title: "Delete Question Paper?",
      text: `${paper.subjectCode} - ${paper.subjectName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      setBusy(true);
      const data = await deleteExamQuestion(paper._id);
      showSwalAlert("Success!", data?.message || "Question Paper deleted.", "success");
      await loadPapers();
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Unable to delete Question Paper.", "error");
    } finally {
      setBusy(false);
    }
  };

  const openFile = async (paper, preview = false) => {
    try {
      setBusy(true);
      const response = await fetchExamQuestionFile(paper._id, preview ? "inline" : "download");
      triggerBlob(response.data, { fileName: getDownloadName(paper), preview });
      if (!preview && !canManage) await loadPapers();
    } catch (error) {
      showSwalAlert("Error!", error.message || "Unable to download Question Paper.", "error");
    } finally {
      setBusy(false);
    }
  };

  const openTracking = async (paper) => {
    try {
      setBusy(true);
      const data = await fetchExamQuestionDownloads(paper._id);
      setTracking(data);
      setTrackingPaper(paper);
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Unable to load download tracking.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return getSpinner();

  return (
    <div className="px-2 py-3 md:px-4">
      {busy ? <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/35">{getSpinner()}</div> : null}

      <div className="mb-4 grid grid-cols-[80px_1fr_80px] items-center">
        <button
          type="button"
          onClick={() => navigate("/dashboard/exams")}
          className="inline-flex w-fit items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-slate-200"
        >
          <FaArrowAltCircleLeft className="mr-1" /> Back
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-700 lg:text-2xl">Exam Questions</h2>
          <p className="text-[11px] text-slate-500">Question Paper PDFs • Release times are in IST</p>
        </div>
        <div className="flex justify-end">
          {canManage ? (
            <button type="button" onClick={openAdd} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-blue-700">
              <FaPlus className="mr-1" /> Add
            </button>
          ) : null}
        </div>
      </div>

      {showForm && canManage ? (
        <form onSubmit={savePaper} className="mb-4 rounded-lg border border-blue-100 bg-white p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-700">{editingId ? "Edit Question Paper" : "Add Question Paper"}</h3>
              <p className="text-[11px] text-slate-500">PDF is uploaded privately to Google Drive. Niswans download only through UNIS.</p>
            </div>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close form"><FaTimes /></button>
          </div>
          {lockedAfterDownload ? (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
              This paper has already been downloaded by a Niswan. PDF, exam details, release time and targets are locked. You can still update the title/instructions, optional close time, or close the paper.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-slate-600">Academic Year
              <select value={form.academicYearId} onChange={(e) => onFormChange("academicYearId", e.target.value)} disabled={lockedAfterDownload} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100">
                <option value="">Select</option>
                {safeAcademicYears.map((item) => <option key={item._id} value={item._id}>{item.acYear}{item.active ? ` - ${item.active}` : ""}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Course
              <select value={form.courseId} onChange={(e) => onFormChange("courseId", e.target.value)} disabled={lockedAfterDownload} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100">
                <option value="">Select</option>
                {safeCourses.map((item) => <option key={item._id} value={item._id}>{item.code} - {item.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Year of Study
              <select value={form.studyingYear} onChange={(e) => onFormChange("studyingYear", e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100" disabled={!form.courseId || lockedAfterDownload}>
                <option value="">Select</option>
                {formYears.map((year) => <option key={year} value={year}>{yearLabel(year)}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Exam Type
              <select value={form.examType} onChange={(e) => onFormChange("examType", e.target.value)} disabled={lockedAfterDownload} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100">
                <option value="">Select</option>
                {(options.examTypes || []).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-600 md:col-span-2">Subject / Paper
              <select value={form.subjectNo} onChange={(e) => onFormChange("subjectNo", e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100" disabled={!form.courseId || lockedAfterDownload}>
                <option value="">Select</option>
                {displayFormSubjects.map((subject) => <option key={subject.subjectNo} value={subject.subjectNo}>{subject.subjectCode} - {subject.subjectName}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 md:col-span-2">Display Title <span className="font-normal text-slate-400">(Optional)</span>
              <input value={form.title} onChange={(e) => onFormChange("title", e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2 font-normal" placeholder="e.g. Half Yearly Question Paper" />
            </label>

            <label className="text-xs font-semibold text-slate-600">Exam Date
              <input type="date" value={form.examDate} onChange={(e) => onFormChange("examDate", e.target.value)} disabled={lockedAfterDownload} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Exam Start Time <span className="text-blue-600">(IST)</span>
              <input type="time" value={form.examStartTime} onChange={(e) => onFormChange("examStartTime", e.target.value)} disabled={lockedAfterDownload} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Available From Date
              <input type="date" value={form.releaseDate} onChange={(e) => onFormChange("releaseDate", e.target.value)} disabled={lockedAfterDownload} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Available From Time <span className="text-blue-600">(IST)</span>
              <input type="time" value={form.releaseTime} onChange={(e) => onFormChange("releaseTime", e.target.value)} disabled={lockedAfterDownload} className="mt-1 w-full rounded-md border px-2 py-2 font-normal disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Close Date <span className="font-normal text-slate-400">(Optional)</span>
              <input type="date" value={form.closeDate} onChange={(e) => onFormChange("closeDate", e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2 font-normal" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Close Time <span className="font-normal text-slate-400">(IST, Optional)</span>
              <input type="time" value={form.closeTime} onChange={(e) => onFormChange("closeTime", e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2 font-normal" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Publish Status
              <select value={form.publicationStatus} onChange={(e) => onFormChange("publicationStatus", e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2 font-normal">
                <option value="Draft" disabled={lockedAfterDownload}>Draft</option>
                <option value="Published" disabled={lockedAfterDownload && editingPaper?.publicationStatus === "Closed"}>Published</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Question Paper PDF {editingId ? <span className="font-normal text-slate-400">(Optional replacement)</span> : null}
              <input type="file" accept="application/pdf,.pdf" disabled={lockedAfterDownload} onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="mt-1 block w-full rounded-md border bg-white px-2 py-1.5 text-[11px] font-normal disabled:bg-slate-100" />
            </label>
          </div>

          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-5 text-xs">
              <span className="font-bold text-slate-700">Target Niswans</span>
              <label className="inline-flex items-center gap-1"><input type="radio" disabled={lockedAfterDownload} checked={form.targetType === "ALL"} onChange={() => onFormChange("targetType", "ALL")} /> All Active Niswans</label>
              <label className="inline-flex items-center gap-1"><input type="radio" disabled={lockedAfterDownload} checked={form.targetType === "SELECTED"} onChange={() => onFormChange("targetType", "SELECTED")} /> Selected Niswans</label>
            </div>

            {form.targetType === "SELECTED" ? (
              <>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[230px] flex-1">
                    <FaSearch className="absolute left-2 top-2.5 text-slate-400" />
                    <input value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)} className="w-full rounded-md border py-2 pl-7 pr-2 text-xs" placeholder="Search Niswan code or name" />
                  </div>
                  <button type="button" disabled={lockedAfterDownload} onClick={() => setForm((prev) => ({ ...prev, targetSchoolIds: safeSchools.map((s) => String(s._id)) }))} className="rounded-md border bg-white px-2 py-2 text-[11px] font-semibold text-blue-700 disabled:opacity-40">Select All</button>
                  <button type="button" disabled={lockedAfterDownload} onClick={() => setForm((prev) => ({ ...prev, targetSchoolIds: [] }))} className="rounded-md border bg-white px-2 py-2 text-[11px] font-semibold text-slate-600 disabled:opacity-40">Clear</button>
                  <span className="text-[11px] font-semibold text-slate-500">Selected: {form.targetSchoolIds.length}</span>
                </div>
                <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto rounded-md border bg-white p-2 md:grid-cols-2 lg:grid-cols-3">
                  {visibleSchools.map((school) => (
                    <label key={school._id} className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-[11px] hover:bg-blue-50">
                      <input type="checkbox" disabled={lockedAfterDownload} checked={form.targetSchoolIds.includes(String(school._id))} onChange={() => toggleSchool(school._id)} />
                      <span><b>{school.code}</b> - {school.nameEnglish}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[11px] text-slate-500">All Niswans that are Active at download time are eligible.</p>
            )}
          </div>

          <label className="mt-3 block text-xs font-semibold text-slate-600">Instructions <span className="font-normal text-slate-400">(Optional)</span>
            <textarea value={form.instructions} onChange={(e) => onFormChange("instructions", e.target.value)} rows={2} className="mt-1 w-full rounded-md border px-2 py-2 font-normal" placeholder="Instructions shown with the Question Paper" />
          </label>

          <div className="mt-3 flex justify-center gap-2">
            <button type="submit" disabled={busy} className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50">{editingId ? "Update Question Paper" : "Save Question Paper"}</button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-md bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300">Cancel</button>
          </div>
        </form>
      ) : null}

      <div className="mb-4 rounded-lg border bg-white p-3 shadow-lg">
        <div className="mb-2 text-center text-sm font-bold text-slate-700">Question Papers</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <select value={filters.academicYearId} onChange={(e) => setFilters((prev) => ({ ...prev, academicYearId: e.target.value }))} className="rounded-md border px-2 py-2 text-xs">
            <option value="">All AC Years</option>
            {safeAcademicYears.map((item) => <option key={item._id} value={item._id}>{item.acYear}</option>)}
          </select>
          <select value={filters.courseId} onChange={(e) => setFilters((prev) => ({ ...prev, courseId: e.target.value, studyingYear: "" }))} className="rounded-md border px-2 py-2 text-xs">
            <option value="">All Courses</option>
            {safeCourses.map((item) => <option key={item._id} value={item._id}>{item.code} - {item.name}</option>)}
          </select>
          <select value={filters.studyingYear} onChange={(e) => setFilters((prev) => ({ ...prev, studyingYear: e.target.value }))} className="rounded-md border px-2 py-2 text-xs" disabled={!filters.courseId}>
            <option value="">All Years</option>
            {filterYears.map((year) => <option key={year} value={year}>{yearLabel(year)}</option>)}
          </select>
          <select value={filters.examType} onChange={(e) => setFilters((prev) => ({ ...prev, examType: e.target.value }))} className="rounded-md border px-2 py-2 text-xs">
            <option value="">All Exams</option>
            {(options.examTypes || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {canManage ? (
            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="rounded-md border px-2 py-2 text-xs">
              <option value="">All Status</option><option>Draft</option><option>Published</option><option>Closed</option>
            </select>
          ) : <div className="hidden lg:block" />}
          <div className="relative col-span-2 md:col-span-1">
            <FaSearch className="absolute left-2 top-2.5 text-slate-400" />
            <input value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} className="w-full rounded-md border py-2 pl-7 pr-2 text-xs" placeholder="Search" />
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <button type="button" onClick={() => setFilters(emptyFilters)} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200">Clear Filters</button>
        </div>
      </div>

      {safePapers.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500 shadow">No Question Papers found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {safePapers.map((paper) => {
            const downloadable = canManage || paper.effectiveStatus === "Released";
            return (
              <div key={paper._id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600"><FaFilePdf /></span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{paper.subjectCode} - {paper.subjectName}</h3>
                        <p className="text-[11px] text-slate-500">{paper.courseCode} - {paper.courseName} • {yearLabel(paper.studyingYear)} • {paper.examType}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${badgeClass(paper.effectiveStatus)}`}>{paper.effectiveStatus}</span>
                </div>

                {paper.title ? <div className="mt-2 text-xs font-semibold text-blue-700">{paper.title}</div> : null}
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] md:grid-cols-4">
                  <div><div className="text-slate-400">Exam</div><div className="font-semibold text-slate-700">{paper.examDate} {paper.examStartTime} IST</div></div>
                  <div><div className="text-slate-400">Available</div><div className="font-semibold text-slate-700">{formatIst(paper.releaseDate, paper.releaseTime)}</div></div>
                  <div><div className="text-slate-400">Target</div><div className="font-semibold text-slate-700">{paper.targetType === "ALL" ? "All Active Niswans" : `${paper.targetCount ?? (paper.targetSchoolIds || []).length} Niswans`}</div></div>
                  <div><div className="text-slate-400">PDF</div><div className="truncate font-semibold text-slate-700" title={paper.originalFileName}>{paper.originalFileName}</div></div>
                </div>

                {!canManage && paper.effectiveStatus === "Scheduled" ? (
                  <div className="mt-3 flex items-center rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700"><FaClock className="mr-2" /> Available from {formatIst(paper.releaseDate, paper.releaseTime)}</div>
                ) : null}
                {!canManage && paper.effectiveStatus === "Closed" ? (
                  <div className="mt-3 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">Question Paper download is closed.</div>
                ) : null}
                {paper.instructions ? <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-600"><b>Instructions:</b> {paper.instructions}</div> : null}

                {canManage ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <div className="text-[11px] text-slate-500">
                      <b>{paper.downloadedSchoolCount || 0}</b> / <b>{paper.targetCount || 0}</b> Niswans downloaded
                      {Number(paper.totalDownloads || 0) > 0 ? ` • ${paper.totalDownloads} total download(s)` : ""}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => openFile(paper, true)} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"><FaEye className="mr-1" /> Preview</button>
                      <button type="button" onClick={() => openFile(paper, false)} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"><FaDownload className="mr-1" /> PDF</button>
                      <button type="button" onClick={() => openTracking(paper)} className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"><FaHistory className="mr-1" /> Downloads</button>
                      <button type="button" onClick={() => openEdit(paper)} className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"><FaEdit className="mr-1" /> Edit</button>
                      {paper.publicationStatus === "Draft" && Number(paper.totalDownloads || 0) === 0 ? <button type="button" onClick={() => removePaper(paper)} className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"><FaTrash className="mr-1" /> Delete</button> : null}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex justify-center border-t pt-3">
                    <button type="button" disabled={!downloadable} onClick={() => downloadable && openFile(paper, false)} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"><FaDownload className="mr-1" /> Download Question Paper</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tracking && trackingPaper ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-3">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Download Tracking</h3>
                <p className="text-[11px] text-slate-500">{trackingPaper.subjectCode} - {trackingPaper.subjectName} • {trackingPaper.examType}</p>
              </div>
              <button type="button" onClick={() => { setTracking(null); setTrackingPaper(null); }} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><FaTimes /></button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-3 text-center"><div className="text-lg font-bold text-slate-700">{tracking.summary?.targetCount || 0}</div><div className="text-[10px] text-slate-500">Target Niswans</div></div>
              <div className="rounded-md bg-emerald-50 p-3 text-center"><div className="text-lg font-bold text-emerald-700">{tracking.summary?.downloadedSchoolCount || 0}</div><div className="text-[10px] text-emerald-600">Downloaded</div></div>
              <div className="rounded-md bg-amber-50 p-3 text-center"><div className="text-lg font-bold text-amber-700">{tracking.summary?.pendingCount || 0}</div><div className="text-[10px] text-amber-600">Pending</div></div>
              <div className="rounded-md bg-blue-50 p-3 text-center"><div className="text-lg font-bold text-blue-700">{tracking.summary?.totalDownloads || 0}</div><div className="text-[10px] text-blue-600">Total Downloads</div></div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-bold text-emerald-700">Downloaded Niswans</h4>
                <div className="max-h-72 overflow-y-auto rounded-md border">
                  {(tracking.firstDownloadBySchool || []).length ? (tracking.firstDownloadBySchool || []).map((row) => (
                    <div key={`${row.schoolId?._id}-${row._id}`} className="flex items-start gap-2 border-b px-3 py-2 text-[11px] last:border-b-0">
                      <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
                      <div><div className="font-semibold text-slate-700">{row.schoolId?.code} - {row.schoolId?.nameEnglish}</div><div className="text-slate-400">First download: {row.downloadedAt ? new Date(row.downloadedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : "-"}</div></div>
                    </div>
                  )) : <div className="p-4 text-center text-[11px] text-slate-400">No Niswan has downloaded yet.</div>}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-bold text-amber-700">Pending Niswans</h4>
                <div className="max-h-72 overflow-y-auto rounded-md border">
                  {(tracking.pendingSchools || []).length ? (tracking.pendingSchools || []).map((school) => (
                    <div key={school._id} className="border-b px-3 py-2 text-[11px] last:border-b-0"><span className="font-semibold text-slate-700">{school.code}</span> - {school.nameEnglish}</div>
                  )) : <div className="p-4 text-center text-[11px] font-semibold text-emerald-600">All targeted Niswans have downloaded.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuestionPapersPage;
