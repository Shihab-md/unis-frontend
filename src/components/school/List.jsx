import { openPreservedFilterPopup } from '../common/PreservedFilterPopup';
import { readPopupFilters, savePopupFilters, loadPopupOptions, popupFilterValue } from '../../utils/popupFilterStorage';
import SchoolReportActions from './SchoolReportActions';
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, SchoolButtons, SchoolCard, conditionalRowStyles } from '../../utils/SchoolHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { isGlobalHqReadRole } from "../../auth/roles";
import { PERMISSIONS } from '../../auth/permissions'
import { AutoText, useLanguage } from '../../i18n/LanguageContext';
import { getSupervisorsFromCache } from '../../utils/SupervisorHelper';
import { getDistrictStatesFromCache } from '../../utils/DistrictStateHelper';
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert, getFilterGif } from '../../utils/CommonHelper'

const POPUP_KEYS = {'supervisorId': 'supervisorId', 'districtStateId': 'districtStateId', 'status': 'schStatus', 'q': 'popupFilter:school:search'};

const List = () => {
  const { tr, direction, fontFamily } = useLanguage();

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const readReportFilters = () => ({supervisorId:popupFilterValue('supervisorId'),districtStateId:popupFilterValue('districtStateId'),status:popupFilterValue('schStatus')});
  const [reportFilters,setReportFilters]=useState(readReportFilters);
  const [searchText,setSearchText]=useState(() => readPopupFilters(POPUP_KEYS).q);
  const [schoolsLoaded,setSchoolsLoaded]=useState(false);
  const [schools, setSchools] = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [filteredSchool, setFilteredSchools] = useState(null)
  const [supervisors, setSupervisors] = useState([]);
  const [districtStates, setDistrictStates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate()

  const requestRef=useRef(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const getSupervisorsMap = async (id) => {
      const supervisors = await getSupervisorsFromCache(id);
      setSupervisors(Array.isArray(supervisors) ? supervisors : []);
    };
    getSupervisorsMap();
  }, []);

  useEffect(() => {
    const getDistrictStatesMap = async (id) => {
      const districtStates = await getDistrictStatesFromCache(id);
      setDistrictStates(Array.isArray(districtStates) ? districtStates : []);
    };
    getDistrictStatesMap();
  }, []);
  {/*
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
        : null);
  }*/}

  const { user, can } = useAuth();

  const openFilterPopup = async () => {
    try {
      const [supervisors, locations] = await loadPopupOptions(getSupervisorsFromCache, getDistrictStatesFromCache);
      const values = {...readPopupFilters(POPUP_KEYS),q:searchText};
      const choices=labels=>labels.map(label=>({value:label,label:tr(label)}));
      const next = await openPreservedFilterPopup({
        fields:[
        {key:'supervisorId',label:'Supervisor',options:supervisors.map(item=>({value:String(item._id),label:`${item.supervisorId} : ${item.userId?.name || ''}`}))},
        {key:'districtStateId',label:'District & State',options:locations.map(item=>({value:String(item._id),label:`${item.district}, ${item.state}`}))},
        {key:'status',label:'Status',options:choices(['Active','In-Active'])},
        ],values,defaults:Object.fromEntries(Object.keys(POPUP_KEYS).map(key=>[key,''])),tr,direction,fontFamily,
      });
      if(!next)return;
      savePopupFilters(POPUP_KEYS,next,'schools');
      setSearchText(next.q);
      if(Object.keys(POPUP_KEYS).some(key=>key!=='q' && next[key]))await getFilteredSchools();
      else await getSchools();
    } catch(error) {
      showSwalAlert('Error!',error?.response?.data?.error || tr('Error!'),'error');
    }
  };

  const onSchoolDelete = () => getFilteredSchools();

  const getFilteredSchools = async () => {
    const request=++requestRef.current;
    const requestedFilters=readReportFilters();
    setFiltering(true)
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "school/bySchFilter/"
        + (requestedFilters.supervisorId||'null') + "/"
        + (requestedFilters.districtStateId||'null') + "/"
        + (requestedFilters.status||'null'),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (request!==requestRef.current)return;
      if (responnse.data.success) {
        let sno = 1;
        //const data = await responnse.data.schools.map((sch) => ({
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
          incharge1: sch.incharge1,
          incharge1Number: sch.incharge1Number,
          supervisorId: sch.supervisorId?.supervisorId,
          supervisorName: sch.supervisorId?.userId?.name,
          studentCount: sch.studentCount ? sch.studentCount : 0,
          studentCountsByCourse: sch.studentCountsByCourse && sch.studentCountsByCourse?.length > 0 ? sch.studentCountsByCourse : [],
          employeeCount: sch.employeeCount ? sch.employeeCount : 0,
          employeeCountsByRole: sch.employeeCountsByRole && sch.employeeCountsByRole?.length > 0 ? sch.employeeCountsByRole : [],
          action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
        }));
        setSchools(data);
        setSchoolsLoaded(true);
        setReportFilters(requestedFilters);
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
      if(request===requestRef.current){setFiltering(false);setSchLoading(false);}
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
      if (['supervisorId','districtStateId','schStatus'].some(popupFilterValue)) {
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
    const request=++requestRef.current;


    const data = localStorage.getItem('schools');
    //console.log("Existing Data - " + JSON.parse(data))
    if (data && ['supervisorId','districtStateId','schStatus'].some(popupFilterValue)) {
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
        incharge1: sch.incharge1,
        incharge1Number: sch.incharge1Number,
        supervisorId: sch.supervisorId?.supervisorId,
        supervisorName: sch.supervisorId?.userId?.name,
        studentCount: sch.studentCount ? sch.studentCount : 0,
        studentCountsByCourse: sch.studentCountsByCourse && sch.studentCountsByCourse?.length > 0 ? sch.studentCountsByCourse : [],
        employeeCount: sch.employeeCount ? sch.employeeCount : 0,
        employeeCountsByRole: sch.employeeCountsByRole && sch.employeeCountsByRole?.length > 0 ? sch.employeeCountsByRole : [],
        action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
      }));
      setSchools(data1);
      setSchoolsLoaded(true);
      setReportFilters(readReportFilters());
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
        if (request!==requestRef.current)return;
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
            incharge1: sch.incharge1,
            incharge1Number: sch.incharge1Number,
            supervisorId: sch.supervisorId?.supervisorId,
            supervisorName: sch.supervisorId?.userId?.name,
            studentCount: sch.studentCount ? sch.studentCount : 0,
            studentCountsByCourse: sch.studentCountsByCourse && sch.studentCountsByCourse?.length > 0 ? sch.studentCountsByCourse : [],
            employeeCount: sch.employeeCount ? sch.employeeCount : 0,
            employeeCountsByRole: sch.employeeCountsByRole && sch.employeeCountsByRole?.length > 0 ? sch.employeeCountsByRole : [],
            action: (<SchoolButtons Id={sch._id} onSchoolDelete={onSchoolDelete} />),
          }));
          setSchools(data);
        setSchoolsLoaded(true);
          setReportFilters({supervisorId:'',districtStateId:'',status:''});
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
        if(request===requestRef.current){setSchLoading(false);setFiltering(false);}
      }
    };
  }

  const handleFilter = event => { const q=event.target.value;setSearchText(q);savePopupFilters({q:POPUP_KEYS.q},{q}); };
  useEffect(() => {
    if(!schoolsLoaded)return;
    const query=searchText.trim().toLowerCase();
    setFilteredSchools(schools.filter(school => !query || ['code','name','address','districtState','city','active','supervisorId','supervisorName'].some(key => String(school[key]??'').toLowerCase().includes(query))));
  },[schools,searchText,schoolsLoaded]);

  if (!filteredSchool) {
    return getSpinner();
  }

  return (
    <div dir={direction} style={{ fontFamily }} className="p-3 lg:p-5 bg-repeat mt-1 lg:mt-5">
      <div className="text-center">
        <AutoText as="h3" text={tr("Manage Niswans")} variant="heading" className="font-bold px-5 py-0 text-gray-600" />
        <p className='text-xs sm:text-sm justify-center text-rose-700'>
          ({tr("Records Count")} : {filteredSchool ? filteredSchool.length : 0})
        </p>
      </div>

      <div className="flex justify-between items-center mt-5 relative">
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

        {can(PERMISSIONS.NISWAN_CREATE) ?
          LinkIcon("/dashboard/add-school", "Add")
          : null}
      </div>

      {(localStorage.getItem('supervisorId') != null && localStorage.getItem('supervisorId') != 'null')
        || (localStorage.getItem('districtStateId') != null && localStorage.getItem('districtStateId') != 'null')
        || (localStorage.getItem('schStatus') != null && localStorage.getItem('schStatus') != 'null') ?
        <div className='grid lg:flex mt-3 lg:mt-3 mb-2 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>{tr("Filter Applied:")} </p>

          <p>{localStorage.getItem('supervisorId') != null && localStorage.getItem('supervisorId') != 'null' ?
            <span className='text-blue-500'>{tr("Supervisor")}: <span className='text-gray-500'>
              {supervisors.filter(supervisor => supervisor._id === localStorage.getItem('supervisorId')).map(supervisor => supervisor.supervisorId + " : " + supervisor.userId.name) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('districtStateId') != null && localStorage.getItem('districtStateId') != 'null' ?
            <span className='text-blue-500'>{tr("District & State")}: <span className='text-gray-500'>
              {districtStates.filter(districtState => districtState._id === localStorage.getItem('districtStateId')).map(districtState => districtState.district + ", " + districtState.state) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('schStatus') != null && localStorage.getItem('schStatus') != 'null' ?
            <span className='text-blue-500'>{tr("Status")}: <span className='text-gray-500'>
              {tr(localStorage.getItem('schStatus'))}</span></span> : null}</p>

        </div>
        : <div className='flex mt-3 lg:mt-7'></div>}

      <SchoolReportActions filters={{...reportFilters,search:searchText.trim()}} loading={schLoading||filtering} />

      {filtering ?
        getFilterGif() :
        (
          <>
            {/* Mobile / Tablet */}
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {filteredSchool.map((row) => (
                <SchoolCard key={row._id} row={row} />
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
              <DataTable
                columns={columns}
                data={filteredSchool}
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