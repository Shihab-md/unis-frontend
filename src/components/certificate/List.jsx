import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { openPreservedFilterPopup } from '../common/PreservedFilterPopup';
import { readPopupFilters, savePopupFilters, loadPopupOptions, popupFilterValue, fixedPopupSchoolId, hasFixedPopupSchool } from '../../utils/popupFilterStorage';
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, CertificateButtons, CertificateCard } from '../../utils/CertificateHelper'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert, getFilterGif } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';

const POPUP_KEYS = {'schoolId': 'certSchoolId', 'courseId': 'certCourseId', 'acYear': 'certACYearId', 'q': 'popupFilter:certificate:search'};

const List = () => {
  const { tr, direction, fontFamily } = useLanguage();
  const { user } = useAuth();

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [certificates, setCertificates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredCertificate, setFilteredCertificates] = useState(null)
  const [filtering, setFiltering] = useState(false)
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [searchText, setSearchText] = useState(() => readPopupFilters(POPUP_KEYS).q);
  const [listDataLoaded, setListDataLoaded] = useState(false);

  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1);

  const requestRef=useRef(0);

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(Array.isArray(schools) ? schools : []);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const getCoursesMap = async (id) => {
      const courses = await getCoursesFromCache(id);
      setCourses(Array.isArray(courses) ? courses : []);
    };
    getCoursesMap();
  }, []);

  useEffect(() => {
    const getAcademicYearsMap = async (id) => {
      const academicYears = await getAcademicYearsFromCache(id);
      setAcademicYears(Array.isArray(academicYears) ? academicYears : []);
    };
    getAcademicYearsMap();
  }, []);

  const openFilterPopup = async () => {
    try {
      const [availableSchools, availableCourses, availableYears] = await loadPopupOptions(getSchoolsFromCache, getCoursesFromCache, getAcademicYearsFromCache);
      const values = {...readPopupFilters(POPUP_KEYS),q:searchText};
      const fixedId = fixedPopupSchoolId(user);
      const fixedNiswan = hasFixedPopupSchool(user);
      const schoolOptions = (fixedNiswan ? availableSchools.filter(item=>String(item._id)===fixedId) : availableSchools).map(item=>({value:String(item._id),label:`${item.code} : ${item.nameEnglish}`}));
      if(fixedId && !schoolOptions.length)schoolOptions.push({value:fixedId,label:localStorage.getItem('schoolName') || tr('Niswan')});
      if(fixedNiswan)values.schoolId=fixedId;
      const activeYear=availableYears.find(year=>year.active==='Active');
      if(!availableYears.some(year=>String(year._id)===values.acYear))values.acYear=activeYear?String(activeYear._id):'';
      const next = await openPreservedFilterPopup({
        fields:[
        {key:'schoolId',label:'Niswan',disabled:fixedNiswan,options:schoolOptions},
        {key:'courseId',label:'Course',options:availableCourses.map(item=>({value:String(item._id),label:item.name}))},
        {key:'acYear',label:'Academic Year',options:availableYears.map(item=>({value:String(item._id),label:item.acYear}))},
        ],values,defaults:{schoolId:fixedNiswan?fixedId:'',courseId:'',acYear:activeYear?String(activeYear._id):'',q:''},tr,direction,fontFamily,
      });
      if(!next)return;
      savePopupFilters(POPUP_KEYS,next,'certificates');
      setSearchText(next.q);
      if(Object.keys(POPUP_KEYS).some(key=>key!=='q' && next[key]))await getFilteredCertificates();
      else await getCertificates();
    } catch(error) {
      showSwalAlert('Error!',error?.response?.data?.error || tr('Error!'),'error');
    }
  };

  const getFilteredCertificates = async () => {
    const request=++requestRef.current;
    const fixedId=fixedPopupSchoolId(user);
    if(fixedId)localStorage.setItem('certSchoolId',fixedId);
    setFiltering(true)
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "certificate/byCertFilter/"
        + localStorage.getItem('certSchoolId') + "/"
        + localStorage.getItem('certCourseId') + "/"
        + localStorage.getItem('certACYearId'),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (request!==requestRef.current)return;
      if (responnse.data.success) {
        let sno = 1;
        const data = await responnse.data.certificates.map((sup) => ({
          _id: sup._id,
          sno: sno++,
          sanadhNo: sup.code,
          studentName: sup.userId?.name,
          rollNumber: sup.studentId?.rollNumber,
          sanadhName: sup.courseId?.name,
          niswanCode: sup.schoolId?.code,
          niswanName: sup.schoolId?.nameEnglish,
          action: (<CertificateButtons Id={sup._id} />),
        }));
        setCertificates(data);
      setListDataLoaded(true);
        setFilteredCertificates(data)
        localStorage.removeItem('certificates');
        localStorage.setItem('certificates', JSON.stringify(responnse.data));
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
    if (checkAuth("certificatesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchCertificates = async () => {
      setSupLoading(true)

      const data = localStorage.getItem('certificates');
      if (['certSchoolId','certCourseId','certACYearId'].some(popupFilterValue)) {
        console.log("111")
        getFilteredCertificates();
      } else {
        console.log("222")
        getCertificates();
      }
    };

    fetchCertificates();
  }, []);

  const getCertificates = async () => {
    const request=++requestRef.current;

    const onCertificateDelete = () => {
      const data = localStorage.getItem('certificates');
      if (data) {
        console.log("333")
        getFilteredCertificates();
      } else {
        console.log("444")
        getCertificates();
      }
    }

    const data = localStorage.getItem('certificates');
    console.log("Existing Data - " + JSON.parse(data))
    if (data && ['certSchoolId','certCourseId','certACYearId'].some(popupFilterValue)) {
      let sno = 1;
      const data1 = JSON.parse(data).certificates.map((sup) => ({
        _id: sup._id,
        sno: sno++,
        sanadhNo: sup.code,
        studentName: sup.userId?.name,
        rollNumber: sup.studentId?.rollNumber,
        sanadhName: sup.courseId?.name,
        niswanCode: sup.schoolId?.code,
        niswanName: sup.schoolId?.nameEnglish,
        action: (<CertificateButtons Id={sup._id} onCertificateDelete={onCertificateDelete} />),
      }));
      setCertificates(data1);
      setListDataLoaded(true);
      setFilteredCertificates(data1)
      console.log("Data from local storage")

    } else {

      try {
        setFilteredCertificates(null)
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "certificate",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (request!==requestRef.current)return;
      if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.certificates.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            sanadhNo: sup.code,
            studentName: sup.userId?.name,
            rollNumber: sup.studentId?.rollNumber,
            sanadhName: sup.courseId?.name,
            niswanCode: sup.schoolId?.code,
            niswanName: sup.schoolId?.nameEnglish,
            fatherName: sup?.studentId?.fatherName
              ? sup?.studentId?.fatherName
              : sup?.studentId?.motherName
                ? sup?.studentId?.motherName
                : sup?.studentId?.guardianName
                  ? sup?.studentId?.guardianName
                  : "",
            action: (<CertificateButtons Id={sup._id} onCertificateDelete={onCertificateDelete} />),
          }));
          setCertificates(data);
      setListDataLoaded(true);
          setFilteredCertificates(data);
          localStorage.removeItem('certificates');
          localStorage.setItem('certificates', JSON.stringify(responnse.data));
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
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
    setFilteredCertificates(certificates.filter((sup) => !searchText || (
      sup.sanadhNo?.toLowerCase().includes(searchText.toLowerCase())
      || sup.studentName?.toLowerCase().includes(searchText.toLowerCase())
      || sup.rollNumber?.toLowerCase().includes(searchText.toLowerCase())
      || sup.sanadhName?.toLowerCase().includes(searchText.toLowerCase())
      || sup.niswanCode?.toLowerCase().includes(searchText.toLowerCase())
    )));
  },[certificates,searchText,listDataLoaded]);

  if (!filteredCertificate) {
    return getSpinner();
  }

  return (
    <div dir={direction} style={{fontFamily}} className="p-3 lg:p-5 bg-repeat mt-3 lg:mt-5">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-shadow-lg text-gray-600">Manage Certificates
          <p className='flex md:grid text-sm md:text-base justify-center text-rose-700'>
            (Records Count : {filteredCertificate ? filteredCertificate.length : 0}) </p>
        </h3>
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

        <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>

        {checkAuth("certificateAdd") !== "NO" ? LinkIcon("/dashboard/add-certificate", "Add") : null}
      </div>

      {(localStorage.getItem('certSchoolId') != null && localStorage.getItem('certSchoolId') != 'null')
        || (localStorage.getItem('certCourseId') != null && localStorage.getItem('certCourseId') != 'null')
        || (localStorage.getItem('certACYearId') != null && localStorage.getItem('certACYearId') != 'null') ?

        <div className='grid lg:flex mt-3 mb-3 lg:mt-7 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>Filter Applied: </p>

          <p>{localStorage.getItem('certSchoolId') != null && localStorage.getItem('certSchoolId') != 'null' ?
            <span className='text-blue-500'>Niswan: <span className='text-gray-500'>
              {schools.filter(school => school._id === localStorage.getItem('certSchoolId')).map(school => school.code + " : " + school.nameEnglish) + ", "}
            </span></span> : null}</p>

          <p>{localStorage.getItem('certCourseId') != null && localStorage.getItem('certCourseId') != 'null' ?
            <span className='text-blue-500'>Course: <span className='text-gray-500'>
              {courses.filter(course => course._id === localStorage.getItem('certCourseId')).map(course => course.name) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('certACYearId') != null && localStorage.getItem('certACYearId') != 'null' ?
            <span className='text-blue-500'>AC Year: <span className='text-gray-500'>
              {academicYears.filter(acYear => acYear._id === localStorage.getItem('certACYearId')).map(acYear => acYear.acYear)}
            </span></span> : null}</p>

        </div>
        : <div className='flex mt-3 lg:mt-7'></div>}

      {filtering ?
        getFilterGif() :
        (
          <>
            {/* Mobile / Tablet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {filteredCertificate.map((row) => (
                <CertificateCard key={row._id} row={row} />
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
              <DataTable columns={columns} data={filteredCertificate} pagination highlightOnHover striped responsive />
            </div>
          </>)}
    </div>
  )
}

export default List