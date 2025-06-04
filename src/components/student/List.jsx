import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, StudentButtons } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth, getBackIcon, getAddIcon } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [students, setStudents] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredStudent, setFilteredStudents] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("studentsList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

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
          navigate("/dashboard");
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
        {getBackIcon("/dashboard")}
        <input
          type="text"
          placeholder="Search By Student"
          className="px-4 py-0.5 border rounded shadow-lg justify-center"
          onChange={handleFilter}
        />
        {getAddIcon("/dashboard/add-student")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredStudent} pagination />
      </div>
    </div> 
  )
}

export default List