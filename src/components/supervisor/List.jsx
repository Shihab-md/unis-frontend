import { openPreservedFilterPopup } from '../common/PreservedFilterPopup';
import { readPopupFilters, savePopupFilters, loadPopupOptions, popupFilterValue } from '../../utils/popupFilterStorage';
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SupervisorButtons, SupervisorCard, conditionalRowStyles } from '../../utils/SupervisorHelper'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert, getFilterGif } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import { useAuth } from '../../context/AuthContext'
import { isGlobalHqReadRole } from "../../auth/roles";
import { PERMISSIONS } from '../../auth/permissions'
import axios from 'axios'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { AutoText, useLanguage } from '../../i18n/LanguageContext';

const POPUP_KEYS = {'schoolId': 'supSchoolId', 'status': 'supStatus', 'jobType': 'supType', 'q': 'popupFilter:supervisor:search'};

const List = () => {
  const { tr, direction, fontFamily } = useLanguage();
  const { user, can } = useAuth();

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [searchText, setSearchText] = useState(() => readPopupFilters(POPUP_KEYS).q);
  const [listDataLoaded, setListDataLoaded] = useState(false);

  const navigate = useNavigate()
  const [supervisors, setSupervisors] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredSupervisor, setFilteredSupervisors] = useState(null)
  const [schools, setSchools] = useState([])
  const [filtering, setFiltering] = useState(false)

  const requestRef=useRef(0);

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(Array.isArray(schools) ? schools : []);
    };
    getSchoolsMap();
  }, []);

  const openFilterPopup = async () => {
    try {
      const [availableSchools] = await loadPopupOptions(getSchoolsFromCache);
      const values = {...readPopupFilters(POPUP_KEYS),q:searchText};
      const choices=labels=>labels.map(label=>({value:label,label:tr(label)}));
      const next = await openPreservedFilterPopup({
        fields:[
        {key:'schoolId',label:'Niswan',options:availableSchools.map(item=>({value:String(item._id),label:`${item.code} : ${item.nameEnglish}`}))},
        {key:'status',label:'Status',options:choices(['Active','In-Active'])},
        {key:'jobType',label:'Job Type',options:choices(['Full-Time','Part-Time'])},
        ],values,defaults:Object.fromEntries(Object.keys(POPUP_KEYS).map(key=>[key,''])),tr,direction,fontFamily,
      });
      if(!next)return;
      savePopupFilters(POPUP_KEYS,next,'supervisors');
      setSearchText(next.q);
      if(Object.keys(POPUP_KEYS).some(key=>key!=='q' && next[key]))await getFilteredSupervisors();
      else await getSupervisors();
    } catch(error) {
      showSwalAlert('Error!',error?.response?.data?.error || tr('Error!'),'error');
    }
  };

  const getFilteredSupervisors = async () => {
    const request=++requestRef.current;
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
      if (request!==requestRef.current)return;
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
          doj: sup.doj,
          dob: sup.dob,
          schoolsCount: sup._schoolsCount ?? sup.schoolCount ?? 0,
          schoolActiveCount: sup.schoolActiveCount ?? 0,
          schoolInactiveCount: sup.schoolInactiveCount ?? 0,
          studentCount: sup.studentCount ? sup.studentCount : 0,
          studentCourseCount: sup.studentCourseCount ? sup.studentCourseCount : 0,
          studentCountsByCourse: sup.studentCountsByCourse && sup.studentCountsByCourse?.length > 0 ? sup.studentCountsByCourse : [],
          //  profileImage: <img width={40} className='rounded-full' src={(getBaseUrl()).toString() + `${sup.userId.profileImage}`} />,
          employeeCount: sup.employeeCount ? sup.employeeCount : 0,
          employeeCountsByRole: sup.employeeCountsByRole && sup.employeeCountsByRole?.length > 0 ? sup.employeeCountsByRole : [],
          action: (<SupervisorButtons Id={sup._id} />),
        }));
        setSupervisors(data);
      setListDataLoaded(true);
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
      if(request===requestRef.current){setFiltering(false);setSupLoading(false);}
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
      if (['supSchoolId','supStatus','supType'].some(popupFilterValue)) {
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
    const request=++requestRef.current;

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
    if (data && ['supSchoolId','supStatus','supType'].some(popupFilterValue)) {
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
        doj: sup.doj,
        dob: sup.dob,
        //  dob: new Date(sup.dob).toLocaleDateString(),
        schoolsCount: sup._schoolsCount ?? sup.schoolCount ?? 0,
        schoolActiveCount: sup.schoolActiveCount ?? 0,
        schoolInactiveCount: sup.schoolInactiveCount ?? 0,
        studentCount: sup.studentCount ? sup.studentCount : 0,
        studentCourseCount: sup.studentCourseCount ? sup.studentCourseCount : 0,
        studentCountsByCourse: sup.studentCountsByCourse && sup.studentCountsByCourse?.length > 0 ? sup.studentCountsByCourse : [],
        //  profileImage: <img width={40} className='rounded-full' src={(getBaseUrl()).toString() + `${sup.userId.profileImage}`} />,
        employeeCount: sup.employeeCount ? sup.employeeCount : 0,
        employeeCountsByRole: sup.employeeCountsByRole && sup.employeeCountsByRole?.length > 0 ? sup.employeeCountsByRole : [],
        action: (<SupervisorButtons Id={sup._id} onSupervisorDelete={onSupervisorDelete} />),
      }));
      setSupervisors(data1);
      setListDataLoaded(true);
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
        if (request!==requestRef.current)return;
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
            doj: sup.doj,
            dob: sup.dob,
            //  dob: new Date(sup.dob).toLocaleDateString(),
            schoolsCount: sup._schoolsCount ?? sup.schoolCount ?? 0,
            schoolActiveCount: sup.schoolActiveCount ?? 0,
            schoolInactiveCount: sup.schoolInactiveCount ?? 0,
            studentCount: sup.studentCount ? sup.studentCount : 0,
            studentCourseCount: sup.studentCourseCount ? sup.studentCourseCount : 0,
            studentCountsByCourse: sup.studentCountsByCourse && sup.studentCountsByCourse?.length > 0 ? sup.studentCountsByCourse : [],
            //  profileImage: <img width={40} className='rounded-full' src={(getBaseUrl()).toString() + `${sup.userId.profileImage}`} />,
            employeeCount: sup.employeeCount ? sup.employeeCount : 0,
            employeeCountsByRole: sup.employeeCountsByRole && sup.employeeCountsByRole?.length > 0 ? sup.employeeCountsByRole : [],
            action: (<SupervisorButtons Id={sup._id} onSupervisorDelete={onSupervisorDelete} />),
          }));
          setSupervisors(data);
      setListDataLoaded(true);
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
        if(request===requestRef.current){setSupLoading(false);setFiltering(false);}
      }
    };
  }

  const handleFilter = (event) => {
    const q=event.target.value;
    setSearchText(q);
    savePopupFilters({q:POPUP_KEYS.q},{q});
  };
  useEffect(() => {
    if(!listDataLoaded)return;
    setFilteredSupervisors(supervisors.filter((sup) => !searchText || (
      sup.supId?.toLowerCase().includes(searchText.toLowerCase())
      || sup.name?.toLowerCase().includes(searchText.toLowerCase())
      || sup.active?.toLowerCase().includes(searchText.toLowerCase())
      || sup.jobType?.toLowerCase().includes(searchText.toLowerCase())
      || sup.contactNumber?.toString().toLowerCase().includes(searchText.toLowerCase())
    )));
  },[supervisors,searchText,listDataLoaded]);

  if (!filteredSupervisor) {
    return getSpinner();
  }

  return (
    <div dir={direction} style={{ fontFamily }} className="p-3 lg:p-5 bg-repeat mt-1 lg:mt-5">
      <div className="text-center">
        <AutoText as="h3" text={tr("Manage Supervisors")} variant="heading" className="font-bold px-5 py-0 text-gray-600" />
        <p className='text-xs sm:text-sm justify-center text-rose-700'>
          ({tr("Records Count")} : {filteredSupervisor ? filteredSupervisor.length : 0})
        </p>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border lg:shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-2 rounded-l-md`}>
            <input
              type="text"
              placeholder={tr("Search")}
              className="w-full px-3 py-0.5 border rounded shadow-md justify-center ml-1 lg:ml-0 mr-3 lg:mr-0"
              value={searchText}
              onChange={handleFilter}
            />
          </div>
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center ">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {isGlobalHqReadRole(user.role) ?
          <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>
          : null}

        {can(PERMISSIONS.SUPERVISOR_CREATE) ?
          LinkIcon("/dashboard/add-supervisor", "Add") : null}
      </div>

      {(localStorage.getItem('supSchoolId') != null && localStorage.getItem('supSchoolId') != 'null')
        || (localStorage.getItem('supStatus') != null && localStorage.getItem('supStatus') != 'null')
        || (localStorage.getItem('supType') != null && localStorage.getItem('supType') != 'null') ?

        <div className='grid lg:flex mt-3 lg:mt-3 mb-2 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>{tr("Filter Applied:")} </p>

          <p>{localStorage.getItem('supSchoolId') != null && localStorage.getItem('supSchoolId') != 'null' ?
            <span className='text-blue-500'>{tr("Niswan")}: <span className='text-gray-500'>
              {schools.filter(school => school._id === localStorage.getItem('supSchoolId')).map(school => school.code + " : " + school.nameEnglish) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('supStatus') != null && localStorage.getItem('supStatus') != 'null' ?
            <span className='text-blue-500'>{tr("Status")}: <span className='text-gray-500'>
              {tr(localStorage.getItem('supStatus'))}</span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('supType') != null && localStorage.getItem('supType') != 'null' ?
            <span className='text-blue-500'>{tr("Job Type")}: <span className='text-gray-500'>
              {tr(localStorage.getItem('supType'))}</span></span> : null}</p>

        </div>
        : <div className='flex mt-3 lg:mt-3'></div>}

      {filtering ? (
        getFilterGif()
      ) : (
        <>
          {/* Mobile / Tablet Cards */}
          <div className="mt-2 lg:mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredSupervisor.map((row) => (
              <SupervisorCard key={row._id} row={row} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className='hidden lg:block mt-3 lg:mt-5 rounded-lg shadow-lg'>
            <DataTable
              columns={columns}
              data={filteredSupervisor}
              showGridlines
              highlightOnHover
              striped
              responsive
              conditionalRowStyles={conditionalRowStyles}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default List