import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SupervisorButtons } from '../../utils/SupervisorHelper'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth, getBackIcon, getAddIcon } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import Swal from 'sweetalert2';

const List = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

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
            contactNumber: sup.contactNumber,
            routeName: sup.routeName,
            dob: new Date(sup.dob).toLocaleDateString(),
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
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg">Manage Supervisors</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {getBackIcon("/dashboard")}
        <input
          type="text"
          placeholder="Seach By Supervisor"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {user.role === "superadmin" || user.role === "hquser" ?
          getAddIcon("/dashboard/add-supervisor") : null}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredSupervisor} pagination />
      </div>
    </div>
  )
}

export default List