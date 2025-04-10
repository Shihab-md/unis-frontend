import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { columns, SchoolButtons } from '../../utils/SchoolHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {
  const [schools, setSchools] = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [filteredSchool, setFilteredSchools] = useState(null)

  useEffect(() => {

    const onSchoolDelete = () => {
      fetchSchools()
    }

    const fetchSchools = async () => {
      setSchLoading(true)
      try {
        const responnse = await axios.get(
          "https://unis-server.vercel.app/api/school",
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
    const records = schools.filter((sch) => (
      sch.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredSchools(records)
  }

  if (!filteredSchool) {
    return <div>Loading ...</div>
  }

  return (
    <div className='p-5'>
      <div className="text-center">
        <h3 className="text-2xl font-bold p-5">Manage Niswans</h3>
      </div>
      <div className="flex justify-between items-center">
        <Link to="/admin-dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Niswan"
          className="px-4 py-0.5 border"
          onChange={handleFilter}
        />
        {/*<Link
          to="/admin-dashboard/add-school"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add Niswan
        </Link>*/}
        <Link to="/admin-dashboard/add-school" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white rounded" />
        </Link>
      </div>
      <div className='mt-6'>
        <DataTable columns={columns} data={filteredSchool} pagination />
      </div>
    </div>
  )
}

export default List