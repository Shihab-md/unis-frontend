import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { columns, SchoolButtons } from '../../utils/SchoolHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'

const List = () => {
    const [schools, setSchools] = useState([])
    const [empLoading, setEmpLoading] = useState(false)
    const [filteredSchool, setFilteredSchools] = useState(null)

    useEffect(() => {
        const fetchSchools = async () => {
            setEmpLoading(true)
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
              const data = await responnse.data.schools.map((emp) => ({
                _id: emp._id,
                sno: sno++,
                dep_name: emp.department.dep_name,
                name: emp.userId.name,
                dob: new Date(emp.dob).toLocaleDateString(),
                profileImage: <img width={40} className='rounded-full' src={`https://unis-server.vercel.app/${emp.userId.profileImage}`} />,
                action: (<SchoolButtons Id={emp._id} />),
              }));
              setSchools(data);
              setFilteredSchools(data)
            }
          } catch (error) {
            console.log(error.message)
            if(error.response && !error.response.data.success) {
              alert(error.response.data.error)
          }
          } finally {
            setEmpLoading(false)
          }
        };
    
        fetchSchools();
      }, []);

      const handleFilter = (e) => {
        const records = schools.filter((emp) => (
          emp.name.toLowerCase().includes(e.target.value.toLowerCase())
        ))
        setFilteredSchools(records)
      }

      if(!filteredSchool) {
        return <div>Loading ...</div>
      }

  return (
    <div className='p-6'>
        <div className="text-center">
        <h3 className="text-2xl font-bold">Manage School</h3>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Seach By Dep Name"
          className="px-4 py-0.5 border"
          onChange={handleFilter}
        />
        <Link
          to="/admin-dashboard/add-school"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add New School
        </Link>
      </div>
      <div className='mt-6'>
        <DataTable columns={columns} data={filteredSchool} pagination/>
      </div>
    </div>
  )
}

export default List