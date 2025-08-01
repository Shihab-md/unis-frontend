import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SchoolButtons, conditionalRowStyles } from '../../utils/SchoolHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext'
import { getSupervisorsFromCache } from '../../utils/SupervisorHelper';
import { getDistrictStatesFromCache } from '../../utils/DistrictStateHelper';
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert, getFilterGif } from '../../utils/CommonHelper'

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [schools, setSchools] = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [filteredSchool, setFilteredSchools] = useState(null)
  const [supervisors, setSupervisors] = useState([]);
  const [districtStates, setDistrictStates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate()

  const MySwal = withReactContent(Swal);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const getSupervisorsMap = async (id) => {
      const supervisors = await getSupervisorsFromCache(id);
      setSupervisors(supervisors);
    };
    getSupervisorsMap();
  }, []);

  useEffect(() => {
    const getDistrictStatesMap = async (id) => {
      const districtStates = await getDistrictStatesFromCache(id);
      setDistrictStates(districtStates);
    };
    getDistrictStatesMap();
  }, []);

  const ExpandedComponent = ({ data }) => {
    return (
      data.nameArabic || data.nameNative || data.address ?
        <div className='ml-14 p-2 bg-blue-50'>
          <p className='ml-14 text-xs'>{data.nameArabic}</p>
          <p className='ml-14 text-xs'>{data.nameNative}</p>
          <p className='ml-14 text-xs'>{"Address : "}
            {data.address ? data.address : ""}
            {data.city ? ", " + data.city : ""}
            {data.landmark ? ", " + data.landmark : ""}
            {data.districtState ? ", " + data.districtState : ""}
          </p>
        </div>
        : null
    );
  }

  const { user } = useAuth();

  const openFilterPopup = async () => {
    let selectedSupervisor;
    let selectedDistrictState;
    let selectedStatus;
    const { value: formValues } = await MySwal.fire({
      //  title: 'Filters',
      background: "url(/bg_card.png)",
      html: (
        <div className="mb-2 h-80 w-full">
          <div className='text-xl font-bold mb-1 text-green-600 text-center'>Filter</div>
          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>Supervisor</span>
            <Select className='text-sm text-start mb-3'
              options={supervisors.map(option => ({
                value: option._id, label: option.supervisorId + " : " + option.userId.name
              }))}

              onChange={(selectedOption) => {
                selectedSupervisor = selectedOption.value;
              }}
              maxMenuHeight={210}
            />
          </div>

          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>District & State</span>
            <Select className='text-sm text-start mb-3'
              options={districtStates.map(option => ({
                value: option._id, label: option.district + ", " + option.state
              }))}

              onChange={(selectedOption) => {
                selectedDistrictState = selectedOption.value;
              }}
              maxMenuHeight={210}
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
            />
          </div>
        </div>
      ),
      focusConfirm: false,
      preConfirm: () => {
        const select1 = selectedSupervisor ? selectedSupervisor : null;
        const select2 = selectedDistrictState ? selectedDistrictState : null;
        const select3 = selectedStatus ? selectedStatus : null;

        return [select1, select2, select3];
      }
    });

    if (formValues && (formValues[0] || formValues[1] || formValues[2])) {

      console.log('Selected values:', formValues);
      const supervisorId = formValues[0] ? formValues[0] : null;
      const districtStateId = formValues[1] ? formValues[1] : null;
      const schStatus = formValues[2] ? formValues[2] : null;

      console.log('Selected supervisorId:', formValues[0]);
      console.log('Selected districtStateId:', formValues[1]);
      console.log('Selected schStatus:', formValues[2]);

      localStorage.setItem('supervisorId', supervisorId);
      localStorage.setItem('districtStateId', districtStateId);
      localStorage.setItem('schStatus', schStatus);

      getFilteredSchools();

    } else {

      localStorage.removeItem('schools');
      localStorage.removeItem('supervisorId');
      localStorage.removeItem('districtStateId');
      localStorage.removeItem('schStatus');

      getSchools();
    }
  };

  const getFilteredSchools = async () => {
    setFiltering(true)
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "school/bySchFilter/"
        + localStorage.getItem('supervisorId') + "/"
        + localStorage.getItem('districtStateId') + "/"
        + localStorage.getItem('schStatus'),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
          city: sch.city,
          landmark: sch.landmark,
          districtState: sch.districtStateId ? sch.districtStateId?.district + ", " + sch.districtStateId?.state : "",
          active: sch.active,
          supervisorId: sch.supervisorId?.supervisorId,
          supervisorName: sch.supervisorId?.userId?.name,
          studentsCount: sch._studentsCount ? sch._studentsCount : 0,
          action: (<SchoolButtons Id={sch._id} />),
        }));
        setSchools(data);
        setFilteredSchools(data)
        localStorage.removeItem('schools');
        localStorage.setItem('schools', JSON.stringify(responnse.data));
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

  //  if (filtering) {
  //    return getSpinner();
  //  }

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("schoolsList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchSchools = async () => {
      setSchLoading(true)

      const data = localStorage.getItem('schools');
      if (data && (localStorage.getItem('supervisorId')
        || localStorage.getItem('districtStateId')
        || localStorage.getItem('schStatus'))) {
        console.log("111")
        getFilteredSchools();
      } else {
        console.log("222")
        getSchools();
      }
    }
    fetchSchools();
  }, []);

  const getSchools = async () => {

    const onSchoolDelete = () => {
      const data = localStorage.getItem('schools');
      if (data) {
        console.log("333")
        getFilteredSchools();
      } else {
        console.log("444")
        getSchools();
      }
    }

    const data = localStorage.getItem('schools');
    console.log("Existing Data - " + JSON.parse(data))
    if (data && (localStorage.getItem('supervisorId')
      || localStorage.getItem('districtStateId')
      || localStorage.getItem('schStatus'))) {
      let sno = 1;
      const data1 = JSON.parse(data).schools.map((sch) => ({
        _id: sch._id,
        sno: sno++,
        code: sch.code,
        name: sch.nameEnglish,
        nameArabic: sch.nameArabic,
        nameNative: sch.nameNative,
        address: sch.address,
        city: sch.city,
        landmark: sch.landmark,
        districtState: sch.districtStateId ? sch.districtStateId?.district + ", " + sch.districtStateId?.state : "",
        active: sch.active,
        supervisorId: sch.supervisorId?.supervisorId,
        supervisorName: sch.supervisorId?.userId?.name,
        studentsCount: sch._studentsCount ? sch._studentsCount : 0,
        action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
      }));
      setSchools(data1);
      setFilteredSchools(data1);
      console.log("Data from local storage")

    } else {

      try {
        setFilteredSchools(null);
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
            city: sch.city,
            landmark: sch.landmark,
            districtState: sch.districtStateId ? sch.districtStateId?.district + ", " + sch.districtStateId?.state : "",
            active: sch.active,
            supervisorId: sch.supervisorId?.supervisorId,
            supervisorName: sch.supervisorId?.userId?.name,
            studentsCount: sch._studentsCount ? sch._studentsCount : 0,
            action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
          }));
          setSchools(data);
          setFilteredSchools(data)
          localStorage.removeItem('schools');
          localStorage.setItem('schools', JSON.stringify(responnse.data));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard");
        }
      } finally {
        setSchLoading(false)
      }
    };
  }

  const handleFilter = (e) => {
    const records = schools.filter((school) => (
      school.code?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.address?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.districtState?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.city?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.active?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.supervisorId?.toLowerCase().includes(e.target.value.toLowerCase())
      || school.supervisorName?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredSchools(records)
  }

  if (!filteredSchool) {
    return getSpinner();
  }

  return (
    <div className="p-5 bg-repeat">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage Niswans</h3>
      </div>

      <div className="flex justify-between items-center mt-5 relative">
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
          LinkIcon("/dashboard/add-school", "Add")
          : null}
      </div>

      {(localStorage.getItem('supervisorId') != null && localStorage.getItem('supervisorId') != 'null')
        || (localStorage.getItem('districtStateId') != null && localStorage.getItem('districtStateId') != 'null')
        || (localStorage.getItem('schStatus') != null && localStorage.getItem('schStatus') != 'null') ?
        <div className='grid lg:flex mt-3 lg:mt-7 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>Filter Applied: </p>

          <p>{localStorage.getItem('supervisorId') != null && localStorage.getItem('supervisorId') != 'null' ?
            <span className='text-blue-500'>Supervisor: <span className='text-gray-500'>
              {supervisors.filter(supervisor => supervisor._id === localStorage.getItem('supervisorId')).map(supervisor => supervisor.supervisorId + " : " + supervisor.userId.name) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('districtStateId') != null && localStorage.getItem('districtStateId') != 'null' ?
            <span className='text-blue-500'>District & State: <span className='text-gray-500'>
              {districtStates.filter(districtState => districtState._id === localStorage.getItem('districtStateId')).map(districtState => districtState.district + ", " + districtState.state) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('schStatus') != null && localStorage.getItem('schStatus') != 'null' ?
            <span className='text-blue-500'>Status: <span className='text-gray-500'>
              {localStorage.getItem('schStatus')}</span></span> : null}</p>

        </div>
        : <div className='flex mt-3 lg:mt-7'></div>}

      {filtering ?
        getFilterGif() :
        <div className='mt-3 lg:mt-7 rounded-lg shadow-lg bg-blue-50'>
          <DataTable columns={columns} data={filteredSchool} highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} expandableRows expandableRowsComponent={ExpandedComponent} />
        </div>}
    </div>
  )
}

export default List