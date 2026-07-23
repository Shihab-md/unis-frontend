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
import { useAuth } from '../../context/AuthContext'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getInstitutesFromCache } from '../../utils/InstituteHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';
import 'animate.css';
import * as XLSX from 'xlsx';

const List = () => {
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
  const { user } = useAuth();

  let schoolId;
  let schoolName;

  const [excelData, setExcelData] = useState([]);
  const [studentsDataList, setStudentsDataList] = useState("");
  const [processing, setProcessing] = useState(null);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [schId, setSchId] = useState('');

  const [importingStudents, setImportingStudents] = useState(false);
  const importLockRef = useRef(false);

  const ExpandedComponent = ({ data }) => {
    console.log("About : " + data.about)
    return (
      data?.about ?
        <div className='ml-12 p-2 bg-blue-50'>
          <p className='pl-2 text-xs'>
            {"More details : "}
            {data.about ? data.about : ""}
          </p>
        </div>
        : null
    );
  };

  const MySwal = withReactContent(Swal);

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

  useEffect(() => {
    const getCoursesMap = async () => {
      const courses = await getCoursesFromCache();
      setCourses(courses);
    };
    getCoursesMap();
  }, []);

  useEffect(() => {
    const getInstitutesMap = async () => {
      const institutes = await getInstitutesFromCache();
      setInstitutes(institutes);
    };
    getInstitutesMap();
  }, []);

  useEffect(() => {
    const getAcademicYearsMap = async () => {
      const academicYears = await getAcademicYearsFromCache();
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
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
    let selectedCourse = null;
    let selectedYear = null;
    let selectedCourseStatus = null;
    let selectedStatus = null;
    let selectedMaritalStatus = null;
    let selectedHosteller = null;
    let selectedInstitute = null;

    const activeACYearOption =
      academicYears
        .filter((x) => x.active === "Active")
        .map((x) => ({ value: x._id, label: x.acYear }))[0] || null;

    // very important: set default selected value here also
    let selectedACYear = activeACYearOption?.value || null;

    const { value: formValues } = await MySwal.fire({
      background: "url(/bg_card.png)",
      html: (
        <div className="mb-2 h-80 w-full">
          <div className='text-xl font-bold md:mb-1 text-green-600 text-center'>Filter</div>

          <div className='grid grid-cols-4 md:grid-cols-6 gap-x-3 lg:gap-x-3'>
            <span className='col-span-2 md:col-span-3 text-sm mb-1 text-start text-blue-500'>Course</span>
            <span className='text-sm mb-1 text-start text-blue-500'>Year</span>
            <span className='md:col-span-2 text-sm mb-1 text-start text-blue-500'>Course Status</span>

            <Select
              className='col-span-2 md:col-span-3 text-sm text-start mb-3'
              options={courses.map(option => ({
                value: option._id, label: option.name
              }))}
              onChange={(selectedOption) => {
                selectedCourse = selectedOption?.value || null;
              }}
              maxMenuHeight={210}
              placeholder=''
            />

            <Select
              className='text-sm text-start mb-3'
              options={[
                { value: '0', label: '0' },
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' }
              ]}
              onChange={(selectedOption) => {
                selectedYear = selectedOption?.value || null;
              }}
              maxMenuHeight={140}
              placeholder=''
            />

            <Select
              className='md:col-span-2 text-sm text-start mb-3'
              options={[
                { value: 'Admission', label: 'Admission' },
                { value: 'Promoted', label: 'Promoted' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Not-Promoted', label: 'Not-Promoted' }
              ]}
              onChange={(selectedOption) => {
                selectedCourseStatus = selectedOption?.value || null;
              }}
              maxMenuHeight={160}
              placeholder=''
            />
          </div>

          <div className='grid grid-cols-3 gap-x-3 lg:gap-x-5'>
            <span className='col-span-2 text-sm mb-1 text-start text-blue-500'>Institute</span>
            <span className='text-sm mb-1 text-start text-blue-500'>AC year</span>

            <Select
              className='col-span-2 text-sm text-start mb-3'
              options={institutes.map(option => ({
                value: option._id, label: option.name
              }))}
              onChange={(selectedOption) => {
                selectedInstitute = selectedOption?.value || null;
              }}
              maxMenuHeight={140}
              placeholder=''
            />

            <Select
              className="text-sm text-start mb-2"
              options={academicYears.map((option) => ({
                value: option._id,
                label: option.acYear,
              }))}
              defaultValue={activeACYearOption}
              onChange={(selectedOption) => {
                selectedACYear = selectedOption?.value || null;
              }}
              maxMenuHeight={210}
              placeholder=""
            />
          </div>

          <div className='grid grid-cols-3 gap-x-2 lg:gap-x-5'>
            <span className='text-sm mb-1 text-start text-blue-500'>Status</span>
            <span className='text-sm mb-1 text-start text-blue-500'>Marital Status</span>
            <span className='text-sm mb-1 text-start text-blue-500'>Hosteller</span>

            <Select
              className='text-sm text-start mb-3'
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Alumni', label: 'Alumni' },
                { value: 'In-Active', label: 'In-Active' },
                { value: 'Transferred', label: 'Transferred' },
                { value: 'Graduated', label: 'Graduated' },
                { value: 'Discontinued', label: 'Discontinued' }
              ]}
              onChange={(selectedOption) => {
                selectedStatus = selectedOption?.value || null;
              }}
              maxMenuHeight={160}
              placeholder=''
            />

            <Select
              className='text-sm text-start mb-3'
              options={[
                { value: 'Married', label: 'Married' },
                { value: 'Single', label: 'Single' }
              ]}
              onChange={(selectedOption) => {
                selectedMaritalStatus = selectedOption?.value || null;
              }}
              maxMenuHeight={160}
              placeholder=''
            />

            <Select
              className='text-sm text-start mb-3'
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' }
              ]}
              onChange={(selectedOption) => {
                selectedHosteller = selectedOption?.value || null;
              }}
              maxMenuHeight={160}
              placeholder=''
            />
          </div>
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const select1 = selectedCourse || null;
        const select2 = selectedStatus || null;
        const select3 = selectedACYear || null;
        const select4 = selectedMaritalStatus || null;
        const select5 = selectedHosteller || null;
        const select6 = selectedYear || null;
        const select7 = selectedInstitute || null;
        const select8 = selectedCourseStatus || null;

        return [select1, select2, select3, select4, select5, select6, select7, select8];
      }
    });

    if (formValues) {
      if (
        formValues[0] || formValues[1] || formValues[2] || formValues[3]
        || formValues[4] || formValues[5] || formValues[6] || formValues[7]
      ) {
        console.log('Selected values:', formValues);

        const courseId = formValues[0] ? formValues[0] : null;
        const status = formValues[1] ? formValues[1] : null;
        const acYear = formValues[2] ? formValues[2] : null;
        const maritalStatus = formValues[3] ? formValues[3] : null;
        const hosteller = formValues[4] ? formValues[4] : null;
        const year = formValues[5] ? formValues[5] : null;
        const instituteId = formValues[6] ? formValues[6] : null;
        const courseStatus = formValues[7] ? formValues[7] : null;

        console.log(
          'Selected Values : ' + 'courseId:', formValues[0] + ', '
        + 'status:', formValues[1] + ', ' + 'acYear:', formValues[2] + ', '
        + 'maritalStatus:', formValues[3] + ', ' + 'hosteller:', formValues[4] + ', '
        + 'year:', formValues[5] + ', ' + 'instituteId:', formValues[6] + ', ' + 'courseStatus:', formValues[7]
        );

        localStorage.setItem('courseId', courseId);
        localStorage.setItem('status', status);
        localStorage.setItem('acYear', acYear);
        localStorage.setItem('maritalStatus', maritalStatus);
        localStorage.setItem('hosteller', hosteller);
        localStorage.setItem('year', year);
        localStorage.setItem('instituteId', instituteId);
        localStorage.setItem('courseStatus', courseStatus);

        getFilteredStudents();
      } else {
        localStorage.removeItem('students');
        localStorage.removeItem('courseId');
        localStorage.removeItem('status');
        localStorage.removeItem('acYear');
        localStorage.removeItem('maritalStatus');
        localStorage.removeItem('hosteller');
        localStorage.removeItem('year');
        localStorage.removeItem('instituteId');
        localStorage.removeItem('courseStatus');

        getStudents();
      }
    }
  };

  const getFilteredStudents = async () => {
    setFiltering(true);
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "student/byFilter/"
        + localStorage.getItem('schoolId') + "/"
        + localStorage.getItem('courseId') + "/"
        + localStorage.getItem('status') + "/"
        + localStorage.getItem('acYear') + "/"
        + localStorage.getItem('maritalStatus') + "/"
        + localStorage.getItem('hosteller') + "/"
        + localStorage.getItem('year') + "/"
        + localStorage.getItem('instituteId') + "/"
        + localStorage.getItem('courseStatus'),
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
        title: "<h3 style='color:blue; font-size: 25px;'>Import Student Data</h3>",
        input: "file",
        background: "url(/bg_card.png)",
        inputAttributes: {
          accept: ".xlsx, .xls",
          "aria-label": "Upload School Student Data."
        },
        confirmButtonText: "Upload",
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
          title: "Info!",
          html: "<b>No rows found in selected Excel file.</b>",
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
        title: "Importing Students...",
        html: `<b>Preparing ${totalRows} rows in ${totalChunks} chunks...</b>`,
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
            title: "Importing Students...",
            html: `
              <div style="font-weight:bold;">Chunk ${i + 1} / ${totalChunks}</div>
              <div style="margin-top:8px;">Rows ${startRow} - ${endRow}</div>
              <div style="margin-top:8px; font-size:12px; color:#666;">Please do not close or refresh the page.</div>
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
        title: "Success!",
        html: `<b>Imported: ${totalImported}, Duplicates: ${totalDuplicates}, Invalid: ${totalInvalid}, Failed: ${totalFailed}, Total: ${totalRows}</b><br/><br/>Please check the downloaded file:<br/>${fileName}`,
        icon: "success",
        showConfirmButton: true,
        background: "url(/bg_card.png)",
      });

      localStorage.removeItem('students');

      if (
        localStorage.getItem('courseId') ||
        localStorage.getItem('status') ||
        localStorage.getItem('acYear') ||
        localStorage.getItem('maritalStatus') ||
        localStorage.getItem('hosteller') ||
        localStorage.getItem('year') ||
        localStorage.getItem('instituteId') ||
        localStorage.getItem('courseStatus')
      ) {
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
        title: "Error!",
        html: `<b>Chunk import stopped.</b><br/><br/>${error?.message || error}${combinedLogs.length > 0 ? `<br/><br/>Partial result file downloaded:<br/>${partialFileName}` : ""}`,
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
        title: "No unpaid students",
        text: "All students already paid the fees (or no students found).",
        icon: "info",
        background: "url(/bg_card.png)",
      });
      return [];
    }

    const optionsHtml = members
      .map((m) => `<option value="${m._id}">${m.name}</option>`)
      .join("");

    const { value: selectedStudentIds } = await Swal.fire({
      title: "Select Students (Unpaid)",
      html: `
      <select id="studentSelect" multiple size="10"
        style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
        ${optionsHtml}
      </select>
      <div style="margin-top:8px; font-size:12px; color:#666;">
        Hold Ctrl to select multiple students.
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Mark as Paid",
      focusConfirm: false,
      background: "url(/bg_card.png)",
      preConfirm: () => {
        const el = document.getElementById("studentSelect");
        if (!el) return [];

        const ids = Array.from(el.selectedOptions).map((o) => o.value);
        if (ids.length === 0) {
          Swal.showValidationMessage("Please select at least one student.");
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
        title: "No students to remove",
        icon: "info",
        background: "url(/bg_card.png)",
      });
      return [];
    }

    const optionsHtml = members
      .map((m) => `<option value="${m._id}">${m.name}</option>`)
      .join("");

    const { value: selectedStudentIds } = await Swal.fire({
      title: "Select Students (Unpaid)",
      html: `
      <select id="studentSelect" multiple size="10"
        style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
        ${optionsHtml}
      </select>
      <div style="margin-top:8px; font-size:12px; color:#666;">
        Hold Ctrl to select multiple students.
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Remove Students",
      focusConfirm: false,
      background: "url(/bg_card.png)",
      preConfirm: () => {
        const el = document.getElementById("studentSelect");
        if (!el) return [];

        const ids = Array.from(el.selectedOptions).map((o) => o.value);
        if (ids.length === 0) {
          Swal.showValidationMessage("Please select at least one student.");
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
      throw new Error(data?.error || "API request failed");
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
      throw new Error(data?.error || "API request failed");
    }

    return data;
  };

  // ✅ 4) Full flow: pick -> call API -> show result -> navigate
  const handleFeesPaid = async () => {
    try {
      if (!Array.isArray(students) || students.length === 0) {
        await Swal.fire({
          title: "No Students Found",
          text: "No students found in the list.",
          icon: "info",
          background: "url(/bg_card.png)",
        });
        return;
      }

      const selectedStudentIds = await openStudentPicker(students);
      if (!selectedStudentIds.length) return;

      Swal.fire({
        title: "Updating...",
        html: "Please wait…",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        background: "url(/bg_card.png)",
      });

      const result = await postSelectedStudents(selectedStudentIds);

      await Swal.fire({
        title: "Success!",
        text: result?.message || "Fees marked as paid to selected students.",
        icon: "success",
        background: "url(/bg_card.png)",
      });

      window.location.reload();
      return result;
    } catch (err) {
      Swal.fire({
        title: "Error!",
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
          title: "No Students Found",
          text: "No students found in the list.",
          icon: "info",
          background: "url(/bg_card.png)",
        });
        return;
      }

      const selectedStudentIds = await openStudentPickerForRemove(students);
      if (!selectedStudentIds.length) return;

      Swal.fire({
        title: "Updating...",
        html: "Please wait…",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        background: "url(/bg_card.png)",
      });

      const result = await removeSelectedStudents(selectedStudentIds);

      await Swal.fire({
        title: "Success!",
        text: result?.message || "Selected students are removed.",
        icon: "success",
        background: "url(/bg_card.png)",
      });

      window.location.reload();
      return result;
    } catch (err) {
      Swal.fire({
        title: "Error!",
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

      if (
        data &&
        (
          localStorage.getItem('courseId')
          || localStorage.getItem('status')
          || localStorage.getItem('acYear')
          || localStorage.getItem('maritalStatus')
          || localStorage.getItem('hosteller')
          || localStorage.getItem('year')
          || localStorage.getItem('instituteId')
          || localStorage.getItem('courseStatus')
        )
      ) {
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
        localStorage.getItem('courseId')
        || localStorage.getItem('status')
        || localStorage.getItem('acYear')
        || localStorage.getItem('maritalStatus')
        || localStorage.getItem('hosteller')
        || localStorage.getItem('year')
        || localStorage.getItem('instituteId')
        || localStorage.getItem('courseStatus')
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
        const schools = await getSchoolsFromCache();
        setSchools(schools);

        let selectedOptionInSwal;
        const { value: schId } = await MySwal.fire({
          background: "url(/bg_card.png)",
          html: (
            <div className="mb-2 h-80 w-full">
              <div className='text-2xl lg:text-3xl mb-3 text-blue-600'>Select the Niswan</div>
              <Select
                className='text-sm text-start'
                //options={schools.filter((school) => school.code !== 'UN-00-00001' && school.active === 'Active')
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
              return sch.code + " : " + sch.nameEnglish + ", " + sch.districtStateId.district + ", " + sch.districtStateId.state
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
        showSwalAlert("Info!", 'Niswan NOT selected.', "info");
        navigate("/dashboard");
      }
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

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-3 lg:mt-5">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
          Manage Students
          {user.role === "superadmin" || user.role === "hquser" ? (
            <div className="text-xs md:text-base font-semibold text-slate-500">
              {localStorage.getItem("schoolName") || "-"}
            </div>
          ) : null}
          <p className='flex md:grid text-xs md:text-base justify-center text-rose-700'>
            (Records Count : {filteredStudent ? filteredStudent.length : 0})
          </p>
        </h3>
      </div>

      <div className="flex justify-between items-center mt-5 relative">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border lg:shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-1 rounded-l-md`}>
            <input
              type="text"
              placeholder="Search"
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

        {user.role === "superadmin" || user.role === "hquser" ? (
          <div className="ml-1" onClick={() => navigate(`/dashboard/students/bulkpromote`)}>
            {LinkIcon("/dashboard/add-student", "Add")}
          </div>
        ) : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ? (
          <div className="ml-1" onClick={() => navigate(`/dashboard/students/bulkpromote`)}>
            {LinkIcon("#", "Promote")}
          </div>
        ) : null}

        {user.role === "superadmin" || user.role === "hquser" ? (
          <div className="block ml-1 mr-1" onClick={handleRemoveStudents}>
            {LinkIcon("#", "RemoveStudents")}
          </div>
        ) : null}

        {user.role === "superadmin" || user.role === "hquser" ? (
          <div
            className={`block ${importingStudents || processing ? "pointer-events-none opacity-50" : ""}`}
            onClick={handleImport}
          >
            {LinkIcon("#", importingStudents || processing ? "Importing..." : "Import")}
          </div>
        ) : null}
      </div>

      {(localStorage.getItem('courseId') != null && localStorage.getItem('courseId') !== 'null')
        || (localStorage.getItem('year') != null && localStorage.getItem('year') !== 'null')
        || (localStorage.getItem('courseStatus') != null && localStorage.getItem('courseStatus') !== 'null')
        || (localStorage.getItem('instituteId') != null && localStorage.getItem('instituteId') !== 'null')
        || (localStorage.getItem('acYear') != null && localStorage.getItem('acYear') !== 'null')
        || (localStorage.getItem('status') != null && localStorage.getItem('status') !== 'null')
        || (localStorage.getItem('maritalStatus') != null && localStorage.getItem('maritalStatus') !== 'null')
        || (localStorage.getItem('hosteller') != null && localStorage.getItem('hosteller') !== 'null') ? (

        <div className='grid lg:flex mb-2 lg:mt-5 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>Filter Applied: </p>

          <p>
            {localStorage.getItem('courseId') != null && localStorage.getItem('courseId') !== 'null' ? (
              <span className='text-blue-500'>
                Course: <span className='text-gray-500'>
                  {courses.filter(course => course._id === localStorage.getItem('courseId')).map(course => course.name) + ", "}
                </span>
              </span>
            ) : null}
          </p>

          <div className='grid grid-cols-1 md:flex'>
            <p className='lg:ml-3'>
              {localStorage.getItem('year') != null && localStorage.getItem('year') !== 'null' ? (
                <span className='text-blue-500'>
                  Year: <span className='text-gray-500'>{localStorage.getItem('year') + ", "}</span>
                </span>
              ) : null}
            </p>

            <p className='lg:ml-3'>
              {localStorage.getItem('courseStatus') != null && localStorage.getItem('courseStatus') !== 'null' ? (
                <span className='text-blue-500'>
                  Course's Status: <span className='text-gray-500'>{localStorage.getItem('courseStatus') + ", "}</span>
                </span>
              ) : null}
            </p>

            <p className='lg:ml-3'>
              {localStorage.getItem('instituteId') != null && localStorage.getItem('instituteId') !== 'null' ? (
                <span className='text-blue-500'>
                  Institute: <span className='text-gray-500'>
                    {institutes.filter(institute => institute._id === localStorage.getItem('instituteId')).map(institute => institute.name) + ", "}
                  </span>
                </span>
              ) : null}
            </p>

            <p className='lg:ml-3'>
              {localStorage.getItem('acYear') != null && localStorage.getItem('acYear') !== 'null' ? (
                <span className='text-blue-500'>
                  AC Year: <span className='text-gray-500'>
                    {academicYears.filter(acYear => acYear._id === localStorage.getItem('acYear')).map(acYear => acYear.acYear) + ", "}
                  </span>
                </span>
              ) : null}
            </p>

            <p className='lg:ml-3'>
              {localStorage.getItem('status') != null && localStorage.getItem('status') !== 'null' ? (
                <span className='text-blue-500'>
                  Student's Status: <span className='text-gray-500'>{localStorage.getItem('status') + ", "}</span>
                </span>
              ) : null}
            </p>

            <p className='lg:ml-3'>
              {localStorage.getItem('maritalStatus') != null && localStorage.getItem('maritalStatus') !== 'null' ? (
                <span className='text-blue-500'>
                  Marital Status: <span className='text-gray-500'>{localStorage.getItem('maritalStatus') + ", "}</span>
                </span>
              ) : null}
            </p>

            <p className='lg:ml-3'>
              {localStorage.getItem('hosteller') != null && localStorage.getItem('hosteller') !== 'null' ? (
                <span className='text-blue-500'>
                  Hostel: <span className='text-gray-500'>{localStorage.getItem('hosteller')}</span>
                </span>
              ) : null}
            </p>
          </div>
        </div>
      ) : (
        <div className='flex mt-3 lg:mt-5 mb-2'></div>
      )}

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