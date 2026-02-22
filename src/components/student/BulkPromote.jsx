import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { fetchPromoteCandidates, promoteBulk } from "../../api/promoteApi";
import { LinkIcon, showSwalAlert } from "../../utils/CommonHelper";
import { getCoursesFromCache } from "../../utils/CourseHelper";
import { getAcademicYearsFromCache } from "../../utils/AcademicYearHelper";

export default function BulkPromote() {
  const mySchoolId = localStorage.getItem("schoolId");
  const schoolId = mySchoolId;

  const [targetAcYear, setTargetAcYear] = useState("");

  // separate dropdowns
  const [courseType, setCourseType] = useState("");
  const [courseId, setCourseId] = useState("");

  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);

  const selectAllRef = useRef(null);

  // REQUIRED ORDER
  const EDUCATION_TYPE_ORDER = [
    "Deeniyath Education",
    "Islamic Home Science",
    "College Education",
    "School Education",
    "Vocational Courses",
  ];

  // ✅ certificate print fee (you can change)
  const CERTIFICATE_PRINT_FEE = 50;

  useEffect(() => {
    const load = async () => {
      try {
        const c = await getCoursesFromCache();
        const a = await getAcademicYearsFromCache();

        const coursesList = Array.isArray(c) ? c : c?.courses || [];
        const yearsList = Array.isArray(a) ? a : a?.academicYears || [];
        console.log(yearsList);
        setCourses(Array.isArray(coursesList) ? coursesList : []);
        setAcademicYears(Array.isArray(yearsList) ? yearsList : []);

        const active = (yearsList || []).find((x) => String(x.active) === "Active");

        setTargetAcYear(active._id);
      } catch (e) {
        console.log("BulkPromote cache load error:", e);
        setCourses([]);
        setAcademicYears([]);
      }
    };
    load();
  }, []);

  // Type options in required order + unknown appended
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

  // Courses filtered by selected type
  const filteredCourses = useMemo(() => {
    const t = String(courseType || "").trim();
    if (!t) return [];
    return courses
      .filter((c) => String(c?.type || "").trim() === t)
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [courses, courseType]);

  // reset courseId when type changes
  useEffect(() => {
    setCourseId("");
    setCandidates([]);
    setSelected({});
  }, [courseType]);

  const selectedCount = useMemo(() => Object.keys(selected).length, [selected]);

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
      showSwalAlert("Info", `Please select: ${missing.join(", ")}`, "info");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchPromoteCandidates({ schoolId, targetAcYear, courseId });
      if (!res?.success) {
        showSwalAlert("Error", res?.error || "Failed to load candidates", "error");
      } else {
        setCandidates(res.students || []);
        setSelected({});
      }
    } catch {
      showSwalAlert("Error", "Failed to load candidates", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleOne = (sid) => {
    setSelected((prev) => {
      const c = { ...prev };
      if (c[sid]) delete c[sid];
      else c[sid] = true;
      return c;
    });
  };

  const toggleAll = () => {
    if (!candidates.length) return;

    const allSelected = selectedCount === candidates.length;
    if (allSelected) {
      setSelected({});
      return;
    }

    const next = {};
    for (const s of candidates) next[String(s.studentId)] = true;
    setSelected(next);
  };

  const confirmAndSubmit = async (action) => {
    const studentIds = Object.keys(selected);
    if (studentIds.length === 0) {
      showSwalAlert("Info", "Select at least one student", "info");
      return;
    }

    const courseName = filteredCourses.find((c) => String(c._id) === String(courseId))?.name || "Course";
    //console.log(targetAcYear)
    const acYearLabel = String(targetAcYear)?.acYear || "Selected Year";

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
      html = `This will mark <b>${studentIds.length}</b> student(s) as <b>Completed</b> for <b>${courseName}</b> in <b>${acYearLabel}</b> and create only <b>Certificate Print Fee</b> invoice (₹${CERTIFICATE_PRINT_FEE}).`;
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
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      // ✅ backend should handle these policies:
      // PROMOTE / NOT_PROMOTE / COMPLETE
      const resp = await promoteBulk({
        schoolId,
        targetAcYear,
        courseId,
        studentIds,
        policy: action,
        requireFeesPaid: true,
        chunkSize: 10,

        // ✅ for COMPLETE we send certificate fee so backend can create invoice
        certificateFee: action === "COMPLETE" ? CERTIFICATE_PRINT_FEE : 0,
      });

      if (!resp?.success) {
        showSwalAlert("Error", resp?.error || "Action failed", "error");
      } else {
        const s = resp.summary;
        showSwalAlert(
          "Success",
          `Done. Promoted: ${s.promoted}, Skipped: ${s.skipped}, Errors: ${s.errors?.length || 0}`,
          "success"
        );
        loadCandidates();
      }
    } catch (e) {
      showSwalAlert("Error", "Action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto pb-28">
      <div className="flex items-center gap-3 mb-3">
        <div>{LinkIcon("/dashboard/students", "Back")}</div>
        <h2 className="pl-2 text-lg font-semibold text-left">Bulk Promote</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 mt-4">
        {/* Academic Year */}
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

        {/* Course Type */}
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

        {/* Course */}
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

        {/* Load Button */}
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

      <div className="border rounded">
        <div className="grid grid-cols-12 p-2 font-bold text-xs bg-gray-100">
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
          <div className="col-span-3">Roll</div>
          <div className="col-span-4">Student</div>
          <div className="col-span-2">From Year</div>
          <div className="col-span-2">Status</div>
        </div>

        {candidates.map((s) => {
          const checked = !!selected[String(s.studentId)];
          return (
            <div key={s.studentId} className="grid grid-cols-12 p-2 border-t text-xs items-center">
              <div className="col-span-1 grid place-items-center">
                <input type="checkbox" checked={checked} onChange={() => toggleOne(String(s.studentId))} />
              </div>
              <div className="col-span-3">{s.rollNumber || "-"}</div>
              <div className="col-span-4 font-semibold text-slate-800">{s.name || "-"}</div>
              <div className="col-span-2">{s.fromYear || "-"}</div>
              <div className="col-span-2">{s.fromStatus || "-"}</div>
            </div>
          );
        })}

        {!candidates.length && <div className="p-4 text-sm text-gray-600">No students loaded.</div>}
      </div>

      {/* ✅ Bottom bar with 3 actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">
            Selected Students : <span className="font-semibold text-slate-900">{selectedCount}</span>
          </div>

          <div className="flex flex-wrap gap-5 w-full sm:w-auto">
            <button
              onClick={() => confirmAndSubmit("PROMOTE")}
              disabled={loading || selectedCount === 0}
              className="flex-1 sm:flex-none rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? "Working..." : `Promote`}
            </button>

            <button
              onClick={() => confirmAndSubmit("NOT_PROMOTE")}
              disabled={loading || selectedCount === 0}
              className="flex-1 sm:flex-none rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              {loading ? "Working..." : `Not Promote`}
            </button>

            <button
              onClick={() => confirmAndSubmit("COMPLETE")}
              disabled={loading || selectedCount === 0}
              className="flex-1 sm:flex-none rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Working..." : `Complete`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
