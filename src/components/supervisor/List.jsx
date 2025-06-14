import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SupervisorButtons, conditionalRowStyles } from '../../utils/SupervisorHelper'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import Swal from 'sweetalert2';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const navigate = useNavigate()
  const [supervisors, setSupervisors] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredSupervisor, setFilteredSupervisors] = useState(null)

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("supervisorsList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const onSupervisorDelete = () => {
      fetchSupervisors()
    }

    const fetchSupervisors = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "supervisor",
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
            supId: sup.supervisorId,
            name: sup.userId.name,
            email: sup.userId.email,
            contactNumber: sup.contactNumber,
            routeName: sup.routeName,
            active: sup.active,
            //  dob: new Date(sup.dob).toLocaleDateString(),
            schoolsCount: sup._schoolsCount ? sup._schoolsCount : 0,
            //  profileImage: <img width={40} className='rounded-full' src={(getBaseUrl()).toString() + `${sup.userId.profileImage}`} />,
            action: (<SupervisorButtons Id={sup._id} onSupervisorDelete={onSupervisorDelete} />),
          }));
          setSupervisors(data);
          setFilteredSupervisors(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          //  navigate('/login')
          navigate("/dashboard");
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
    return getSpinner();
  }

  const { user } = useAuth();

  return (
    <div className="mt-3 p-5 lg:mt-7">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg">Manage Supervisors</h3>
      </div>
      <div className="flex justify-between items-center mt-5 lg:mt-10">
        {LinkIcon("/dashboard", "Back")}
        <input
          type="text"
          placeholder="Search By Supervisor"
          className="px-4 py-0.5 lg:py-1 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {user.role === "superadmin" || user.role === "hquser" ?
          LinkIcon("/dashboard/add-supervisor", "Add") : null}
      </div>
      <div className='mt-6 lg:mt-10 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredSupervisor} pagination highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
      </div>
    </div>
  )
}

export default List