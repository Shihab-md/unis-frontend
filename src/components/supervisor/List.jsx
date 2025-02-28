import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { columns, SupervisorButtons } from '../../utils/SupervisorHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'

const List = () => {
    const [supervisors, setSupervisors] = useState([])
    const [supLoading, setSupLoading] = useState(false)
    const [filteredSupervisor, setFilteredSupervisors] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
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
                routeName: sup.routeName,
                //dob: new Date(sup.dob).toLocaleDateString(),
                profileImage: <img width={40} className='rounded-full' src={`https://unis-server.vercel.app/${sup.userId.profileImage}`} />,
                action: (<SupervisorButtons Id={sup._id} />),
              }));
              setSupervisors(data);
              setFilteredSupervisors(data)
            }
          } catch (error) {
            console.log(error.message)
            if(error.response && !error.response.data.success) {
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

      if(!filteredSupervisor) {
        return <div>Loading ...</div>
      }

  return (
    <div className='p-6'>
        <div className="text-center">
        <h3 className="text-2xl font-bold">Manage Supervisor</h3>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Seach By Supervisor Name"
          className="px-4 py-0.5 border"
          onChange={handleFilter}
        />
        <Link
          to="/admin-dashboard/add-supervisor"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add New Supervisor
        </Link>
      </div>
      <div className='mt-6'>
        <DataTable columns={columns} data={filteredSupervisor} pagination/>
      </div>
    </div>
  )
}

export default List