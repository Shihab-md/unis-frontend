import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { columns, StudentButtons } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClick, getSpinner } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [students, setStudents] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredStudent, setFilteredStudents] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    const onStudentDelete = () => {
      fetchStudents()
    }

    const fetchStudents = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "student",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.students.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            name: sup.userId.name,
            schoolName: sup.schoolId.nameEnglish,
            rollNumber: sup.rollNumber,
            district: sup.district,
            //dob: new Date(sup.dob).toLocaleDateString(),
            profileImage: <img width={40} className='rounded-full' src={`https://unis-server.vercel.app/${sup.userId.profileImage}`} />,
            action: (<StudentButtons Id={sup._id} onStudentDelete={onStudentDelete} />),
          }));
          setStudents(data);
          setFilteredStudents(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate('/login')
        }
      } finally {
        setSupLoading(false)
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
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link to="/admin-dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded shadow-lg" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Student"
          className="px-4 py-0.5 border rounded shadow-lg justify-center"
          onChange={handleFilter}
        />
        <Link to="/admin-dashboard/add-student" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white rounded shadow-lg" />
        </Link>
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredStudent} pagination />
      </div>
    </div>
  )
}

export default List