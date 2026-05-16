import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  columns,
  DistrictStateButtons,
  DistrictStateCard,
} from '../../utils/DistrictStateHelper'
import DataTable from 'react-data-table-component'
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  getSpinner,
  checkAuth,
  LinkIcon,
  showSwalAlert,
} from '../../utils/CommonHelper'
import axios from 'axios'

const List = () => {
  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen()
  }, [])

  const [districtStates, setDistrictStates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredDistrictState, setFilteredDistrictStates] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth('districtStateList') === 'NO') {
      showSwalAlert('Error!', 'User Authorization Failed!', 'error')
      navigate('/login')
      return
    }

    const onDistrictStateDelete = () => {
      fetchDistrictStates()
    }

    const fetchDistrictStates = async () => {
      setSupLoading(true)

      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + 'districtState',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )

        if (responnse.data.success) {
          let sno = 1

          const data = await responnse.data.districtStates.map((districtState) => ({
            _id: districtState._id,
            sno: sno++,
            district: districtState.district,
            state: districtState.state,

            // Niswan counts
            niswanActiveCount:
              districtState.niswanActiveCount ??
              districtState.activeSchoolCount ??
              0,
            niswanInactiveCount:
              districtState.niswanInactiveCount ??
              districtState.inactiveSchoolCount ??
              0,
            niswanCount:
              districtState.niswanCount ??
              districtState.schoolCount ??
              districtState._schoolsCount ??
              0,

            // Employee counts
            employeeActiveCount: districtState.employeeActiveCount ?? 0,
            employeeInactiveCount: districtState.employeeInactiveCount ?? 0,
            employeeCount:
              districtState.employeeCount ??
              districtState._employeesCount ??
              0,
            employeeCountsByRole: districtState.employeeCountsByRole || [],

            // Student counts
            studentActiveCount: districtState.studentActiveCount ?? 0,
            studentInactiveCount: districtState.studentInactiveCount ?? 0,
            studentAlumniCount: districtState.studentAlumniCount ?? 0,
            studentCount:
              districtState.studentCount ??
              districtState._studentsCount ??
              0,
            studentCountsByCourse: districtState.studentCountsByCourse || [],

            action: (
              <DistrictStateButtons
                Id={districtState._id}
                onDistrictStateDelete={onDistrictStateDelete}
              />
            ),
          }))

          setDistrictStates(data)
          setFilteredDistrictStates(data)
        }
      } catch (error) {
        console.log(error.message)

        if (error.response && !error.response.data.success) {
          showSwalAlert('Error!', error.response.data.error, 'error')
          navigate('/dashboard/masters')
        }
      } finally {
        setSupLoading(false)
      }
    }

    fetchDistrictStates()
  }, [navigate])

  const handleFilter = (e) => {
    const searchText = e.target.value.toLowerCase()

    const records = districtStates.filter((districtState) => (
      districtState.district?.toLowerCase().includes(searchText) ||
      districtState.state?.toLowerCase().includes(searchText)
    ))

    setFilteredDistrictStates(records)
  }

  if (!filteredDistrictState || supLoading) {
    return getSpinner()
  }

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-3 lg:mt-5">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
          Manage District and State

          <p className="flex md:grid text-sm md:text-base justify-center text-rose-700">
            (Records Count : {filteredDistrictState ? filteredDistrictState.length : 0})
          </p>
        </h3>
      </div>

      <div className="flex justify-between items-center mt-5">
        {LinkIcon('/dashboard/masters', 'Back')}

        <div className="w-3/4 lg:w-1/2 rounded flex border shadow-lg rounded-md justify-between items-center relative bg-[url(/bg-img.jpg)]">
          <div className="w-full text-md flex justify-center items-center pl-2 rounded-l-md">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-0.5 border rounded shadow-md justify-center"
              onChange={handleFilter}
            />
          </div>

          <div className="p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon('#', 'Search')}
          </div>
        </div>

        {LinkIcon('/dashboard/add-districtState', 'Add')}
      </div>

      <div className="mt-6">
        {/* Mobile / Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {filteredDistrictState.map((row) => (
            <DistrictStateCard key={row._id} row={row} />
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block rounded-lg shadow-lg">
          <DataTable
            columns={columns}
            data={filteredDistrictState}
            showGridlines
            highlightOnHover
            striped
            responsive
          />
        </div>
      </div>
    </div>
  )
}

export default List