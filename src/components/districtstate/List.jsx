import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, DistrictStateButtons } from '../../utils/DistrictStateHelper'
import DataTable from 'react-data-table-component'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import axios from 'axios'

const List = () => {
  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [districtStates, setDistrictStates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredDistrictState, setFilteredDistrictStates] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("districtStateList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const onDistrictStateDelete = () => {
      fetchDistrictStates()
    }

    const fetchDistrictStates = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "districtState",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.districtStates.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            district: sup.district,
            state: sup.state,
            action: (<DistrictStateButtons Id={sup._id} onDistrictStateDelete={onDistrictStateDelete} />),
          }));
          setDistrictStates(data);
          setFilteredDistrictStates(data)
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

    fetchDistrictStates();
  }, []);

  const handleFilter = (e) => {
    const records = districtStates.filter((sup) => (
      sup.district?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.state?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredDistrictStates(records)
  }

  if (!filteredDistrictState) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage District and State</h3>
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

        {LinkIcon("/dashboard/add-districtState", "Add")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredDistrictState} pagination />
      </div>
    </div>
  )
}

export default List