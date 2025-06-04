import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, EmployeeButtons } from '../../utils/EmployeeHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth, getBackIcon, getAddIcon } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext'

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [employees, setEmployees] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredEmployee, setFilteredEmployees] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("employeesList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

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
          navigate("/dashboard");
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
    return getSpinner();
  }

  const { user } = useAuth();

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Employees</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {getBackIcon("/dashboard")}
        <input
          type="text"
          placeholder="Search By Employee"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
          getAddIcon("/dashboard/add-employee") : null}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredEmployee} pagination />
      </div>
    </div>
  )
}

export default List