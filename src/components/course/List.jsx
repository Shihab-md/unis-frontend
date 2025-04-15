import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { columns, CourseButtons } from '../../utils/CourseHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {
  const [courses, setCourses] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredCourse, setFilteredCourses] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    const onCourseDelete = () => {
      fetchCourses()
    }

    const fetchCourses = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          "https://unis-server.vercel.app/api/course",
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
            remarks: sup.remarks,
            subjectsCount: 0,
            action: (<CourseButtons Id={sup._id} onCourseDelete={onCourseDelete} />),
          }));
          setCourses(data);
          setFilteredCourses(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error)
          navigate('/login')
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
    return <div>Loading ...</div>
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Courses</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link to="/admin-dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded shadow-lg" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Course"
          className="px-4 py-0.5 border"
          onChange={handleFilter}
        />
        <Link to="/admin-dashboard/add-course" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white rounded shadow-lg" />
        </Link>
      </div>
      <div className='mt-6'>
        <DataTable columns={columns} data={filteredCourse} pagination />
      </div>
    </div>
  )
}

export default List