import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, InstituteButtons } from '../../utils/InstituteHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [institutes, setInstitutes] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredInstitute, setFilteredInstitutes] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("institutesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
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
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/masters");
        }
      } finally {
        setSupLoading(false)
      }
    };

    fetchInstitutes();
  }, []);

  const handleFilter = (e) => {
    const records = institutes.filter((sup) => (
      sup.iCode?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.type?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredInstitutes(records)
  }

  if (!filteredInstitute) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage Institutes</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard/masters", "Back")}

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

        {LinkIcon("/dashboard/add-institute", "Add")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredInstitute} pagination />
      </div>
    </div>
  )
}

export default List