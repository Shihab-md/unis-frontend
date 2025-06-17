import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, StudentButtons, conditionalRowStyles } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import 'animate.css';

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

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: "<h3 style='color:blue; font-size: 25px;'>Import Student Data</h3>",
      input: "file",
      background: "url(/bg_card.png)",
      inputAttributes: {
        "accept": "image/*",
        "aria-label": "Upload your profile picture"
      },
      showClass: { popup: `animate__animated animate__fadeInUp animate__faster` },
      hideClass: { popup: `animate__animated animate__fadeOutDown animate__faster` }
    });

    if (file) {
      alert("Hi")
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