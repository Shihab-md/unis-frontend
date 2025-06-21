import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, StudentButtons, conditionalRowStyles } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, getPrcessing, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../../context/AuthContext'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import 'animate.css';
import * as XLSX from 'xlsx';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [schools, setSchools] = useState([]);
  const [inputOptions, setInputOptions] = useState([]);
  const [students, setStudents] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(null);
  const [filteredStudent, setFilteredStudents] = useState(null)

  const navigate = useNavigate()
  const { user } = useAuth()
  
  let schoolId;
  const [excelData, setExcelData] = useState([]);
  const [processing, setProcessing] = useState(null)

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

    const onStudentDelete = () => {
      fetchStudents()
    }

    const fetchStudents = async () => {
      if (!localStorage.getItem('schoolId')) {
        const schools = await getSchoolsFromCache();
        setSchools(schools)
        schools.map((school) => (
          inputOptions[school._id] = school.code + " : " + school.nameEnglish
        ))

        setInputOptions(inputOptions);

        await Swal.fire({
          title: "<h3 style='color:blue; font-size: 25px;'>Select the Niswan</h3>",
          input: "select",
          inputOptions: inputOptions,
          inputPlaceholder: "Select the Niswan",
          showCancelButton: true,
          background: "url(/bg_card.png)",
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value && value != "") {
                schoolId = value;
                localStorage.setItem('schoolId', value);
                localStorage.setItem('schoolName', inputOptions[schoolId]);
              } else {
                navigate("/dashboard");
              }
              resolve();
            });
          }
        });
      } else {
        schoolId = localStorage.getItem('schoolId')
      }

      setSupLoading(true)
      if (schoolId) {

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
              name: student.userId.name,
              schoolName: student.schoolId.nameEnglish,
              rollNumber: student.rollNumber,
              district: student.district,
              active: student.active,
              course: student.courses && student.courses.length > 0 ? student.courses.map(course => course.name + " ") : "",
              fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
              action: (<StudentButtons Id={student._id} onStudentDelete={onStudentDelete} />),
            }));
            setStudents(data);
            setFilteredStudents(data)
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
        navigate("/dashboard");
      }
    };

    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    const records = students.filter((sup) => (
      sup.rollNumber.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredStudents(records)
  }

  const handleShowFilter = async () => {
    setShowFilter("show");
  };
  const handleHideFilter = async () => {
    setShowFilter(null);
  };

  const handleFilter = (e) => {
    const records = students.filter((sup) => (
      sup.course.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.name.toLowerCase().includes(e.target.value.toLowerCase())
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
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-xl lg:text-2xl font-bold px-5 py-0 text-gray-600">Manage Students</h3>
        <h3 className="text-md lg:text-xl mt-3 font-bold text-gray-500 px-5 py-0">{localStorage.getItem('schoolName')}</h3>
      </div>
      <div className="flex justify-between items-center mt-5 relative">
        {LinkIcon("/dashboard", "Back")}

        <div className="flex ml-3 mr-3 w-full lg:w-1/2 justify-end relative">
          <input
            type="text"
            placeholder="Roll Number | Name"
            class="px-3 py-0.5 w-full lg:w-1/2 border rounded shadow-lg justify-end"
            onChange={handleSearch}
          />
          <img src="/search.jpg" class="absolute rounded w-5 m-1" alt="Search Icon" />
        </div>

        {/*  <img src="/filter.jpg" class="rounded border border-green-500 w-8 p-1 mr-3 shadow-lg bg-white"/>*/}

        <div class="mr-3" onClick={handleShowFilter}>{LinkIcon("#", "Filter")}</div>

        {LinkIcon("/dashboard/add-student", "Add")}
        {user.role === "superadmin" || user.role === "hquser" ?
          <div className="hidden lg:block" onClick={handleImport}>{LinkIcon("#", "Import")}</div> : null}
      </div>



      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredStudent} highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
      </div>
    </div>
  )
}

export default List