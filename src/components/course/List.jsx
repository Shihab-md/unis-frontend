import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, CourseButtons, CourseCard } from '../../utils/CourseHelper'
import DataTable from 'react-data-table-component'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import axios from 'axios'
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext'

const List = () => {
  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [courses, setCourses] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredCourse, setFilteredCourses] = useState(null)

  const navigate = useNavigate()
  const { user } = useAuth();
  const MySwal = withReactContent(Swal);

  const openFilterPopup = async () => {
    let selectedCourse;

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
                selectedCourse = selectedOption.value;
              }}
              maxMenuHeight={210}
              placeholder=''
            />
          </div>
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const select1 = selectedCourse ? selectedCourse : null;

        return [select1];
      }
    });

    if (formValues) {
      if (
        formValues[0]
      ) {
        console.log('Selected values:', formValues);

        const courseId = formValues[0] ? formValues[0] : null;

        console.log(
          'Selected Values : ' + 'courseId:', formValues[0]
        );

        localStorage.setItem('courseId', courseId);

        getFilteredStudents();
      } else {
        localStorage.removeItem('students');
        localStorage.removeItem('courseId');

        getStudents();
      }
    }
  };

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
    <div className="p-3 lg:p-5 bg-repeat mt-1 lg:mt-5">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">Manage Courses
          <p className='flex md:grid text-sm md:text-base justify-center text-rose-700'>
            (Records Count : {filteredCourse ? filteredCourse.length : 0}) </p>
        </h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard/masters", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-2 rounded-l-md`}>
            <input
              type="text"
              placeholder="Search"
              class="w-full px-3 py-0.5 border rounded shadow-md justify-center ml-1 lg:ml-0 mr-3 lg:mr-0"
              onChange={handleFilter}
            />
          </div>
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center ">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {user.role === "superadmin" || user.role === "hquser" ?
          <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>
          : null}

        {LinkIcon("/dashboard/add-course", "Add")}
      </div>

      <>
        {/* Mobile / Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 lg:hidden">
          {filteredCourse.map((row) => (
            <CourseCard key={row._id} row={row} />
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block mt-5">
          <DataTable columns={columns} data={filteredCourse} highlightOnHover striped responsive />
        </div>
      </>
    </div>
  )
}

export default List