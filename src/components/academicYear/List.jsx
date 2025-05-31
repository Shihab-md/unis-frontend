import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { columns, AcademicYearButtons } from '../../utils/AcademicYearHelper'
import DataTable from 'react-data-table-component'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth } from '../../utils/CommonHelper';
import axios from 'axios'
import Swal from 'sweetalert2';
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [academicYears, setAcademicYears] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredAcademicYear, setFilteredAcademicYears] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("acYearsList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
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
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate('/login')
        }
      } finally {
        setSupLoading(false)
      }
    };

    fetchAcademicYears();
  }, []);

  const handleFilter = (e) => {
    const records = academicYears.filter((sup) => (
      sup.acYear.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredAcademicYears(records)
  }

  if (!filteredAcademicYear) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Academic Years</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link to="/dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded shadow-lg" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Academic Year"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        <Link to="/dashboard/add-academicYear" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white rounded shadow-lg" />
        </Link>
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredAcademicYear} pagination />
      </div>
    </div>
  )
}

export default List