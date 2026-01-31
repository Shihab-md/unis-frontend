import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, CourseButtons } from '../../utils/CourseHelper'
import DataTable from 'react-data-table-component'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import axios from 'axios'

const List = () => {
  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [courses, setCourses] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredCourse, setFilteredCourses] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("coursesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
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
            years: sup.years,
            subjectsCount: sup._subjectsCount ? sup._subjectsCount : 0,
            action: (<CourseButtons Id={sup._id} onCourseDelete={onCourseDelete} />),
          }));
          setCourses(data);
          setFilteredCourses(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/masters");
        }
      } finally {
        setSupLoading(false)
      }
    };

    fetchCourses();
  }, []);

  const handleFilter = (e) => {
    const records = courses.filter((sup) => (
      sup.code?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.type?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredCourses(records)
  }

  if (!filteredCourse) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage Courses
          <p className='flex md:grid text-sm md:text-base justify-center text-rose-700'>
            (Records Count : {filteredCourse ? filteredCourse.length : 0}) </p>
        </h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard/masters", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex border shadow-lg rounded-md justify-between items-center relative bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-2 rounded-l-md`}>
            <input
              type="text"
              placeholder="Search"
              class="w-full px-3 py-0.5 border rounded shadow-md justify-center"
              onChange={handleFilter}
            />
          </div>
          <div className="p-1 mt-0.5 rounded-md items-center justify-center ">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {LinkIcon("/dashboard/add-course", "Add")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredCourse} highlightOnHover striped responsive />
      </div>
    </div>
  )
}

export default List