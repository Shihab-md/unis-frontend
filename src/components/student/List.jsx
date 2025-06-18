import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, StudentButtons, conditionalRowStyles } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, getPrcessing, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
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
  const [filteredStudent, setFilteredStudents] = useState(null)
  const navigate = useNavigate()
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
        reader.onload = (event) => {
          const binaryString = event.target.result;
          const workbook = XLSX.read(binaryString, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setExcelData(jsonData);
        };
        reader.readAsBinaryString(file);

        let data = JSON.stringify(excelData);
        const response = await fetch((await getBaseUrl()).toString() + "student/import", {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}`, 'Content-Type': 'application/json' },
          body: data,
        });

        if (response.ok) {
          setProcessing(false);
          const resData = JSON.parse(JSON.stringify(await response.json()));
          showSwalAlert("Success!", "Successfully Imported!", "success");
        } else {
          setProcessing(false);
          console.error('Failed to send data.');
        }
      } catch (error) {
        setProcessing(false);
        alert("Error!" + JSON.stringify(error.response.data))
        console.error('Error sending data:', error);
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

  const handleFilter = (e) => {
    const records = students.filter((sup) => (
      sup.name.toLowerCase().includes(e.target.value.toLowerCase())
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
        <h3 className="text-2xl font-bold px-5 py-0">Manage Students</h3>
        <h3 className="text-xl mt-3 font-bold text-gray-500 px-5 py-0">{localStorage.getItem('schoolName')}</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard", "Back")}
        <input
          type="text"
          placeholder="Search By Student"
          className="px-4 py-0.5 border rounded shadow-lg justify-center"
          onChange={handleFilter}
        />
        {LinkIcon("/dashboard/add-student", "Add")}
        <div onClick={handleImport}>{LinkIcon("#", "Import")}</div>
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredStudent} pagination highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
      </div>
    </div>
  )
}

export default List