import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchPromoteCandidates, promoteBulk } from "../../api/promoteApi";
import { showSwalAlert } from "../../utils/CommonHelper";
import { getCoursesFromCache } from "../../utils/CourseHelper";
import { getAcademicYearsFromCache } from "../../utils/AcademicYearHelper";

const BULK_PROMOTE_SCHOOL_ID_BACKUP_KEY = "bulkPromoteSchoolId";
const BULK_PROMOTE_SCHOOL_NAME_BACKUP_KEY = "bulkPromoteSchoolName";

const getBulkPromoteSchoolContext = () => {
  try {
    return {
      schoolId:
        localStorage.getItem("schoolId") ||
        sessionStorage.getItem(BULK_PROMOTE_SCHOOL_ID_BACKUP_KEY) ||
        "",
      schoolName:
        localStorage.getItem("schoolName") ||
        sessionStorage.getItem(BULK_PROMOTE_SCHOOL_NAME_BACKUP_KEY) ||
        "",
    };
  } catch {
    return { schoolId: "", schoolName: "" };
  }
};

export default function BulkPromote() {
  const navigate = useNavigate();

  // Keep the selected Niswan stable while this page is open.
  // Some dashboard/shared cleanup can remove localStorage schoolId/schoolName for HQ roles,
  // but Bulk Promote and the Back flow should continue using the selected Niswan.
  const [schoolContext] = useState(() => getBulkPromoteSchoolContext());
  const schoolId = schoolContext.schoolId;
  const schoolName = schoolContext.schoolName;

  const [targetAcYear, setTargetAcYear] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseId, setCourseId] = useState("");

  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState({});
  const [gradesByStudentId, setGradesByStudentId] = useState({});
  const [loading, setLoading] = useState(false);

  const selectAllRef = useRef(null);
  const GRADE_OPTIONS = ["A+", "A", "B+", "B", "C+", "C", "D"];
  const EDUCATION_TYPE_ORDER = [
    "Deeniyath Education",
    "Islamic Home Science",
    "College Education",
    "School Education",
    "Vocational Courses",
  ];

  const getApiErrorMessage = (error, fallback = "Action failed") => {
    const data = error?.response?.data;

    if (typeof data === "string" && data.trim()) return data.trim();

    return (
      data?.error ||
      data?.message ||
      error?.message ||
      fallback
    );
  };

  const escapeHtml = (value = "") =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const buildBulkActionSummaryHtml = (summary = {}) => {
    const errors = Array.isArray(summary.errors) ? summary.errors : [];
    const skippedDetails = Array.isArray(summary.skippedDetails)
      ? summary.skippedDetails
      : [];

    const renderRows = (rows, emptyText) => {
      if (!rows.length) return `<div class="text-left text-xs text-slate-500">${emptyText}</div>`;

      return `
        <div style="max-height:180px;overflow:auto;margin-top:8px;border:1px solid #e2e8f0;border-radius:8px;">
          <table style="width:100%;font-size:11px;text-align:left;border-collapse:collapse;">
            <thead style="background:#f1f5f9;color:#be185d;">
              <tr>
                <th style="padding:6px;border-bottom:1px solid #e2e8f0;">Student</th>
                <th style="padding:6px;border-bottom:1px solid #e2e8f0;">Reason</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .slice(0, 12)
                .map(
                  (row) => `
                    <tr>
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;">${escapeHtml(row.studentId || "-")}</td>
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;">${escapeHtml(row.reason || "-")}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
        ${rows.length > 12 ? `<div style="margin-top:6px;font-size:11px;color:#64748b;">Showing first 12 of ${rows.length} item(s).</div>` : ""}
      `;
    };

    return `
      <div style="text-align:left;font-size:13px;line-height:1.55;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div><b>Requested:</b> ${Number(summary.requested || 0)}</div>
          <div><b>Updated:</b> ${Number(summary.promoted || 0)}</div>
          <div><b>Skipped:</b> ${Number(summary.skipped || 0)}</div>
          <div><b>Errors:</b> ${errors.length}</div>
        </div>

        ${skippedDetails.length ? `<b>Skipped Details</b>${renderRows(skippedDetails, "No skipped students.")}` : ""}
        ${errors.length ? `<div style="margin-top:10px;"><b>Error Details</b>${renderRows(errors, "No errors.")}</div>` : ""}
      </div>
    `;
  };

  const restoreBulkPromoteSchoolContext = useCallback(() => {
    try {
      const backupSchoolId =
        schoolId || sessionStorage.getItem(BULK_PROMOTE_SCHOOL_ID_BACKUP_KEY) || "";
      const backupSchoolName =
        schoolName || sessionStorage.getItem(BULK_PROMOTE_SCHOOL_NAME_BACKUP_KEY) || "";

      if (backupSchoolId) {
        localStorage.setItem("schoolId", backupSchoolId);
        sessionStorage.setItem(BULK_PROMOTE_SCHOOL_ID_BACKUP_KEY, backupSchoolId);
      }

      if (backupSchoolName) {
        localStorage.setItem("schoolName", backupSchoolName);
        sessionStorage.setItem(BULK_PROMOTE_SCHOOL_NAME_BACKUP_KEY, backupSchoolName);
      }
    } catch {
      // Restore should never block navigation or action completion.
    }
  }, [schoolId, schoolName]);

  useEffect(() => {
    restoreBulkPromoteSchoolContext();
  }, [restoreBulkPromoteSchoolContext]);

  const handleBack = () => {
    restoreBulkPromoteSchoolContext();
    navigate("/dashboard/students");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const c = await getCoursesFromCache();
        const a = await getAcademicYearsFromCache();

        const coursesList = Array.isArray(c) ? c : c?.courses || [];
        const yearsList = Array.isArray(a) ? a : a?.academicYears || [];

        setCourses(Array.isArray(coursesList) ? coursesList : []);

        const list = Array.isArray(yearsList) ? yearsList : [];
        setAcademicYears(list.filter((y) => String(y?.active) === "Next"));

        const next = (yearsList || []).find((x) => String(x.active) === "Next");
        setTargetAcYear(next?._id || "");
      } catch (e) {
        console.log("BulkPromote cache load error:", e);
        setCourses([]);
        setAcademicYears([]);
      }
    };
    load();
  }, []);

  const typeOptions = useMemo(() => {
    const set = new Set();
    for (const c of courses) {
      const t = String(c?.type || "").trim();
      if (t) set.add(t);
    }

    const known = EDUCATION_TYPE_ORDER.filter((t) => set.has(t));
    const unknown = Array.from(set)
      .filter((t) => !EDUCATION_TYPE_ORDER.includes(t))
      .sort((a, b) => a.localeCompare(b));

    return [...known, ...unknown];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const t = String(courseType || "").trim();
    if (!t) return [];
    return courses
      .filter((c) => String(c?.type || "").trim() === t)
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [courses, courseType]);

  useEffect(() => {
    setCourseId("");
    setCandidates([]);
    setSelected({});
    setGradesByStudentId({});
  }, [courseType]);

  const selectedIds = useMemo(() => Object.keys(selected), [selected]);
  const selectedCount = selectedIds.length;

  const selectedCandidates = useMemo(() => {
    return candidates.filter((row) => selected[String(row.studentId)]);
  }, [candidates, selected]);

  const hasFinalYearSelected = useMemo(() => {
    return selectedCandidates.some((row) => row.isFinalYear);
  }, [selectedCandidates]);

  const hasNonFinalYearSelected = useMemo(() => {
    return selectedCandidates.some((row) => !row.isFinalYear);
  }, [selectedCandidates]);

  const hasPendingFeesSelected = useMemo(() => {
    return selectedCandidates.some((row) => row.hasPendingFees);
  }, [selectedCandidates]);

  useEffect(() => {
    if (selectAllRef.current) {
      const total = candidates.length;
      selectAllRef.current.indeterminate = selectedCount > 0 && selectedCount < total;
    }
  }, [selectedCount, candidates.length]);

  const loadCandidates = async () => {
    const missing = [];
    if (!schoolId) missing.push("schoolId");
    if (!targetAcYear) missing.push("academic year");
    if (!courseType) missing.push("course type");
    if (!courseId) missing.push("course");

    if (missing.length > 0) {
      showSwalAlert(
        "Info",
        missing.includes("schoolId")
          ? "School is not available for Bulk Promote. Please go back to Dashboard and open Bulk Promote again, or login again if your session data was cleared."
          : `Please select: ${missing.join(", ")}`,
        "info"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetchPromoteCandidates({ schoolId, targetAcYear, courseId });
      if (!res?.success) {
        showSwalAlert("Error", res?.error || "Failed to load candidates", "error");
      } else {
        const rows = res.students || [];
        setCandidates(rows);
        setSelected({});
        setGradesByStudentId({});
      }
    } catch (error) {
      console.error("[BulkPromote] Failed to load candidates", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      showSwalAlert(
        "Error",
        getApiErrorMessage(error, "Failed to load candidates"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleOne = (sid) => {
    setSelected((prev) => {
      const next = { ...prev };

      if (next[sid]) {
        delete next[sid];

        setGradesByStudentId((prevGrades) => {
          const nextGrades = { ...prevGrades };
          delete nextGrades[sid];
          return nextGrades;
        });
      } else {
        next[sid] = true;
      }

      return next;
    });
  };

  const toggleAll = () => {
    if (!candidates.length) return;

    const allSelected = selectedCount === candidates.length;

    if (allSelected) {
      setSelected({});
      setGradesByStudentId({});
      return;
    }

    const nextSelected = {};
    const nextGrades = {};

    for (const s of candidates) {
      const sid = String(s.studentId);
      nextSelected[sid] = true;
      nextGrades[sid] = gradesByStudentId[sid] || "";
    }

    setSelected(nextSelected);
    setGradesByStudentId(nextGrades);
  };

  const handleGradeChange = (studentId, value) => {
    setGradesByStudentId((prev) => ({
      ...prev,
      [String(studentId)]: value,
    }));
  };

  const validateGradesForAction = (action, studentIds) => {
    if (action !== "PROMOTE" && action !== "COMPLETE") return true;

    const missing = studentIds.filter((sid) => !String(gradesByStudentId[sid] || "").trim());

    if (missing.length > 0) {
      showSwalAlert(
        "Info",
        `Please enter grade for all selected students. Missing: ${missing.length}`,
        "info"
      );
      return false;
    }

    return true;
  };

  const confirmAndSubmit = async (action) => {
    const studentIds = selectedIds;

    if (studentIds.length === 0) {
      showSwalAlert("Info", "Select at least one student", "info");
      return;
    }

    if (hasPendingFeesSelected) {
      showSwalAlert(
        "Info",
        "Students with pending fee invoices cannot be promoted, not promoted, or completed.",
        "info"
      );
      return;
    }

    if (action === "PROMOTE" && hasFinalYearSelected) {
      showSwalAlert(
        "Info",
        "Final year students cannot be promoted. Please unselect them or use Complete / Not Promote.",
        "info"
      );
      return;
    }

    if (action === "COMPLETE" && hasNonFinalYearSelected) {
      showSwalAlert(
        "Info",
        "Only final year students can be marked as Complete. Please unselect non-final-year students.",
        "info"
      );
      return;
    }

    if (!validateGradesForAction(action, studentIds)) return;

    const courseName =
      filteredCourses.find((c) => String(c._id) === String(courseId))?.name || "Course";

    const acYearLabel =
      academicYears.find((a) => String(a._id) === String(targetAcYear))?.acYear || "Selected Year";

    let title = "Confirm Action";
    let html = "";

    if (action === "PROMOTE") {
      title = "Are you sure to PROMOTE the selected Students?";
      html = `This will promote <b>${studentIds.length}</b> student(s) for <b>${courseName}</b> into <b>${acYearLabel}</b> and create fees invoice.`;
    } else if (action === "NOT_PROMOTE") {
      title = "Are you sure to NOT PROMOTE the selected Students?";
      html = `This will move <b>${studentIds.length}</b> student(s) to <b>${acYearLabel}</b> for <b>${courseName}</b> (same year) and create fees invoice.`;
    } else if (action === "COMPLETE") {
      title = "Are you sure to COMPLETE the selected Students?";
      html = `This will mark <b>${studentIds.length}</b> student(s) as <b>Completed</b> for <b>${courseName}</b> in <b>${acYearLabel}</b> and create only <b>Certificate Print Fee</b> invoice as configured in Template Master.`;
    }

    const result = await Swal.fire({
      title,
      html,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      allowOutsideClick: !loading,
      background: "url(/bg_card.png)",
    });

    if (!result.isConfirmed) return;

    const gradesPayload = {};
    if (action === "PROMOTE" || action === "COMPLETE") {
      for (const sid of studentIds) {
        gradesPayload[sid] = String(gradesByStudentId[sid] || "").trim();
      }
    }

    setLoading(true);
    try {
      const resp = await promoteBulk({
        schoolId,
        targetAcYear,
        courseId,
        studentIds,
        policy: action,
        requireFeesPaid: true,
        chunkSize: 10,
        gradesByStudentId: gradesPayload,
      });

      if (!resp?.success) {
        showSwalAlert("Error", resp?.error || "Action failed", "error");
      } else {
        const s = resp.summary || {};
        const errorCount = Array.isArray(s.errors) ? s.errors.length : 0;
        const skippedCount = Number(s.skipped || 0);
        const hasWarnings = skippedCount > 0 || errorCount > 0;

        await Swal.fire({
          title: hasWarnings ? "Completed with Warnings" : "Success",
          html: buildBulkActionSummaryHtml(s),
          icon: hasWarnings ? "warning" : "success",
          showConfirmButton: true,
          background: "url(/bg_card.png)",
          width: 640,
        });

        restoreBulkPromoteSchoolContext();
        loadCandidates();
      }
    } catch (error) {
      console.error("[BulkPromote] Action failed", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      showSwalAlert(
        "Error",
        getApiErrorMessage(error, "Action failed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto pb-28">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex"
          aria-label="Back to students"
          title="Back"
        >
          <FaArrowAltCircleLeft className="text-3xl lg:text-4xl bg-blue-700 text-white rounded shadow-lg hover:-translate-y-0.5" />
        </button>
        <h2 className="pl-2 text-lg font-semibold text-left">Bulk Promote</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 mt-4">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Academic Year
          </label>
          <select
            className="w-full border p-2 text-sm rounded"
            value={targetAcYear}
            onChange={(e) => setTargetAcYear(e.target.value)}
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((a) => (
              <option key={a._id} value={a._id}>
                {a.acYear}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Course Type
          </label>
          <select
            className="w-full border p-2 text-sm rounded"
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
          >
            <option value="">Select Course Type</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Course
          </label>
          <select
            className="w-full border p-2 text-sm rounded"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={!courseType}
          >
            <option value="">{courseType ? "Select Course" : "Select type first"}</option>
            {filteredCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex items-end">
          <button
            onClick={loadCandidates}
            disabled={loading}
            className="w-full border rounded bg-blue-700 p-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load Students"}
          </button>
        </div>
      </div>

      <div className="border rounded overflow-x-auto">
        <div className="grid grid-cols-12 p-2 font-bold text-xs bg-gray-100 min-w-[900px]">
          <div className="col-span-1 grid place-items-center">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={candidates.length > 0 && selectedCount === candidates.length}
              onChange={toggleAll}
              disabled={!candidates.length}
              title="Select all"
            />
          </div>
          <div className="col-span-2">Roll</div>
          <div className="col-span-3">Student</div>
          <div className="col-span-2">Current Year</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Grade</div>
        </div>

        {candidates.map((s) => {
          const sid = String(s.studentId);
          const checked = !!selected[sid];

          return (
            <div
              key={s.studentId}
              className={`grid grid-cols-12 p-2 border-t text-xs items-center min-w-[900px] ${
                s.hasPendingFees ? "bg-amber-50" : s.isFinalYear ? "bg-rose-50" : ""
              }`}
            >
              <div className="col-span-1 grid place-items-center">
                <input type="checkbox" checked={checked} onChange={() => toggleOne(sid)} />
              </div>

              <div className="col-span-2">{s.rollNumber || "-"}</div>

              <div className="col-span-3 font-semibold text-slate-800">
                <div>{s.name || "-"}</div>

                {s.hasPendingFees ? (
                  <div className="mt-1 text-[11px] font-medium text-amber-700">
                    {s.feeBlockReason || "Pending fee invoice exists"}
                  </div>
                ) : s.isFinalYear ? (
                  <div className="mt-1 text-[11px] font-medium text-red-600">
                    Final year student
                  </div>
                ) : null}
              </div>

              <div className="col-span-2">{s.fromYear || "-"}</div>

              <div className="col-span-2">
                <div>{s.fromStatus || "-"}</div>
              </div>

              <div className="col-span-2">
                <select
                  value={gradesByStudentId[sid] || ""}
                  onChange={(e) => handleGradeChange(sid, e.target.value)}
                  className="w-full border p-2 rounded text-xs bg-white"
                  disabled={!checked}
                >
                  <option value="">Select grade</option>
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}

        {!candidates.length && <div className="p-4 text-sm text-gray-600">No students loaded.</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">
            Selected Students : <span className="font-semibold text-slate-900">{selectedCount}</span>

            {hasPendingFeesSelected ? (
              <span className="ml-3 text-amber-700">
                Pending fees selected - All actions disabled
              </span>
            ) : hasFinalYearSelected ? (
              <span className="ml-3 text-red-600">
                Final year selected - Promote disabled
              </span>
            ) : hasNonFinalYearSelected ? (
              <span className="ml-3 text-indigo-600">
                Non-final year selected - Complete disabled
              </span>
            ) : null}
          </div>

          <div className="flex w-full flex-wrap gap-5 sm:w-auto">
            <button
              onClick={() => confirmAndSubmit("PROMOTE")}
              disabled={loading || selectedCount === 0 || hasFinalYearSelected || hasPendingFeesSelected}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              title={
                hasPendingFeesSelected
                  ? "Students with pending fees cannot be promoted"
                  : hasFinalYearSelected
                  ? "Final year students cannot be promoted"
                  : ""
              }
            >
              {loading ? "Working..." : "Promote"}
            </button>

            <button
              onClick={() => confirmAndSubmit("NOT_PROMOTE")}
              disabled={loading || selectedCount === 0 || hasPendingFeesSelected}
              className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              title={hasPendingFeesSelected ? "Students with pending fees cannot be marked as Not Promote" : ""}
            >
              {loading ? "Working..." : "Not Promote"}
            </button>

            <button
              onClick={() => confirmAndSubmit("COMPLETE")}
              disabled={loading || selectedCount === 0 || hasNonFinalYearSelected || hasPendingFeesSelected}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              title={
                hasPendingFeesSelected
                  ? "Students with pending fees cannot be completed"
                  : hasNonFinalYearSelected
                  ? "Only final year students can be completed"
                  : ""
              }
            >
              {loading ? "Working..." : "Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}