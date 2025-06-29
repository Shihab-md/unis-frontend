import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, EmployeeButtons, conditionalRowStyles } from '../../utils/EmployeeHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import { useAuth } from '../../context/AuthContext'

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [employees, setEmployees] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredEmployee, setFilteredEmployees] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("employeesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
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
            empId: sup.employeeId,
            name: sup.userId?.name,
            role: sup.userId?.role,
            contactNumber: sup.contactNumber,
            schoolCode: sup.schoolId?.code,
            schoolName: sup.schoolId?.nameEnglish,
            designation: sup.designation,
            active: sup.active,
            //dob: new Date(sup.dob).toLocaleDateString(),
            //  profileImage: <img width={40} className='rounded-full' src={`https://unis-server.vercel.app/${sup.userId.profileImage}`} />,
            action: (<EmployeeButtons Id={sup._id} onEmployeeDelete={onEmployeeDelete} />),
          }));
          setEmployees(data);
          setFilteredEmployees(data)
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

    fetchEmployees();
  }, []);

  const handleFilter = (e) => {
    const records = employees.filter((sup) => (
      sup.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.empId?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.role?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.schoolCode?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.designation?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.active?.toLowerCase().includes(e.target.value.toLowerCase())
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
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage Employees</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
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

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
          LinkIcon("/dashboard/add-employee", "Add") : null}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredEmployee} pagination highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
      </div>
    </div>
  )
}

export default List