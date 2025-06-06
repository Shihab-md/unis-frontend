import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, InstituteButtons } from '../../utils/InstituteHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth, getBackIcon, getAddIcon } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [institutes, setInstitutes] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredInstitute, setFilteredInstitutes] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("institutesList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const onInstituteDelete = () => {
      fetchInstitutes()
    }

    const fetchInstitutes = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "institute",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.institutes.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            iCode: sup.iCode,
            name: sup.name,
            type: sup.type,
            contactNumber: sup.contactNumber,
            email: sup.email,
            address: sup.address,
            district: sup.district,
            action: (<InstituteButtons Id={sup._id} onInstituteDelete={onInstituteDelete} />),
          }));
          setInstitutes(data);
          setFilteredInstitutes(data)
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

    fetchInstitutes();
  }, []);

  const handleFilter = (e) => {
    const records = institutes.filter((sup) => (
      sup.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredInstitutes(records)
  }

  if (!filteredInstitute) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Institutes</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {getBackIcon("/dashboard/masters")}
        <input
          type="text"
          placeholder="Search By Institute"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {getAddIcon("/dashboard/add-institute")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredInstitute} pagination />
      </div>
    </div>
  )
}

export default List