import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, StudentButtons, StudentCard, conditionalRowStyles } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  getSpinner,
  getPrcessing,
  checkAuth,
  LinkIcon,
  showSwalAlert,
  getFilterGif
} from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';
import { FaUndo } from 'react-icons/fa';
import StudentFilterPopup from './StudentFilterPopup';
import {
  STUDENT_FILTER_KEYS, cleanStudentFilterValue, getStudentPopupFilters,
  getStudentResetFilters, saveStudentFilters,
} from '../../utils/studentFilterUtils';
import { useAuth } from '../../context/AuthContext'
import { PERMISSIONS } from '../../auth/permissions'
import { isGlobalHqReadRole } from "../../auth/roles";
import { AutoText, useLanguage } from '../../i18n/LanguageContext';
import { getSchools, getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getInstitutesFromCache } from '../../utils/InstituteHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';
import 'animate.css';
import * as XLSX from 'xlsx';

const List = () => {
  const { tr, direction, fontFamily, language } = useLanguage();
  const IMPORT_CHUNK_SIZE = 20;

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [schools, setSchools] = useState([]);
  const [inputOptions, setInputOptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [prevStudents, setPrevStudents] = useState([]);
  const [supLoading, setSupLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [showFilter, setShowFilter] = useState(null);
  const [filteredStudent, setFilteredStudents] = useState(null);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);

  const navigate = useNavigate();
  const { user, can } = useAuth();

  const userRole = String(user?.role || "").toLowerCase();

  const canAddStudent =
    can(PERMISSIONS.STUDENT_CREATE) &&
    (userRole === "superadmin" || userRole === "hqadmin");

  let schoolId;
  let schoolName;

  const [excelData, setExcelData] = useState([]);
  const [studentsDataList, setStudentsDataList] = useState("");
  const [processing, setProcessing] = useState(null);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [schId, setSchId] = useState('');

  const [importingStudents, setImportingStudents] = useState(false);
  const importLockRef = useRef(false);
  const filterOptionsPromiseRef = useRef(null);

  const ExpandedComponent = ({ data }) => {
    console.log("About : " + data.about)
    return (
      data?.about ?
        <div className='ml-12 p-2 bg-blue-50'>
          <p className='pl-2 text-xs'>
            {tr("More details") + " : "}
            {data.about ? data.about : ""}
          </p>
        </div>
        : null
    );
  };

  const MySwal = withReactContent(Swal);

  const getCleanStorageValue = (key) => {
    return cleanStudentFilterValue(localStorage.getItem(key));
  };

  const hasStudentFilterApplied = () => {
    return STUDENT_FILTER_KEYS.some((key) => getCleanStorageValue(key));
  };

  const getFilterPathValue = (key) => {
    return getCleanStorageValue(key) || "null";
  };

  const getAcademicYearLabelById = (id) => {
    const cleanId = String(id || "").trim();
    if (!cleanId) return "";

    return (
      academicYears.find((academicYear) => String(academicYear?._id) === cleanId)?.acYear || ""
    );
  };

  const getCurrentAcademicYearInfo = () => {
    const filteredAcYearId = getCleanStorageValue('acYear');
    const activeAcYear = academicYears.find((academicYear) => academicYear?.active === "Active");

    if (filteredAcYearId) {
      return {
        label: getAcademicYearLabelById(filteredAcYearId) || tr("Selected AC Year"),
        mode: tr("Filtered AC Year"),
        isFiltered: true,
      };
    }

    return {
      label: activeAcYear?.acYear || tr("Loading AC Year..."),
      mode: tr("Active AC Year"),
      isFiltered: false,
    };
  };

  const safeParseJSON = (value, fallback = null) => {
    try {
      if (!value) return fallback;
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  };

  const getStudentContactNumber = (student) => {
    return student.fatherNumber
      ? student.fatherNumber
      : student.motherNumber
        ? student.motherNumber
        : student.guardianNumber
          ? student.guardianNumber
          : "-";
  };

  const getStudentParentOrGuardianName = (student) => {
    return student.fatherName
      ? student.fatherName
      : student.motherName
        ? student.motherName
        : student.guardianName
          ? student.guardianName
          : "";
  };

  const getCourseStatusForSearch = (course, student) => {
    const status = String(course?.status || "").trim();

    if (String(student?.active || "") === "Alumni" && status === "Completed") {
      return "Completed / Alumni";
    }

    if (status === "Not Promoted") return "Not-Promoted";
    if (status) return status;

    return "";
  };

  const buildCourseSearchText = (courses = [], student = {}) => {
    if (!Array.isArray(courses) || courses.length === 0) return "";

    return courses
      .map((course) => {
        return [
          course?.name || "",
          course?.years || course?.years === 0 ? String(course.years) : "",
          getCourseStatusForSearch(course, student),
        ]
          .filter(Boolean)
          .join(" ");
      })
      .join(", ");
  };

  const mapStudentForList = (student, sno, onStudentDelete) => {
    const normalizedCourses =
      student.courses && student.courses?.length > 0 ? student.courses : [];

    return {
      _id: student._id,
      sno,
      name: student.userId?.name,
      schoolName: student.schoolId?.nameEnglish,
      rollNumber: student.rollNumber,
      doa: student.doa,
      dob: student.dob,
      address: student.address,
      city: student.city,
      district: student.districtStateId
        ? student.districtStateId?.district + ", " + student.districtStateId?.state
        : "",
      active: student.active,
      feesPaid: student.feesPaid,
      remarks: student.remarks,
      about: student.about,
      gender: student.gender,
      maritalStatus: student.maritalStatus,
      hostel: student.hostel,

      // used for search
      course: buildCourseSearchText(normalizedCourses, student),

      // used for Course / Year / Status table
      courses: normalizedCourses,

      contactNumber: getStudentContactNumber(student),
      fatherName: getStudentParentOrGuardianName(student),

      action: (
        <StudentButtons
          Id={student._id}
          onStudentDelete={onStudentDelete}
          student={{ ...student, courses: normalizedCourses }}
        />
      ),
    };
  };

  const downloadTextFile = (content, fileName) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const chunkArray = (items = [], size = 20) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  };

  const shiftResultRowNumbers = (text = "", offset = 0) => {
    return String(text || "").replace(/Row\s*:\s*(\d+)/g, (_, n) => {
      return `Row : ${Number(n) + offset}`;
    });
  };

  const loadFilterOptions = () => {
    if (!filterOptionsPromiseRef.current) {
      filterOptionsPromiseRef.current = Promise.all([
        getCoursesFromCache(), getInstitutesFromCache(), getAcademicYearsFromCache(),
      ]).then(([loadedCourses, loadedInstitutes, loadedAcademicYears]) => {
        if (![loadedCourses, loadedInstitutes, loadedAcademicYears].every(Array.isArray)) {
          throw new Error("Filter options could not be loaded");
        }
        const options = {
          courses: Array.isArray(loadedCourses) ? loadedCourses : [],
          institutes: Array.isArray(loadedInstitutes) ? loadedInstitutes : [],
          academicYears: Array.isArray(loadedAcademicYears) ? loadedAcademicYears : [],
        };
        setCourses(options.courses);
        setInstitutes(options.institutes);
        setAcademicYears(options.academicYears);
        return options;
      }).catch((error) => {
        filterOptionsPromiseRef.current = null;
        throw error;
      });
    }
    return filterOptionsPromiseRef.current;
  };

  useEffect(() => {
    loadFilterOptions().catch(() => {});
  }, []);

  function NiswanSelect({ options, onChange, selectedValues }) {
    return (
      <Select
        options={
          options.filter(option => option.active === 'Active').map((option) => ({
            value: option._id, label: option.code + " : " + option.nameEnglish
          }))
        }
        selectedValues={selectedOptions}
      />
    );
  }

  const handleSelectChange = (option) => {
    setSelectedOptions(option);
  };

  const openFilterPopup = async () => {
    try {
      const options = await loadFilterOptions();
      let draft = getStudentPopupFilters(options.academicYears, localStorage);
      const formRef = React.createRef();
      const { isConfirmed, value: values } = await MySwal.fire({
        background: "url(/bg_card.png)",
        html: <StudentFilterPopup
          ref={formRef}
          {...options}
          tr={tr}
          direction={direction}
          fontFamily={fontFamily}
          initialValues={draft}
          getResetValues={() => getStudentResetFilters(options.academicYears)}
          onChange={(next) => { draft = next; }}
        />,
        focusConfirm: false,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: tr("Apply"),
        cancelButtonText: tr("Cancel"),
        denyButtonText: `&#8634; ${tr("Reset")}`,
        denyButtonColor: "#64748b",
        preDeny: () => {
          formRef.current?.reset();
          return false;
        },
        preConfirm: () => draft,
      });
      if (!isConfirmed || !values) return;
      saveStudentFilters(values, localStorage);
      if (hasStudentFilterApplied()) await getFilteredStudents();
      else await getStudents();
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || tr("Error!"), "error");
    }
  };

  const getFilteredStudents = async () => {
    setFiltering(true);
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "student/byFilter/"
        + localStorage.getItem('schoolId') + "/"
        + getFilterPathValue('courseId') + "/"
        + getFilterPathValue('status') + "/"
        + getFilterPathValue('acYear') + "/"
        + getFilterPathValue('maritalStatus') + "/"
        + getFilterPathValue('hosteller') + "/"
        + getFilterPathValue('year') + "/"
        + getFilterPathValue('instituteId') + "/"
        + getFilterPathValue('courseStatus'),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (responnse.data.success) {
        // let sno = 1;
        // const data = responnse.data.students.map((student) => ({
        //   _id: student._id,
        //   sno: sno++,
        //   name: student.userId?.name,
        //   schoolName: student.schoolId?.nameEnglish,
        //   rollNumber: student.rollNumber,
        //   doa: student.doa,
        //   dob: student.dob,
        //   address: student.address,
        //   city: student.city,
        //   district: student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.state : "",
        //   active: student.active,
        //   feesPaid: student.feesPaid,
        //   remarks: student.remarks,
        //   about: student.about,
        //   gender: student.gender,
        //   maritalStatus: student.maritalStatus,
        //   hostel: student.hostel,
        //   course: student.courses && student.courses?.length > 0
        //     ? student.courses.map(course => course.name ? course.name + "(" + course.years + ")" + ", " : "")
        //     : "",
        //   courses: student.courses && student.courses?.length > 0 ? student.courses : null,
        //   fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
        //   action: (<StudentButtons Id={student._id} />),
        // }));

        let sno = 1;
        const data = responnse.data.students.map((student) =>
          mapStudentForList(student, sno++, getFilteredStudents)
        );

        setStudents(data);
        setFilteredStudents(data);
        localStorage.removeItem('students');
        localStorage.setItem('students', JSON.stringify(responnse.data));
      }
    } catch (error) {
      console.log(error.message);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    } finally {
      setFiltering(false);
    }
  };

  const handleImport = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (importLockRef.current || importingStudents || processing) {
      return;
    }

    importLockRef.current = true;
    setImportingStudents(true);

    let combinedLogs = [];
    let totalImported = 0;
    let totalDuplicates = 0;
    let totalInvalid = 0;
    let totalFailed = 0;
    let totalRows = 0;
    let completedChunks = 0;
    let totalChunks = 0;

    try {
      const { value: file } = await Swal.fire({
        title: `<h3 style='color:blue; font-size: 25px;'>${tr("Import Student Data")}</h3>`,
        input: "file",
        background: "url(/bg_card.png)",
        inputAttributes: {
          accept: ".xlsx, .xls",
          "aria-label": tr("Upload School Student Data.")
        },
        confirmButtonText: tr("Upload"),
        showCancelButton: true,
        showClass: { popup: `animate__animated animate__fadeInUp animate__faster` },
        hideClass: { popup: `animate__animated animate__fadeOutDown animate__faster` }
      });

      if (!file) {
        return;
      }

      setProcessing(true);

      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, {
        defval: "",
        raw: true
      });

      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        setProcessing(false);
        await Swal.fire({
          title: tr("Info!"),
          html: `<b>${tr("No rows found in selected Excel file.")}</b>`,
          icon: "info",
          showConfirmButton: true,
          background: "url(/bg_card.png)",
        });
        return;
      }

      const chunks = chunkArray(rawRows, IMPORT_CHUNK_SIZE);
      totalRows = rawRows.length;
      totalChunks = chunks.length;

      const baseUrl = (await getBaseUrl()).toString();
      const importSessionId = `UI-IMP-${Date.now()}`;

      Swal.fire({
        title: tr("Importing Students..."),
        html: `<b>${tr("Preparing")} ${totalRows} ${tr("rows")} / ${totalChunks} ${tr("chunks")}...</b>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: "url(/bg_card.png)",
        didOpen: () => {
          Swal.showLoading();
        }
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunkRows = chunks[i];
        const startRow = i * IMPORT_CHUNK_SIZE + 1;
        const endRow = Math.min((i + 1) * IMPORT_CHUNK_SIZE, totalRows);

        if (Swal.isVisible()) {
          Swal.update({
            title: tr("Importing Students..."),
            html: `
              <div style="font-weight:bold;">${tr("Chunk")} ${i + 1} / ${totalChunks}</div>
              <div style="margin-top:8px;">${tr("Rows")} ${startRow} - ${endRow}</div>
              <div style="margin-top:8px; font-size:12px; color:#666;">${tr("Please do not close or refresh the page.")}</div>
            `,
          });
        }

        const response = await fetch(baseUrl + "student/import", {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
            'X-Import-Session-Id': importSessionId,
            'X-Import-Chunk-Number': String(i + 1),
            'X-Import-Chunk-Count': String(totalChunks),
          },
          body: JSON.stringify(chunkRows),
        });

        const resData = await response.json().catch(() => ({}));

        if (!response.ok || !resData?.success) {
          throw new Error(
            `Chunk ${i + 1}/${totalChunks} failed. ${resData?.error || resData?.message || "Unknown error"}`
          );
        }

        completedChunks++;

        totalImported += Number(resData.importedCount || 0);
        totalDuplicates += Number(resData.duplicateCount || 0);
        totalInvalid += Number(resData.invalidCount || 0);
        totalFailed += Number(resData.failedCount || 0);

        const fixedChunkLog = shiftResultRowNumbers(
          resData.finalResultData || "",
          startRow - 1
        );

        combinedLogs.push(
          `===== Chunk ${i + 1}/${totalChunks} | Rows ${startRow}-${endRow} | RequestId: ${resData.requestId || "-"} =====`
        );

        if (fixedChunkLog) {
          combinedLogs.push(fixedChunkLog.trimEnd());
        } else {
          combinedLogs.push("No detailed chunk result.");
        }
      }

      Swal.close();
      setProcessing(false);

      const fileName = `Import_Result_${Date.now()}.txt`;

      const finalText = [
        `Import Session Id: ${importSessionId}`,
        `Summary: Imported: ${totalImported}, Duplicates: ${totalDuplicates}, Invalid: ${totalInvalid}, Failed: ${totalFailed}, Total: ${totalRows}`,
        `Chunk Size: ${IMPORT_CHUNK_SIZE}`,
        `Chunks Completed: ${completedChunks}/${totalChunks}`,
        "",
        ...combinedLogs,
        ""
      ].join("\r\n");

      downloadTextFile(finalText, fileName);

      await Swal.fire({
        title: tr("Success!"),
        html: `<b>Imported: ${totalImported}, Duplicates: ${totalDuplicates}, Invalid: ${totalInvalid}, Failed: ${totalFailed}, Total: ${totalRows}</b><br/><br/>${tr("Please check the downloaded file:")}<br/>${fileName}`,
        icon: "success",
        showConfirmButton: true,
        background: "url(/bg_card.png)",
      });

      localStorage.removeItem('students');

      if (hasStudentFilterApplied()) {
        await getFilteredStudents();
      } else {
        await getStudents();
      }
    } catch (error) {
      Swal.close();
      setProcessing(false);

      const partialFileName = `Import_Result_Partial_${Date.now()}.txt`;
      const partialText = [
        `Summary before failure: Imported: ${totalImported}, Duplicates: ${totalDuplicates}, Invalid: ${totalInvalid}, Failed: ${totalFailed}, Total Processed Chunks: ${completedChunks}/${totalChunks || "-"}`,
        "",
        ...combinedLogs,
        "",
        `ERROR: ${error?.message || error}`
      ].join("\r\n");

      if (combinedLogs.length > 0) {
        downloadTextFile(partialText, partialFileName);
      }

      await Swal.fire({
        title: tr("Error!"),
        html: `<b>${tr("Chunk import stopped.")}</b><br/><br/>${error?.message || error}${combinedLogs.length > 0 ? `<br/><br/>${tr("Partial result file downloaded:")}<br/>${partialFileName}` : ""}`,
        icon: "error",
        showConfirmButton: true,
        background: "url(/bg_card.png)",
      });
    } finally {
      importLockRef.current = false;
      setImportingStudents(false);
    }
  };

  // ✅ 1) Build members list from students (studentId) where feesPaid == 0 (UNPAID)
  const buildUnpaidMembersFromStudents = (students) => {
    const list = Array.isArray(students) ? students : [];

    return list
      .filter((s) => s && s._id && Number(s.feesPaid) === 0)
      .map((s) => ({
        _id: s._id, // studentId
        name: `${s.rollNumber ? s.rollNumber + " - " : ""}${s.name || ""}`.trim(),
      }));
  };

  // ✅ 2) Swal2 multi-select popup (returns selected studentIds)
  const openStudentPicker = async (students = []) => {
    const members = buildUnpaidMembersFromStudents(students);

    if (members.length === 0) {
      await Swal.fire({
        title: tr("No unpaid students"),
        text: tr("All students already paid the fees (or no students found)."),
        icon: "info",
        background: "url(/bg_card.png)",
      });
      return [];
    }

    const optionsHtml = members
      .map((m) => `<option value="${m._id}">${m.name}</option>`)
      .join("");

    const { value: selectedStudentIds } = await Swal.fire({
      title: tr("Select Students (Unpaid)"),
      html: `
      <select id="studentSelect" multiple size="10"
        style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
        ${optionsHtml}
      </select>
      <div style="margin-top:8px; font-size:12px; color:#666;">
        ${tr("Hold Ctrl to select multiple students.")}
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: tr("Mark as Paid"),
      focusConfirm: false,
      background: "url(/bg_card.png)",
      preConfirm: () => {
        const el = document.getElementById("studentSelect");
        if (!el) return [];

        const ids = Array.from(el.selectedOptions).map((o) => o.value);
        if (ids.length === 0) {
          Swal.showValidationMessage(tr("Please select at least one student."));
          return;
        }
        return ids;
      },
    });

    return selectedStudentIds || [];
  };

  const openStudentPickerForRemove = async (students = []) => {
    const members = students;

    if (members.length === 0) {
      await Swal.fire({
        title: tr("No students to remove"),
        icon: "info",
        background: "url(/bg_card.png)",
      });
      return [];
    }

    const optionsHtml = members
      .map((m) => `<option value="${m._id}">${m.name}</option>`)
      .join("");

    const { value: selectedStudentIds } = await Swal.fire({
      title: tr("Select Students (Unpaid)"),
      html: `
      <select id="studentSelect" multiple size="10"
        style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
        ${optionsHtml}
      </select>
      <div style="margin-top:8px; font-size:12px; color:#666;">
        ${tr("Hold Ctrl to select multiple students.")}
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: tr("Remove Students"),
      focusConfirm: false,
      background: "url(/bg_card.png)",
      preConfirm: () => {
        const el = document.getElementById("studentSelect");
        if (!el) return [];

        const ids = Array.from(el.selectedOptions).map((o) => o.value);
        if (ids.length === 0) {
          Swal.showValidationMessage(tr("Please select at least one student."));
          return;
        }
        return ids;
      },
    });

    return selectedStudentIds || [];
  };

  // ✅ 3) Call API with payload key: studentIds
  const postSelectedStudents = async (selectedStudentIds = []) => {
    const base = await getBaseUrl();
    const token = localStorage.getItem("token");

    const resp = await fetch(`${base}student/markFeesPaid`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ studentIds: selectedStudentIds }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || tr("API request failed"));
    }

    return data;
  };

  const removeSelectedStudents = async (selectedStudentIds = []) => {
    const base = await getBaseUrl();
    const token = localStorage.getItem("token");

    const resp = await fetch(`${base}student/removeStudents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ studentIds: selectedStudentIds }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || tr("API request failed"));
    }

    return data;
  };

  // ✅ 4) Full flow: pick -> call API -> show result -> navigate
  const handleFeesPaid = async () => {
    try {
      if (!Array.isArray(students) || students.length === 0) {
        await Swal.fire({
          title: tr("No Students Found"),
          text: tr("No students found in the list."),
          icon: "info",
          background: "url(/bg_card.png)",
        });
        return;
      }

      const selectedStudentIds = await openStudentPicker(students);
      if (!selectedStudentIds.length) return;

      Swal.fire({
        title: tr("Updating..."),
        html: tr("Please wait…"),
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        background: "url(/bg_card.png)",
      });

      const result = await postSelectedStudents(selectedStudentIds);

      await Swal.fire({
        title: tr("Success!"),
        text: result?.message || tr("Fees marked as paid to selected students."),
        icon: "success",
        background: "url(/bg_card.png)",
      });

      window.location.reload();
      return result;
    } catch (err) {
      Swal.fire({
        title: tr("Error!"),
        text: err?.message || String(err),
        icon: "error",
        background: "url(/bg_card.png)",
      });
    }
  };

  const handleRemoveStudents = async () => {
    try {
      if (!Array.isArray(students) || students.length === 0) {
        await Swal.fire({
          title: tr("No Students Found"),
          text: tr("No students found in the list."),
          icon: "info",
          background: "url(/bg_card.png)",
        });
        return;
      }

      const selectedStudentIds = await openStudentPickerForRemove(students);
      if (!selectedStudentIds.length) return;

      Swal.fire({
        title: tr("Updating..."),
        html: tr("Please wait…"),
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        background: "url(/bg_card.png)",
      });

      const result = await removeSelectedStudents(selectedStudentIds);

      await Swal.fire({
        title: tr("Success!"),
        text: result?.message || tr("Selected students are removed."),
        icon: "success",
        background: "url(/bg_card.png)",
      });

      window.location.reload();
      return result;
    } catch (err) {
      Swal.fire({
        title: tr("Error!"),
        text: err?.message || String(err),
        icon: "error",
        background: "url(/bg_card.png)",
      });
    }
  };

  useEffect(() => {
    if (checkAuth("studentsList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const fetchStudents = async () => {
      const data = localStorage.getItem('students');
      console.log(
        "Course Id : " + localStorage.getItem('courseId')
        + ", Status : " + localStorage.getItem('status')
        + ", AC Year : " + localStorage.getItem('acYear')
        + ", maritalStatus : " + localStorage.getItem('maritalStatus')
        + ", hosteller : " + localStorage.getItem('hosteller')
        + ", year : " + localStorage.getItem('year')
        + ", instituteId : " + localStorage.getItem('instituteId')
        + ", courseStatus : " + localStorage.getItem('courseStatus')
      );

      if (hasStudentFilterApplied()) {
        console.log("111");
        getFilteredStudents();
      } else {
        console.log("222");
        getStudents();
      }
    };

    fetchStudents();
  }, []);

  const getStudents = async () => {
    const onStudentDelete = () => {
      const data = localStorage.getItem('students');
      if (data) {
        console.log("333");
        getFilteredStudents();
      } else {
        console.log("444");
        getStudents();
      }
    };

    const data = localStorage.getItem('students');
    const parsedLocalData = safeParseJSON(data, null);
    console.log("Existing Data - ", parsedLocalData);

    if (
      parsedLocalData &&
      (
        hasStudentFilterApplied()
      )
    ) {
      // let sno = 1;
      // const data1 = parsedLocalData.students.map((student) => ({
      //   _id: student._id,
      //   sno: sno++,
      //   name: student.userId?.name,
      //   schoolName: student.schoolId?.nameEnglish,
      //   rollNumber: student.rollNumber,
      //   doa: student.doa,
      //   dob: student.dob,
      //   address: student.address,
      //   city: student.city,
      //   district: student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.state : "",
      //   active: student.active,
      //   feesPaid: student.feesPaid,
      //   remarks: student.remarks,
      //   about: student.about,
      //   gender: student.gender,
      //   maritalStatus: student.maritalStatus,
      //   hostel: student.hostel,
      //   course: student.courses && student.courses?.length > 0
      //     ? student.courses.map(course => course.name ? course.name + "(" + course.years + ")" + ", " : "")
      //     : "",
      //   courses: student.courses && student.courses?.length > 0 ? student.courses : null,
      //   fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
      //   action: (<StudentButtons Id={student._id} onStudentDelete={onStudentDelete} />),
      // }));

      let sno = 1;
      const data1 = parsedLocalData.students.map((student) =>
        mapStudentForList(student, sno++, onStudentDelete)
      );

      setStudents(data1);
      setFilteredStudents(data1);
      console.log("Data from local storage");
    } else {
      console.log("schoolId : " + localStorage.getItem('schoolId'));

      if (!localStorage.getItem('schoolId')) {
        // Supervisor must see only Niswans assigned to that Supervisor.
        // Other read roles keep the existing cached Niswan source.
        const loadedSchools = userRole === "supervisor"
          ? await getSchools()
          : await getSchoolsFromCache();
        const schools = Array.isArray(loadedSchools) ? loadedSchools : [];
        setSchools(schools);

        let selectedOptionInSwal;
        const { value: schId } = await MySwal.fire({
          background: "url(/bg_card.png)",
          html: (
            <div className="mb-2 h-80 w-full">
              <div
                dir={direction}
                style={{ fontFamily }}
                className={`mb-3 font-semibold text-blue-600 ${
                  language === "ta"
                    ? "text-sm sm:text-base lg:text-lg"
                    : "text-lg sm:text-xl lg:text-2xl"
                }`}
              >
                {tr("Select the Niswan")}
              </div>
              <Select
                className='text-sm text-start'
                //options={schools.filter((school) => school.active === 'Active')
                options={schools.filter((school) => school.active === 'Active')
                  .map(option => ({
                    value: option._id, label: option.code + " : " + option.nameEnglish
                  }))}
                onChange={(selectedOption) => {
                  selectedOptionInSwal = selectedOption;
                }}
                maxMenuHeight={230}
                placeholder=''
              />
            </div>
          ),
          focusConfirm: false,
          showCancelButton: true,
          width: '800px',
          preConfirm: () => {
            return selectedOptionInSwal ? selectedOptionInSwal.value : null;
          },
        });

        console.log("schId : " + schId);
        if (schId) {
          setSchId(schId);
          schoolId = schId;
          localStorage.setItem('schoolId', schoolId);
          console.log(schoolId);

          schoolName = schools.filter(school => school._id === schoolId)
            .map((sch) => {
              const district = sch?.districtStateId?.district || "";
              const state = sch?.districtStateId?.state || "";
              const location = [district, state].filter(Boolean).join(", ");
              return `${sch?.code || ""} : ${sch?.nameEnglish || ""}${location ? `, ${location}` : ""}`;
            });
          localStorage.setItem('schoolName', schoolName);
          console.log(schoolName);
        }
      } else {
        schoolId = localStorage.getItem('schoolId');
      }

      setSupLoading(true);
      if (schoolId) {
        setFilteredStudents(null);
        try {
          const responnse = await axios.get(
            (await getBaseUrl()).toString() + "student/bySchoolId/" + schoolId,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (responnse.data.success) {
            // let sno = 1;
            // const data = responnse.data.students.map((student) => ({
            //   _id: student._id,
            //   sno: sno++,
            //   name: student.userId?.name,
            //   schoolName: student.schoolId?.nameEnglish,
            //   rollNumber: student.rollNumber,
            //   doa: student.doa,
            //   dob: student.dob,
            //   address: student.address,
            //   city: student.city,
            //   district: student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.state : "",
            //   active: student.active,
            //   feesPaid: student.feesPaid,
            //   remarks: student.remarks,
            //   about: student.about,
            //   gender: student.gender,
            //   maritalStatus: student.maritalStatus,
            //   hostel: student.hostel,
            //   course: student.courses && student.courses?.length > 0
            //     ? student.courses.map(course => course.name ? course.name + "(" + course.years + ")" + ", " : "")
            //     : "",
            //   courses: student.courses && student.courses?.length > 0 ? student.courses : null,
            //   contactNumber: student.fatherNumber ? student.fatherNumber : student.motherNumber ? student.motherNumber : student.guardianNumber ? student.guardianNumber : "-",
            //   fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
            //   action: (<StudentButtons Id={student._id} onStudentDelete={onStudentDelete} />),
            // }));

            let sno = 1;
            const data = responnse.data.students.map((student) =>
              mapStudentForList(student, sno++, onStudentDelete)
            );

            setStudents(data);
            setFilteredStudents(data);
            localStorage.removeItem('students');
            localStorage.setItem('students', JSON.stringify(responnse.data));
          }
        } catch (error) {
          console.log(error.message);
          if (error.response && !error.response.data.success) {
            showSwalAlert("Error!", error.response.data.error, "error");
            navigate("/dashboard");
          }
        } finally {
          setSupLoading(false);
        }
      } else {
        showSwalAlert("Info!", tr("Niswan NOT selected."), "info");
        navigate("/dashboard");
      }
    }
  };

  const handleResetFilters = async () => {
    try {
      const options = await loadFilterOptions();
      saveStudentFilters(getStudentResetFilters(options.academicYears), localStorage);
      if (hasStudentFilterApplied()) await getFilteredStudents();
      else await getStudents();
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || tr("Error!"), "error");
    }
  };

  const handleSearch = (e) => {
    const records = students.filter((student) => (
      student.rollNumber?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.course?.toString().toLowerCase().includes(e.target.value.toLowerCase())
      || student.active?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.fatherName?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.district?.toLowerCase().includes(e.target.value.toLowerCase())
    ));
    setFilteredStudents(records);
  };

  if (!filteredStudent) {
    return getSpinner();
  }

  if (processing) {
    return getPrcessing();
  }

  const currentAcademicYearInfo = getCurrentAcademicYearInfo();
  const isFilterApplied = hasStudentFilterApplied();

  const academicYearBadge = (
    <div className="flex justify-center">
      <div
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${currentAcademicYearInfo.isFiltered
          ? "text-blue-700" : "text-blue-700"}`}
        title={`Students shown for ${currentAcademicYearInfo.mode}: ${currentAcademicYearInfo.label}`}
        aria-label={`Students shown for ${currentAcademicYearInfo.mode}: ${currentAcademicYearInfo.label}`}
      >
        <span>{currentAcademicYearInfo.mode}:</span>
        <span className="ml-1 text-slate-700">{currentAcademicYearInfo.label}</span>
      </div>
    </div>
  );

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeInstitutes = Array.isArray(institutes) ? institutes : [];
  const safeAcademicYears = Array.isArray(academicYears) ? academicYears : [];

  return (
    <div dir={direction} style={{ fontFamily }} className="p-3 lg:p-5 bg-repeat mt-3">
      <div className="text-center">
        <AutoText as="h3" text={tr("Manage Students")} variant="heading" className="font-bold px-5 py-0 text-gray-600" />
        {isGlobalHqReadRole(user.role) ? (
          <div className="text-xs md:text-base font-semibold text-slate-500" dir="auto">
            {localStorage.getItem("schoolName") || "-"}
          </div>
        ) : null}
        <p className='text-xs sm:text-sm justify-center text-rose-700'>
          ({tr("Records Count")} : {filteredStudent ? filteredStudent.length : 0})
        </p>
      </div>

      <div className="flex justify-between items-center mt-5 relative">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border lg:shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-1 rounded-l-md`}>
            <input
              type="text"
              placeholder={tr("Search")}
              className="w-full px-3 py-0.5 border rounded shadow-md justify-center mr-1 lg:mr-0"
              onChange={handleSearch}
            />
          </div>
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        <div className="mr-1" onClick={openFilterPopup}>
          {LinkIcon("#", "Filter")}
        </div>

        {canAddStudent ? (
          <div className="ml-1" onClick={() => navigate(`/dashboard/add-student`)}>
            {LinkIcon("#", "Add")}
          </div>
        ) : null}

        {can(PERMISSIONS.STUDENT_PROMOTE) ? (
          <div className="ml-1" onClick={() => navigate(`/dashboard/students/bulkpromote`)}>
            {LinkIcon("#", "Promote")}
          </div>
        ) : null}

        {can(PERMISSIONS.STUDENT_CLEANUP) ? (
          <div className="block ml-1 mr-1" onClick={handleRemoveStudents}>
            {LinkIcon("#", "RemoveStudents")}
          </div>
        ) : null}

        {can(PERMISSIONS.STUDENT_IMPORT) ? (
          <div
            className={`block ${importingStudents || processing ? "pointer-events-none opacity-50" : ""}`}
            onClick={handleImport}
          >
            {LinkIcon("#", importingStudents || processing ? "Importing..." : "Import")}
          </div>
        ) : null}
      </div>

      <div className="mt-3 lg:mt-5 mb-2 space-y-2">
        {isFilterApplied ? (
          <div className='grid lg:flex text-xs text-lime-600 items-center justify-center'>
            <div className="flex items-center justify-center gap-2 lg:mr-3">
              <p className='justify-center text-center font-semibold'>{tr("Filter Applied:")}</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-100"
                title={tr("Reset")}
                aria-label={tr("Reset")}
                disabled={filtering}
              >
                <FaUndo aria-hidden="true" className="mr-1 inline" />
                {tr("Reset")}
              </button>
            </div>

            <p>
              {getCleanStorageValue('courseId') ? (
                <span className='text-blue-500'>
                  {tr("Course")}: <span className='text-gray-500'>
                    {courses.filter(course => course._id === getCleanStorageValue('courseId')).map(course => course.name) + ", "}
                  </span>
                </span>
              ) : null}
            </p>

            <div className='grid grid-cols-1 md:flex md:flex-wrap justify-center'>
              <p className='lg:ml-3'>
                {getCleanStorageValue('year') ? (
                  <span className='text-blue-500'>
                    {tr("Year")}: <span className='text-gray-500'>{getCleanStorageValue('year') + ", "}</span>
                  </span>
                ) : null}
              </p>

              <p className='lg:ml-3'>
                {getCleanStorageValue('courseStatus') ? (
                  <span className='text-blue-500'>
                    {tr("Course Status")}: <span className='text-gray-500'>{tr(getCleanStorageValue('courseStatus')) + ", "}</span>
                  </span>
                ) : null}
              </p>

              <p className='lg:ml-3'>
                {getCleanStorageValue('instituteId') ? (
                  <span className='text-blue-500'>
                    {tr("Institute")}: <span className='text-gray-500'>
                      {institutes.filter(institute => institute._id === getCleanStorageValue('instituteId')).map(institute => institute.name) + ", "}
                    </span>
                  </span>
                ) : null}
              </p>

              <p className='lg:ml-3'>
                {getCleanStorageValue('acYear') ? (
                  <span className='text-blue-500'>
                    {tr("AC year")}: <span className='text-gray-500'>
                      {academicYears.filter(acYear => acYear._id === getCleanStorageValue('acYear')).map(acYear => acYear.acYear) + ", "}
                    </span>
                  </span>
                ) : null}
              </p>

              <p className='lg:ml-3'>
                {getCleanStorageValue('status') ? (
                  <span className='text-blue-500'>
                    {tr("Status")}: <span className='text-gray-500'>{tr(getCleanStorageValue('status')) + ", "}</span>
                  </span>
                ) : null}
              </p>

              <p className='lg:ml-3'>
                {getCleanStorageValue('maritalStatus') ? (
                  <span className='text-blue-500'>
                    {tr("Marital Status")}: <span className='text-gray-500'>{tr(getCleanStorageValue('maritalStatus')) + ", "}</span>
                  </span>
                ) : null}
              </p>

              <p className='lg:ml-3'>
                {getCleanStorageValue('hosteller') ? (
                  <span className='text-blue-500'>
                    {tr("Hostel")}: <span className='text-gray-500'>{tr(getCleanStorageValue('hosteller'))}</span>
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ) : (academicYearBadge)}
      </div>

      {filtering ? (
        getFilterGif()
      ) : (
        <>
          {/* Mobile / Tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredStudent.map((row) => (
              <StudentCard key={row._id} row={row} />
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={filteredStudent}
              showGridlines
              highlightOnHover
              striped
              responsive
              conditionalRowStyles={conditionalRowStyles}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default List;
