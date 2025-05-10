import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { columns, SchoolButtons } from '../../utils/SchoolHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClick } from '../../utils/CommonHelper'
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [schools, setSchools] = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [filteredSchool, setFilteredSchools] = useState(null)

  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    //  alert("Current Page  :" + page);
  };

  useEffect(() => {

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
            address: sch.address,
            district: sch.district,
            active: sch.active,
            supervisorId: sch.supervisorId,
            action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
          }));
          setSchools(data);
          setFilteredSchools(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error)
        }
      } finally {
        setSchLoading(false)
      }
    };

    fetchSchools();
  }, []);

  const handleFilter = (e) => {
    const records = schools.filter((sup) => (
      sup.code.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredSchools(records)
  }

  if (!filteredSchool) {
    return <div>Loading ...</div>
  }

  return (
    <div className="p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Niswans</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link to="/admin-dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded shadow-lg" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Niswan Code"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        <Link to="/admin-dashboard/add-school" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white rounded shadow-lg" />
        </Link>
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredSchool} highlightOnHover striped responsive />
        {/* <DataTable columns={columns} data={filteredSchool} pagination highlightOnHover currentPage={currentPage} onChangePage={handlePageChange} />*/}
      </div>
    </div>
  )
}

export default List