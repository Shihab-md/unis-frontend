import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, AcademicYearButtons } from '../../utils/AcademicYearHelper'
import DataTable from 'react-data-table-component'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import axios from 'axios'

const List = () => {
  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [academicYears, setAcademicYears] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredAcademicYear, setFilteredAcademicYears] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("acYearsList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const onAcademicYearDelete = () => {
      fetchAcademicYears()
    }

    const fetchAcademicYears = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "academicYear",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.academicYears.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            acYear: sup.acYear,
            desc: sup.desc,
            newAddmissions: 0,
            studentsCount: 0,
            action: (<AcademicYearButtons Id={sup._id} onAcademicYearDelete={onAcademicYearDelete} />),
          }));
          setAcademicYears(data);
          setFilteredAcademicYears(data)
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
    };

    fetchAcademicYears();
  }, []);

  const handleFilter = (e) => {
    const records = academicYears.filter((sup) => (
      sup.acYear?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredAcademicYears(records)
  }

  if (!filteredAcademicYear) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage Academic Years</h3>
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

        {LinkIcon("/dashboard/add-academicYear", "Add")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredAcademicYear} pagination />
      </div>
    </div>
  )
}

export default List