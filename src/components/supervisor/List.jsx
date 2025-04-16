import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { columns, SupervisorButtons } from '../../utils/SupervisorHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {
  const [supervisors, setSupervisors] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredSupervisor, setFilteredSupervisors] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    const onSupervisorDelete = () => {
      fetchSupervisors()
    }

    const fetchSupervisors = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          "https://unis-server.vercel.app/api/supervisor",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.supervisors.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            // dep_name: sup.department.dep_name,
            name: sup.userId.name,
            contactNumber: sup.contactNumber,
            routeName: sup.routeName,
            dob: new Date(sup.dob).toLocaleDateString(),
            profileImage: <img width={40} className='rounded-full' src={`https://unis-server.vercel.app/${sup.userId.profileImage}`} />,
            action: (<SupervisorButtons Id={sup._id} onSupervisorDelete={onSupervisorDelete} />),
          }));
          setSupervisors(data);
          setFilteredSupervisors(data)
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

    fetchSupervisors();
  }, []);

  const handleFilter = (e) => {
    const records = supervisors.filter((sup) => (
      sup.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredSupervisors(records)
  }

  if (!filteredSupervisor) {
    return <div>Loading ...</div>
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg">Manage Supervisors</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link to="/admin-dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Supervisor"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        <Link to="/admin-dashboard/add-supervisor" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white" />
        </Link>
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredSupervisor} pagination />
      </div>
    </div>
  )
}

export default List