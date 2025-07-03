import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SchoolButtons, conditionalRowStyles } from '../../utils/SchoolHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper'

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [schools, setSchools] = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [filteredSchool, setFilteredSchools] = useState(null)

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate()

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const ExpandedComponent = ({ data }) => {
    return (
      data.nameArabic || data.nameNative || data.address ?
        <div className='ml-14 p-2 bg-blue-50'>
          <p className='ml-14 text-xs'>{data.nameArabic}</p>
          <p className='ml-14 text-xs'>{data.nameNative}</p>
          <p className='ml-14 text-xs'>{"Address : "}
            {data.address ? data.address : ""}
            {data.city ? ", " + data.city : ""}
            {data.landmark ? ", " + data.landmark : ""}
            {data.districtState ? ", " + data.districtState : ""}
          </p>
        </div>
        : null
    );
  }

  const { user } = useAuth();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("schoolsList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const onSchoolDelete = () => {
      fetchSchools()
    }

    const fetchSchools = async () => {
      setSchLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "school",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              //  'X-U-R': user.role,
              //  'X-U-I': user._id,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.schools.map((sch) => ({
            _id: sch._id,
            sno: sno++,
            code: sch.code,
            name: sch.nameEnglish,
            nameArabic: sch.nameArabic,
            nameNative: sch.nameNative,
            address: sch.address,
            city: sch.city,
            landmark: sch.landmark,
            districtState: sch.districtStateId ? sch.districtStateId?.district + ", " + sch.districtStateId?.state : "",
            active: sch.active,
            supervisorId: sch.supervisorId?.supervisorId,
            supervisorName: sch.supervisorId?.userId?.name,
            studentsCount: sch._studentsCount ? sch._studentsCount : 0,
            action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
          }));
          setSchools(data);
          setFilteredSchools(data)
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard");
        }
      } finally {
        setSchLoading(false)
      }
    };

    fetchSchools();
  }, []);

  const handleFilter = (e) => {
    const records = schools.filter((school) => (
      school.code?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.districtState?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.city?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.active?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.supervisorId?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.supervisorName?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredSchools(records)
  }

  if (!filteredSchool) {
    return getSpinner();
  }

  return (
    <div className="p-5 bg-repeat">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage Niswans</h3>
      </div>

      <div className="flex justify-between items-center mt-5 relative">
        {LinkIcon("/dashboard", "Back")}

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

        {user.role === "superadmin" || user.role === "hquser" ?
          LinkIcon("/dashboard/add-school", "Add")
          : null}
      </div>

      <div className='mt-6 rounded-lg shadow-lg bg-blue-50'>
        <DataTable columns={columns} data={filteredSchool} highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} expandableRows expandableRowsComponent={ExpandedComponent} />
      </div>
    </div>
  )
}

export default List