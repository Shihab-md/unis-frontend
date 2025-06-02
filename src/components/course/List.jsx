import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, CourseButtons } from '../../utils/CourseHelper'
import DataTable from 'react-data-table-component'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth, getBackIcon, getAddIcon } from '../../utils/CommonHelper';
import axios from 'axios'
import Swal from 'sweetalert2';

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [courses, setCourses] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredCourse, setFilteredCourses] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("coursesList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const onCourseDelete = () => {
      fetchCourses()
    }

    const fetchCourses = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "course",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.courses.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            code: sup.code,
            name: sup.name,
            type: sup.type,
            remarks: sup.remarks,
            fees: sup.fees,
            subjectsCount: 0,
            action: (<CourseButtons Id={sup._id} onCourseDelete={onCourseDelete} />),
          }));
          setCourses(data);
          setFilteredCourses(data)
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

    fetchCourses();
  }, []);

  const handleFilter = (e) => {
    const records = courses.filter((sup) => (
      sup.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredCourses(records)
  }

  if (!filteredCourse) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Courses</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {getBackIcon("/dashboard")}
        <input
          type="text"
          placeholder="Seach By Course"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {getAddIcon("/dashboard/add-course")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredCourse} highlightOnHover striped responsive />
      </div>
    </div>
  )
}

export default List