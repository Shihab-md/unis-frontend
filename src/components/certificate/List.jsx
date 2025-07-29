import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, CertificateButtons } from '../../utils/CertificateHelper'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getAcademicYearsFromCache } from '../../utils/AcademicYearHelper';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [certificates, setCertificates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredCertificate, setFilteredCertificates] = useState(null)

  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const getCoursesMap = async (id) => {
      const courses = await getCoursesFromCache(id);
      setCourses(courses);
    };
    getCoursesMap();
  }, []);

  useEffect(() => {
    const getAcademicYearsMap = async (id) => {
      const academicYears = await getAcademicYearsFromCache(id);
      setAcademicYears(academicYears);
    };
    getAcademicYearsMap();
  }, []);

  const openFilterPopup = async () => {

    let selectedSchoolId;
    let selectedCourseId;
    let selectedACYearId;
    const { value: formValues } = await MySwal.fire({
      //  title: 'Filters',
      background: "url(/bg_card.png)",
      html: (
        <div className="mb-2 h-80 w-full">
          <div className='text-xl font-bold mb-1 text-green-600 text-center'>Filter</div>
          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>Niswan</span>
            <Select className='text-sm text-start mb-3'
              options={schools.map(option => ({
                value: option._id, label: option.code + " : " + option.nameEnglish
              }))}

              onChange={(selectedOption) => {
                selectedSchoolId = selectedOption.value;
              }}
              maxMenuHeight={210}
            />
          </div>

          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>Course</span>
            <Select className='text-sm text-start mb-3'
              options={courses.map(option => ({
                value: option._id, label: option.name
              }))}

              onChange={(selectedOption) => {
                selectedCourseId = selectedOption.value;
              }}
              maxMenuHeight={210}
            />
          </div>

          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>AC Year</span>
            <Select className='text-sm text-start mb-2'
              options={academicYears.map(option => ({
                value: option._id, label: option.acYear
              }))}

              onChange={(selectedOption) => {
                selectedACYearId = selectedOption.value;
              }}
              maxMenuHeight={210}
            />
          </div>
        </div>
      ),
      focusConfirm: false,
      preConfirm: () => {
        const select1 = selectedSchoolId ? selectedSchoolId : null;
        const select2 = selectedCourseId ? selectedCourseId : null;
        const select3 = selectedACYearId ? selectedACYearId : null;

        return [select1, select2, select3];
      }
    });

    if (formValues && (formValues[0] || formValues[1] || formValues[2])) {

      console.log('Selected values:', formValues);
      const certSchoolId = formValues[0] ? formValues[0] : null;
      const certCourseId = formValues[1] ? formValues[1] : null;
      const certACYearId = formValues[2] ? formValues[2] : null;

      console.log('Selected certSchoolId:', formValues[0]);
      console.log('Selected certCourseId:', formValues[1]);
      console.log('Selected certACYearId:', formValues[2]);

      localStorage.setItem('certSchoolId', certSchoolId);
      localStorage.setItem('certCourseId', certCourseId);
      localStorage.setItem('certACYearId', certACYearId);

      getFilteredCertificates();

    } else {

      localStorage.removeItem('certSchoolId');
      localStorage.removeItem('certCourseId');
      localStorage.removeItem('certACYearId');

      getCertificates();
    }
  };

  const getFilteredCertificates = async () => {

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
      setSupLoading(false)
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
      if (data && (localStorage.getItem('certSchoolId')
        || localStorage.getItem('certCourseId')
        || localStorage.getItem('certACYearId'))) {
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
    if (data && (localStorage.getItem('certSchoolId')
      || localStorage.getItem('certCourseId')
      || localStorage.getItem('certACYearId'))) {
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
      setFilteredCertificates(data1)
      console.log("Data from local storage")

    } else {

      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "certificate",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
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
            action: (<CertificateButtons Id={sup._id} onCertificateDelete={onCertificateDelete} />),
          }));
          setCertificates(data);
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
        setSupLoading(false)
      }
    };
  }

  const handleFilter = (e) => {
    const records = certificates.filter((sup) => (
      sup.sanadhNo?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.studentName?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.rollNumber?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.sanadhName?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.niswanCode?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredCertificates(records)
  }

  if (!filteredCertificate) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg text-gray-600">Manage Certificates</h3>
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

        <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>

        {LinkIcon("/dashboard/add-certificate", "Add")}
      </div>

      {(localStorage.getItem('certSchoolId') != null && localStorage.getItem('certSchoolId') != 'null')
        || (localStorage.getItem('certCourseId') != null && localStorage.getItem('certCourseId') != 'null')
        || (localStorage.getItem('certACYearId') != null && localStorage.getItem('certACYearId') != 'null') ?

        <div className='grid lg:flex mt-3 text-xs text-lime-600 items-center justify-center'>
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
        : <div className='flex mt-3'></div>}

      <div className='mt-3 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredCertificate} pagination highlightOnHover striped responsive />
      </div>
    </div>
  )
}

export default List