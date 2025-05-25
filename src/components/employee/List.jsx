import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { columns, EmployeeButtons } from '../../utils/EmployeeHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClick } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [employees, setEmployees] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredEmployee, setFilteredEmployees] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    const onEmployeeDelete = () => {
      fetchEmployees()
    }

    const fetchEmployees = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "employee",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.employees.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            name: sup.userId.name,
            role: sup.userId.role,
            contactNumber: sup.contactNumber,
            schoolName: sup.schoolId.nameEnglish,
            designation: sup.designation,
            //dob: new Date(sup.dob).toLocaleDateString(),
            profileImage: <img width={40} className='rounded-full' src={`https://unis-server.vercel.app/${sup.userId.profileImage}`} />,
            action: (<EmployeeButtons Id={sup._id} onEmployeeDelete={onEmployeeDelete} />),
          }));
          setEmployees(data);
          setFilteredEmployees(data)
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

    fetchEmployees();
  }, []);

  const handleFilter = (e) => {
    const records = employees.filter((sup) => (
      sup.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredEmployees(records)
  }

  if (!filteredEmployee) {
    return <div>Loading ...</div>
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Employees</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link to="/admin-dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded shadow-lg" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Employee"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        <Link to="/admin-dashboard/add-employee" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white rounded shadow-lg" />
        </Link>
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredEmployee} pagination />
      </div>
    </div>
  )
}

export default List