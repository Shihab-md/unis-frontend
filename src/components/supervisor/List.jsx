import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SupervisorButtons, conditionalRowStyles } from '../../utils/SupervisorHelper'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert, getFilterGif } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const navigate = useNavigate()
  const [supervisors, setSupervisors] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredSupervisor, setFilteredSupervisors] = useState(null)
  const [schools, setSchools] = useState([])
  const [filtering, setFiltering] = useState(false)

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  const openFilterPopup = async () => {
    let selectedSchool;
    let selectedStatus;
    let selectedType;
    const { value: formValues } = await MySwal.fire({
      //  title: 'Filters',
      background: "url(/bg_card.png)",
      html: (
        <div className="mb-2 h-80 w-full">
          <div className='text-xl font-bold mb-1 text-green-600 text-center'>Filter</div>
          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>Niswan</span>
            <Select className='text-sm text-start mb-3'
              options={schools.filter(school => school.code !== 'UN-00-00001').map(option => ({
                value: option._id, label: option.code + " : " + option.nameEnglish
              }))}

              onChange={(selectedOption) => {
                selectedSchool = selectedOption.value;
              }}
              maxMenuHeight={210}
              placeholder=''
            />
          </div>

          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>Status</span>
            <Select className='text-sm text-start mb-3'
              options={
                [{ value: 'Active', label: 'Active' },
                { value: 'In-Active', label: 'In-Active' }]
              }
              // defaultValue={selectedStatus}
              onChange={(selectedOption) => {
                selectedStatus = selectedOption.value;
              }}
              maxMenuHeight={140}
              placeholder=''
            />
          </div>

          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>Job Type</span>
            <Select className='text-sm text-start mb-3'
              options={
                [{ value: 'Full-Time', label: 'Full-Time' },
                { value: 'Part-Time', label: 'Part-Time' }]
              }

              onChange={(selectedOption) => {
                selectedType = selectedOption.value;
              }}
              maxMenuHeight={210}
              placeholder=''
            />
          </div>
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const select1 = selectedSchool ? selectedSchool : null;
        const select2 = selectedStatus ? selectedStatus : null;
        const select3 = selectedType ? selectedType : null;

        return [select1, select2, select3];
      }
    });

    if (formValues) {
      if (formValues[0] || formValues[1] || formValues[2]) {

        console.log('Selected values:', formValues);
        const supSchoolId = formValues[0] ? formValues[0] : null;
        const supStatus = formValues[1] ? formValues[1] : null;
        const supType = formValues[2] ? formValues[2] : null;

        console.log('Selected supSchoolId:', formValues[0]);
        console.log('Selected supStatus:', formValues[1]);
        console.log('Selected supType:', formValues[2]);

        localStorage.setItem('supSchoolId', supSchoolId);
        localStorage.setItem('supStatus', supStatus);
        localStorage.setItem('supType', supType);

        getFilteredSupervisors();

      } else {

        localStorage.removeItem('supervisors');
        localStorage.removeItem('supSchoolId');
        localStorage.removeItem('supStatus');
        localStorage.removeItem('supType');

        getSupervisors();
      }
    }
  };

  const getFilteredSupervisors = async () => {
    setFiltering(true)
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "supervisor/bySupFilter/"
        + localStorage.getItem('supSchoolId') + "/"
        + localStorage.getItem('supStatus') + "/"
        + localStorage.getItem('supType'),
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
          name: sup.userId?.name,
          email: sup.userId?.email,
          contactNumber: sup.contactNumber,
          routeName: sup.routeName,
          active: sup.active,
          jobType: sup.jobType,
          remarks: sup.remarks,
          schoolsCount: sup._schoolsCount ? sup._schoolsCount : 0,
          studentCount: sup.studentCount ? sup.studentCount : 0,
          studentCountsByCourse: sup.studentCountsByCourse && sup.studentCountsByCourse?.length > 0 ? sup.studentCountsByCourse : null,
          //  profileImage: <img width={40} className='rounded-full' src={(getBaseUrl()).toString() + `${sup.userId.profileImage}`} />,
          action: (<SupervisorButtons Id={sup._id} />),
        }));
        setSupervisors(data);
        setFilteredSupervisors(data)
        localStorage.removeItem('supervisors');
        localStorage.setItem('supervisors', JSON.stringify(responnse.data));
      }

    } catch (error) {
      console.log(error.message)
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
        //  navigate("/dashboard");
      }
    } finally {
      setFiltering(false)
    }
  }

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("supervisorsList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchSupervisors = async () => {
      setSupLoading(true)

      const data = localStorage.getItem('supervisors');
      if (data && (localStorage.getItem('supSchoolId')
        || localStorage.getItem('supStatus')
        || localStorage.getItem('supType'))) {
        console.log("111")
        getFilteredSupervisors();
      } else {
        console.log("222")
        getSupervisors();
      }
    };

    fetchSupervisors();
  }, []);

  const getSupervisors = async () => {

    const onSupervisorDelete = () => {
      const data = localStorage.getItem('supervisors');
      if (data) {
        console.log("333")
        getFilteredSupervisors();
      } else {
        console.log("444")
        getSupervisors();
      }
    }

    const data = localStorage.getItem('supervisors');
    console.log("Existing Data - " + JSON.parse(data))
    if (data && (localStorage.getItem('supSchoolId')
      || localStorage.getItem('supStatus')
      || localStorage.getItem('supType'))) {
      let sno = 1;
      const data1 = JSON.parse(data).supervisors.map((sup) => ({
        _id: sup._id,
        sno: sno++,
        supId: sup.supervisorId,
        name: sup.userId?.name,
        email: sup.userId?.email,
        contactNumber: sup.contactNumber,
        routeName: sup.routeName,
        active: sup.active,
        jobType: sup.jobType,
        remarks: sup.remarks,
        //  dob: new Date(sup.dob).toLocaleDateString(),
        schoolsCount: sup._schoolsCount ? sup._schoolsCount : 0,
        studentCount: sup.studentCount ? sup.studentCount : 0,
        studentCountsByCourse: sup.studentCountsByCourse && sup.studentCountsByCourse?.length > 0 ? sup.studentCountsByCourse : null,
        //  profileImage: <img width={40} className='rounded-full' src={(getBaseUrl()).toString() + `${sup.userId.profileImage}`} />,
        action: (<SupervisorButtons Id={sup._id} onSupervisorDelete={onSupervisorDelete} />),
      }));
      setSupervisors(data1);
      setFilteredSupervisors(data1);
      console.log("Data from local storage")

    } else {
      try {
        setFilteredSupervisors(null);

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
            name: sup.userId?.name,
            email: sup.userId?.email,
            contactNumber: sup.contactNumber,
            routeName: sup.routeName,
            active: sup.active,
            jobType: sup.jobType,
            remarks: sup.remarks,
            //  dob: new Date(sup.dob).toLocaleDateString(),
            schoolsCount: sup._schoolsCount ? sup._schoolsCount : 0,
            studentCount: sup.studentCount ? sup.studentCount : 0,
            studentCountsByCourse: sup.studentCountsByCourse && sup.studentCountsByCourse?.length > 0 ? sup.studentCountsByCourse : null,
            //  profileImage: <img width={40} className='rounded-full' src={(getBaseUrl()).toString() + `${sup.userId.profileImage}`} />,
            action: (<SupervisorButtons Id={sup._id} onSupervisorDelete={onSupervisorDelete} />),
          }));
          setSupervisors(data);
          setFilteredSupervisors(data)
          localStorage.removeItem('supervisors');
          localStorage.setItem('supervisors', JSON.stringify(responnse.data));
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          //  navigate('/login')
          navigate("/dashboard");
        }
      } finally {
        setSupLoading(false)
      }
    };
  }

  const handleFilter = (e) => {
    const records = supervisors.filter((sup) => (
      sup.supId?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.active?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.jobType?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.contactNumber?.toString().toLowerCase().includes(e.target.value.toLowerCase())
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
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg text-gray-600">Manage Supervisors
          <p className='flex md:grid text-sm md:text-base justify-center text-rose-700'>
            (Records Count : {filteredSupervisor ? filteredSupervisor.length : 0}) </p>
        </h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border lg:shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-2 rounded-l-md`}>
            <input
              type="text"
              placeholder="Search"
              class="w-full px-3 py-0.5 border rounded shadow-md justify-center ml-1 lg:ml-0 mr-3 lg:mr-0"
              onChange={handleFilter}
            />
          </div>
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center ">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {user.role === "superadmin" || user.role === "hquser" ?
          <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>
          : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          LinkIcon("/dashboard/add-supervisor", "Add") : null}
      </div>

      {(localStorage.getItem('supSchoolId') != null && localStorage.getItem('supSchoolId') != 'null')
        || (localStorage.getItem('supStatus') != null && localStorage.getItem('supStatus') != 'null')
        || (localStorage.getItem('supType') != null && localStorage.getItem('supType') != 'null') ?

        <div className='grid lg:flex mt-3 lg:mt-7 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>Filter Applied: </p>

          <p>{localStorage.getItem('supSchoolId') != null && localStorage.getItem('supSchoolId') != 'null' ?
            <span className='text-blue-500'>Niswan: <span className='text-gray-500'>
              {schools.filter(school => school._id === localStorage.getItem('supSchoolId')).map(school => school.code + " : " + school.nameEnglish) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('supStatus') != null && localStorage.getItem('supStatus') != 'null' ?
            <span className='text-blue-500'>Status: <span className='text-gray-500'>
              {localStorage.getItem('supStatus')}</span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('supType') != null && localStorage.getItem('supType') != 'null' ?
            <span className='text-blue-500'>Job Type: <span className='text-gray-500'>
              {localStorage.getItem('supType')}</span></span> : null}</p>

        </div>
        : <div className='flex mt-3 lg:mt-7'></div>}

      {filtering ?
        getFilterGif() :
        <div className='mt-3 lg:mt-5 rounded-lg shadow-lg'>
          <DataTable columns={columns} data={filteredSupervisor} highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
        </div>}
    </div>
  )
}

export default List