import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, StudentButtons, conditionalRowStyles } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, getPrcessing, checkAuth, LinkIcon, showSwalAlert, getFilterGif } from '../../utils/CommonHelper';
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

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [schools, setSchools] = useState([]);
  const [inputOptions, setInputOptions] = useState([]);
  const [students, setStudents] = useState([])
  const [prevStudents, setPrevStudents] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [showFilter, setShowFilter] = useState(null);
  const [filteredStudent, setFilteredStudents] = useState(null)
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);

  const navigate = useNavigate()
  const { user } = useAuth()

  let schoolId;
  let schoolName;

  const [excelData, setExcelData] = useState([]);
  const [processing, setProcessing] = useState(null)

  const [selectedOptions, setSelectedOptions] = useState([]);

  const [schId, setSchId] = useState('');

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const getCoursesMap = async (id) => {
      const courses = await getCoursesFromCache(id);
      // console.log(courses);
      setCourses(courses);
    };
    getCoursesMap();
  }, []);

  useEffect(() => {
    const getInstitutesMap = async (id) => {
      const institutes = await getInstitutesFromCache(id);
      // alert(institutes)
      setInstitutes(institutes);
    };
    getInstitutesMap();
  }, []);

  useEffect(() => {
    const getAcademicYearsMap = async (id) => {
      const academicYears = await getAcademicYearsFromCache(id);
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
  }, []);

  function NiswanSelect({ options, onChange, selectedValues }) {
    return <Select options={
      options.map((option) => ({
        value: option._id, label: option.code + " : " + option.nameEnglish
      }
      ))
    }
      //onChange={handleSelectChange}
      selectedValues={selectedOptions} />;
  }

  const handleSelectChange = (option) => {
    setSelectedOptions(option);
  };

  const openFilterPopup = async () => {
    let selectedCourse;
    let selectedYear;
    let selectedStatus;
    let selectedACYear;
    let selectedMaritalStatus;
    let selectedHosteller;
    let selectedInstitute;
    const { value: formValues } = await MySwal.fire({
      //  title: 'Filters',
      background: "url(/bg_card.png)",
      html: (
        <div className="mb-2 h-80 w-full">
          <div className='text-xl font-bold md:mb-1 text-green-600 text-center'>Filter</div>
          <div className='grid grid-cols-3 md:grid-cols-4 gap-x-3 lg:gap-x-5'>
            <span className='col-span-2 md:col-span-3 text-sm mb-1 text-start text-blue-500'>Course</span>
            <span className='text-sm mb-1 text-start text-blue-500'>Year</span>

            <Select className='col-span-2 md:col-span-3 text-sm text-start mb-3'
              options={courses.map(option => ({
                value: option._id, label: option.name
              }))}

              onChange={(selectedOption) => {
                selectedCourse = selectedOption.value;
              }}
              maxMenuHeight={210}
              placeholder=''
            />

            <Select className='text-sm text-start mb-3'
              options={
                [{ value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' }]
              }
              // defaultValue={selectedStatus}
              onChange={(selectedOption) => {
                selectedYear = selectedOption.value;
              }}
              maxMenuHeight={140}
              placeholder=''
            />
          </div>

          <div className='grid grid-cols-3 gap-x-3 lg:gap-x-5'>
            <span className='col-span-2 text-sm mb-1 text-start text-blue-500'>Institute</span>
            <span className='text-sm mb-1 text-start text-blue-500'>AC year</span>

            <Select className='col-span-2 text-sm text-start mb-3'
              options={institutes.map(option => ({
                value: option._id, label: option.name
              }))}
              // defaultValue={selectedStatus}
              onChange={(selectedOption) => {
                selectedInstitute = selectedOption.value;
              }}
              maxMenuHeight={140}
              placeholder=''
            />

            <Select className='text-sm text-start mb-2'
              options={academicYears.map(option => ({
                value: option._id, label: option.acYear
              }))}

              onChange={(selectedOption) => {
                selectedACYear = selectedOption.value;
              }}
              maxMenuHeight={210}
              placeholder=''
            />

          </div>

          <div className='grid grid-cols-3 gap-x-2 lg:gap-x-5'>
            <span className='text-sm mb-1 text-start text-blue-500'>Status</span>
            <span className='text-sm mb-1 text-start text-blue-500'>Marital Status</span>
            <span className='text-sm mb-1 text-start text-blue-500'>Hosteller</span>

            <Select className='text-sm text-start mb-3'
              options={
                [{ value: 'Active', label: 'Active' },
                { value: 'In-Active', label: 'In-Active' },
                { value: 'Transferred', label: 'Transferred' },
                { value: 'Graduated', label: 'Graduated' },
                { value: 'Discontinued', label: 'Discontinued' }]
              }
              // defaultValue={selectedStatus}
              onChange={(selectedOption) => {
                selectedStatus = selectedOption.value;
              }}
              maxMenuHeight={160}
              placeholder=''
            />

            <Select className='text-sm text-start mb-3'
              options={
                [{ value: 'Married', label: 'Married' },
                { value: 'Single', label: 'Single' }]
              }
              // defaultValue={selectedStatus}
              onChange={(selectedOption) => {
                selectedMaritalStatus = selectedOption.value;
              }}
              maxMenuHeight={160}
              placeholder=''
            />

            <Select className='text-sm text-start mb-3'
              options={
                [{ value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' }]
              }
              // defaultValue={selectedStatus}
              onChange={(selectedOption) => {
                selectedHosteller = selectedOption.value;
              }}
              maxMenuHeight={160}
              placeholder=''
            />

          </div>
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      //  width: 700,
      //  scrollbarPadding: false,
      //  heightAuto: false,
      //  grow: true,
      // padding: '0px', // top, right, bottom, left
      //  cancelButtonText: "Reset",
      // cancelButtonAriaLabel: "Clear",
      preConfirm: () => {
        const select1 = selectedCourse ? selectedCourse : null;
        const select2 = selectedStatus ? selectedStatus : null;
        const select3 = selectedACYear ? selectedACYear : null;
        const select4 = selectedMaritalStatus ? selectedMaritalStatus : null;
        const select5 = selectedHosteller ? selectedHosteller : null;
        const select6 = selectedYear ? selectedYear : null;
        const select7 = selectedInstitute ? selectedInstitute : null;
        return [select1, select2, select3, select4, select5, select6, select7];
      }
    });

    if (formValues) {
      if (formValues[0] || formValues[1] || formValues[2] || formValues[3]
        || formValues[4] || formValues[5] || formValues[6]) {

        console.log('Selected values:', formValues);
        const courseId = formValues[0] ? formValues[0] : null;
        const status = formValues[1] ? formValues[1] : null;
        const acYear = formValues[2] ? formValues[2] : null;
        const maritalStatus = formValues[3] ? formValues[3] : null;
        const hosteller = formValues[4] ? formValues[4] : null;
        const year = formValues[5] ? formValues[5] : null;
        const instituteId = formValues[6] ? formValues[6] : null;

        console.log('Selected Values : ' + 'courseId:', formValues[0] + ', '
          + 'status:', formValues[1] + ', ' + 'acYear:', formValues[2] + ', '
        + 'maritalStatus:', formValues[3] + ', ' + 'hosteller:', formValues[4] + ', '
        + 'year:', formValues[5] + ', ' + 'instituteId:', formValues[6])

        localStorage.setItem('courseId', courseId);
        localStorage.setItem('status', status);
        localStorage.setItem('acYear', acYear);
        localStorage.setItem('maritalStatus', maritalStatus);
        localStorage.setItem('hosteller', hosteller);
        localStorage.setItem('year', year);
        localStorage.setItem('instituteId', instituteId);

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

        getStudents();
        // setFilteredStudents(students)
      }
    }
  };

  const getFilteredStudents = async () => {
    setFiltering(true)
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
        + localStorage.getItem('instituteId'),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (responnse.data.success) {
        let sno = 1;
        const data = await responnse.data.students.map((student) => ({
          _id: student._id,
          sno: sno++,
          name: student.userId?.name,
          schoolName: student.schoolId?.nameEnglish,
          rollNumber: student.rollNumber,
          address: student.address,
          city: student.city,
          district: student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.State : "",
          active: student.active,
          course: student.courses && student.courses?.length > 0 ? student.courses.map(course => course.name ? course.name + ", " : "") : "",
          courses: student.courses && student.courses?.length > 0 ? student.courses : null,
          fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
          // action: (<StudentButtons Id={student._id} onStudentDelete={onStudentDelete} />),
          action: (<StudentButtons Id={student._id} />),
        }));
        setStudents(data);
        setFilteredStudents(data);
        localStorage.removeItem('students');
        localStorage.setItem('students', JSON.stringify(responnse.data));
      }

    } catch (error) {
      console.log(error.message)
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
        //  navigate("/dashboard");
      }
    } finally {
      setFiltering(false)
    }
  }

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: "<h3 style='color:blue; font-size: 25px;'>Import Student Data</h3>",
      input: "file",
      background: "url(/bg_card.png)",
      inputAttributes: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        "accept": ".xlsx, .xls",
        "aria-label": "Upload School Student Data."
      },
      showClass: { popup: `animate__animated animate__fadeInUp animate__faster` },
      hideClass: { popup: `animate__animated animate__fadeOutDown animate__faster` }
    });

    if (file) {
      try {
        setProcessing(true);
        const reader = new FileReader();
        //let studentsDataList;
        reader.onload = (event) => {
          const binaryString = event.target.result;
          const workbook = XLSX.read(binaryString, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setExcelData(jsonData);
          //studentsDataList = JSON.stringify(excelData);
        };
        reader.readAsBinaryString(file);

        const studentsDataList = JSON.stringify(excelData);
        if (studentsDataList) {
          alert(studentsDataList)
          const response = await fetch((await getBaseUrl()).toString() + "student/import", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}`, 'Content-Type': 'application/json' },
            body: studentsDataList,
          });

          if (response.ok) {
            setProcessing(false);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = "Import_Result_" + new Date().getTime() + ".txt"
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Swal.fire({
              title: "Success!",
              html: "<b>" + "Successfully Imported! </br> Please check the result in downloaded text file : </br>" + fileName + "</b>",
              icon: "success",
              showConfirmButton: true,
              background: "url(/bg_card.png)",
            });

            navigate("/dashboard/students");
          } else {
            const resData = JSON.parse(JSON.stringify(await response.json()));
            setProcessing(false);
            Swal.fire({
              title: "Error!",
              html: "<b>" + "Data NOT Imported. Error : \n" + resData.error + "</b>",
              icon: "error",
              showConfirmButton: true,
              background: "url(/bg_card.png)",
            });
            console.error('Failed to send data.');
          }
        }
      } catch (error) {
        setProcessing(false);
        Swal.fire({
          title: "Error!",
          html: "<b>" + "Data NOT Imported. Exception : \n" + error + "</b>",
          icon: "error",
          showConfirmButton: true,
          background: "url(/bg_card.png)",
        });
      }
    } else {
      //  Swal.fire("Please select correct file and try again!");
    }
  }

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("studentsList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchStudents = async () => {
      const data = localStorage.getItem('students');
      console.log("Course Id : " + localStorage.getItem('courseId')
        + ", Status : " + localStorage.getItem('status')
        + ", AC Year : " + localStorage.getItem('acYear')
        + ", maritalStatus : " + localStorage.getItem('maritalStatus')
        + ", hosteller : " + localStorage.getItem('hosteller')
        + ", year : " + localStorage.getItem('year')
        + ", instituteId : " + localStorage.getItem('instituteId'))

      if (data && (localStorage.getItem('courseId')
        || localStorage.getItem('status')
        || localStorage.getItem('acYear')
        || localStorage.getItem('maritalStatus')
        || localStorage.getItem('hosteller')
        || localStorage.getItem('year')
        || localStorage.getItem('instituteId'))) {
        console.log("111")
        getFilteredStudents();
      } else {
        console.log("222")
        getStudents();
      }
    }
    fetchStudents();
  }, []);

  const getStudents = async () => {

    const onStudentDelete = () => {
      const data = localStorage.getItem('students');
      if (data) {
        console.log("333")
        getFilteredStudents();
      } else {
        console.log("444")
        getStudents();
      }
    }

    const data = localStorage.getItem('students');
    console.log("Existing Data - " + JSON.parse(data))
    if (data && (localStorage.getItem('courseId')
      || localStorage.getItem('status')
      || localStorage.getItem('acYear')
      || localStorage.getItem('maritalStatus')
      || localStorage.getItem('hosteller')
      || localStorage.getItem('year')
      || localStorage.getItem('instituteId'))) {
      let sno = 1;
      const data1 = JSON.parse(data).students.map((student) => ({
        _id: student._id,
        sno: sno++,
        name: student.userId?.name,
        schoolName: student.schoolId?.nameEnglish,
        rollNumber: student.rollNumber,
        address: student.address,
        city: student.city,
        district: student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.State : "",
        active: student.active,
        course: student.courses && student.courses?.length > 0 ? student.courses.map(course => course.name ? course.name + ", " : "") : "",
        courses: student.courses && student.courses?.length > 0 ? student.courses : null,
        fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
        action: (<StudentButtons Id={student._id} onStudentDelete={onStudentDelete} />),
      }));
      setStudents(data1);
      setFilteredStudents(data1);
      console.log("Data from local storage")

    } else {

      if (!localStorage.getItem('schoolId')) {
        const schools = await getSchoolsFromCache();
        setSchools(schools)
        //  let inputArray = [];
        //  schools.map((school) => (
        //    inputOptions[school._id] = school.code.substring(3) + " : " + school.nameEnglish + ", " + school.district + ", " + school.state
        //  ))
        //  setInputOptions(inputOptions);

        let selectedOptionInSwal;
        const { value: schId } = await MySwal.fire({
          //title: "<h3 style='color:blue; font-size: 25px;'>Select the Niswan</h3>",
          //html: "<div className='text-2xl font-bold text-blue-700'>Select the Niswan</div>",
          background: "url(/bg_card.png)",
          html: (
            <div className="mb-2 h-80 w-full">
              <div className='text-2xl lg:text-3xl mb-3 text-blue-600'>Select the Niswan</div>
              <Select className='text-sm text-start'
                options={schools.filter(school => school.code !== 'UN-00-001').map(option => ({
                  value: option._id, label: option.code + " : " + option.nameEnglish
                }))}
                onChange={(selectedOption) => {
                  selectedOptionInSwal = selectedOption;
                }}
                maxMenuHeight={230}
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

        if (schId) {
          setSchId(schId);
          schoolId = schId;
          localStorage.setItem('schoolId', schoolId);
          console.log(schoolId)

          schoolName = schools.filter(school => school._id === schoolId)
            .map((sch) => { return sch.code + " : " + sch.nameEnglish + ", " + sch.districtStateId.district + ", " + sch.districtStateId.state });
          localStorage.setItem('schoolName', schoolName);
          console.log(schoolName);
        }
      } else {
        schoolId = localStorage.getItem('schoolId')
      }

      setSupLoading(true)
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
            let sno = 1;
            const data = await responnse.data.students.map((student) => ({
              _id: student._id,
              sno: sno++,
              name: student.userId?.name,
              schoolName: student.schoolId?.nameEnglish,
              rollNumber: student.rollNumber,
              address: student.address,
              city: student.city,
              district: student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.State : "",
              active: student.active,
              course: student.courses && student.courses?.length > 0 ? student.courses.map(course => course.name ? course.name + ", " : "") : "",
              courses: student.courses && student.courses?.length > 0 ? student.courses : null,
              fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
              action: (<StudentButtons Id={student._id} onStudentDelete={onStudentDelete} />),
            }));
            setStudents(data);
            setFilteredStudents(data);
            localStorage.removeItem('students');
            localStorage.setItem('students', JSON.stringify(responnse.data));
          }

        } catch (error) {
          console.log(error.message)
          if (error.response && !error.response.data.success) {
            showSwalAlert("Error!", error.response.data.error, "error");
            navigate("/dashboard");
          }
        } finally {
          setSupLoading(false)
        }
      } else {
        showSwalAlert("Info!", 'Niswan NOT selected.', "info");
        navigate("/dashboard");
      }
    };
  }

  const handleSearch = (e) => {
    const records = students.filter((student) => (
      student.rollNumber?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.course?.toString().toLowerCase().includes(e.target.value.toLowerCase())
      || student.active?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredStudents(records)
  }

  if (!filteredStudent) {
    return getSpinner();
  }

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="lg:mt-3 p-5">
      <div className="text-center">
        <h3 className="text-xl lg:text-2xl font-bold px-5 py-0 text-gray-600">Manage Students</h3>
        <h3 className="text-sm lg:text-xl mt-3 font-bold text-gray-500 px-1 py-0">{localStorage.getItem('schoolName')}</h3>
      </div>
      <div className="flex justify-between items-center mt-5 relative">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border lg:shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-2 rounded-l-md`}>
            <input
              type="text"
              placeholder="Search"
              class="w-full px-3 py-0.5 border rounded shadow-md justify-center ml-1 lg:ml-0 mr-3 lg:mr-0"
              onChange={handleSearch}
            />
          </div>
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {/*  <img src="/filter.jpg" className="rounded border border-green-500 w-8 p-1 mr-3 shadow-lg bg-white"/>*/}

        <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>

        {LinkIcon("/dashboard/add-student", "Add")}
        {/* {user.role === "superadmin" || user.role === "hquser" ?
          <div className="hidden lg:block" onClick={handleImport}>{LinkIcon("#", "Import")}</div> : null} */}
      </div>

      {(localStorage.getItem('courseId') != null && localStorage.getItem('courseId') != 'null')
        || (localStorage.getItem('status') != null && localStorage.getItem('status') != 'null')
        || (localStorage.getItem('acYear') != null && localStorage.getItem('acYear') != 'null')
        || (localStorage.getItem('maritalStatus') != null && localStorage.getItem('maritalStatus') != 'null')
        || (localStorage.getItem('hosteller') != null && localStorage.getItem('hosteller') != 'null')
        || (localStorage.getItem('year') != null && localStorage.getItem('year') != 'null')
        || (localStorage.getItem('instituteId') != null && localStorage.getItem('instituteId') != 'null') ?

        <div className='grid lg:flex mt-3 lg:mt-7 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>Filter Applied: </p>

          <p>{localStorage.getItem('courseId') != null && localStorage.getItem('courseId') != 'null' ?
            <span className='text-blue-500'>Course: <span className='text-gray-500'>
              {courses.filter(course => course._id === localStorage.getItem('courseId')).map(course => course.name) + ", "}
            </span></span> : null}</p>

          <div className='grid grid-cols-1 md:flex'>

            <p className='lg:ml-3'>{localStorage.getItem('year') != null && localStorage.getItem('year') != 'null' ?
              <span className='text-blue-500'>Year: <span className='text-gray-500'>
                {localStorage.getItem('year') + ", "}</span></span> : null}</p>

            <p className='lg:ml-3'>{localStorage.getItem('instituteId') != null && localStorage.getItem('instituteId') != 'null' ?
              <span className='text-blue-500'>Institute: <span className='text-gray-500'>
                {institutes.filter(institute => institute._id === localStorage.getItem('instituteId')).map(institute => institute.name) + ", "}
              </span></span> : null}</p>

            <p className='lg:ml-3'>{localStorage.getItem('acYear') != null && localStorage.getItem('acYear') != 'null' ?
              <span className='text-blue-500'>AC Year: <span className='text-gray-500'>
                {academicYears.filter(acYear => acYear._id === localStorage.getItem('acYear')).map(acYear => acYear.acYear) + ", "}
              </span></span> : null}</p>

            <p className='lg:ml-3'>{localStorage.getItem('status') != null && localStorage.getItem('status') != 'null' ?
              <span className='text-blue-500'>Status: <span className='text-gray-500'>
                {localStorage.getItem('status') + ", "}</span></span> : null}</p>

            <p className='lg:ml-3'>{localStorage.getItem('maritalStatus') != null && localStorage.getItem('maritalStatus') != 'null' ?
              <span className='text-blue-500'>Marital Status: <span className='text-gray-500'>
                {localStorage.getItem('maritalStatus') + ", "}</span></span> : null}</p>

            <p className='lg:ml-3'>{localStorage.getItem('hosteller') != null && localStorage.getItem('hosteller') != 'null' ?
              <span className='text-blue-500'>Hostel: <span className='text-gray-500'>
                {localStorage.getItem('hosteller')}</span></span> : null}</p>

          </div></div>
        : <div className='flex mt-3 lg:mt-7'></div>}

      {filtering ?
        getFilterGif() :
        <div className='mt-3 lg:mt-7 rounded-lg shadow-lg'>
          <DataTable columns={columns} data={filteredStudent} showGridlines highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
        </div>}
    </div>
  )
}

export default List