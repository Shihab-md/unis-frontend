import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SchoolButtons, conditionalRowStyles } from '../../utils/SchoolHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth, getBackIcon, getAddIcon } from '../../utils/CommonHelper'
import Swal from 'sweetalert2';

const List = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  //document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [schools, setSchools] = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [filteredSchool, setFilteredSchools] = useState(null)

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate()

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const ExpandedComponent = ({ data }) => {
    return (
      data.nameArabic || data.nameNative || data.address ?
        <div className='ml-14 p-2 bg-blue-50'>
          <p className='ml-14 text-xs'>{data.nameArabic}</p>
          <p className='ml-14 text-xs'>{data.nameNative}</p>
          <p className='ml-14 text-xs'>{"Address : " + data.address}</p>
        </div>
        : null
    );
  }

  const { user } = useAuth();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("schoolsList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const onSchoolDelete = () => {
      fetchSchools()
    }

    const fetchSchools = async () => {
      setSchLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "school",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              //  'X-U-R': user.role,
              //  'X-U-I': user._id,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.schools.map((sch) => ({
            _id: sch._id,
            sno: sno++,
            code: sch.code,
            name: sch.nameEnglish,
            nameArabic: sch.nameArabic,
            nameNative: sch.nameNative,
            address: sch.address,
            district: sch.district,
            active: sch.active,
            supervisorId: sch.supervisorId.supervisorId,
            supervisorName: sch.supervisorId.userId.name,
            studentsCount: sch._studentsCount ? sch._studentsCount : 0,
            action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
          }));
          setSchools(data);
          setFilteredSchools(data)
        }
      } catch (error) {
        //console.log(error.message)
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard");
        }
      } finally {
        setSchLoading(false)
      }
    };

    fetchSchools();
  }, []);

  const handleFilter = (e) => {
    const records = schools.filter((sup) => (
      sup.code.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredSchools(records)
  }

  if (!filteredSchool) {
    return getSpinner();
  }

  return (
    <div className="p-5 bg-repeat">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0">Manage Niswans</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {getBackIcon("/dashboard")}
        <input
          type="text"
          placeholder="Search By Niswan Code"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {user.role === "superadmin" || user.role === "hquser" ?
          getAddIcon("/dashboard/add-school")
          : null}
      </div>
      <div className='mt-6 rounded-lg shadow-lg bg-blue-50'>
        <DataTable columns={columns} data={filteredSchool} highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} expandableRows expandableRowsComponent={ExpandedComponent} />
      </div>
    </div>
  )
}

export default List