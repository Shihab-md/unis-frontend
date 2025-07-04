import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, StudentButtons, conditionalRowStyles } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, getPrcessing, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import 'animate.css';
import * as XLSX from 'xlsx';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [schools, setSchools] = useState([]);
  const [inputOptions, setInputOptions] = useState([]);
  const [students, setStudents] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(null);
  const [filteredStudent, setFilteredStudents] = useState(null)

  const navigate = useNavigate()
  const { user } = useAuth()

  let schoolId;
  const [excelData, setExcelData] = useState([]);
  const [processing, setProcessing] = useState(null)

  const [selectedOptions, setSelectedOptions] = useState([]);

  const MySwal = withReactContent(Swal);

  function NiswanSelect({ options, onChange, selectedValues }) {
    return <Select options={
      options.map((option) => ({
        value: option._id, label: option.code + " : " + option.nameEnglish
      }
      ))
    }
      //onChange={handleSelectChange}
      selectedValues={selectedOptions} />;
  }

  const handleSelectChange = (option) => {
    setSelectedOptions(option);
  };

  const openFilterPopup = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Filters',
      background: "url(/bg_card.png)",
      html: `

        <div className='grid justify-between items-center relative'>
          <label className='justify-start relative'>Course </label>
          <select id="swal-course" className="swal2-input w-3/5 lg:w-3/6 ml-10 relative justify-center rounded shadow-lg" style="margin-top: 20px;">
            <option value="">Select </option>
            <option value="Muballiga">Muballiga</option>
            <option value="Muallama">Muallama</option>
            <option value="Makthab">Makthab</option>
            <option value="Munavvara">Munavvara</option>
          </select>
        </div>
        <div className='grid justify-between items-center relative'>
          <label className='justify-start relative'>Status </label>
          <select id="swal-status" className="swal2-input w-3/5 lg:w-3/6 ml-10 relative justify-center rounded shadow-lg" style="margin-top: 30px;">
            <option value="">Select</option>
            <option value="Active">Active</option>
            <option value="In-Active">In-Active</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Clear",
      // cancelButtonAriaLabel: "Clear",
      preConfirm: () => {
        const select1 = document.getElementById('swal-course').value;
        const select2 = document.getElementById('swal-status').value;
        return [select1, select2];
      }
    });

    if (formValues) {
      console.log('Selected values:', formValues);
      const course = formValues[0] ? formValues[0] : null;
      const status = formValues[1] ? formValues[1] : null;
      console.log('Selected value1:', formValues[0]);
      console.log('Selected value2:', formValues[1]);

      const records = students.filter((student) => {
        console.log('Selected value3:', student.course + ", " + course);
        let crc = student.course.toString();
        crc.toLowerCase().includes("makthab".toLowerCase())
        // || student.active && status ? student.active.toLowerCase().includes(status.toString().toLowerCase()) : false
      });

      setFilteredStudents(records)
    } else {
      setFilteredStudents(students)
    }
  };

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: "<h3 style='color:blue; font-size: 25px;'>Import Student Data</h3>",
      input: "file",
      background: "url(/bg_card.png)",
      inputAttributes: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        "accept": ".xlsx, .xls",
        "aria-label": "Upload School Student Data."
      },
      showClass: { popup: `animate__animated animate__fadeInUp animate__faster` },
      hideClass: { popup: `animate__animated animate__fadeOutDown animate__faster` }
    });

    if (file) {
      try {
        setProcessing(true);
        const reader = new FileReader();
        //let studentsDataList;
        reader.onload = (event) => {
          const binaryString = event.target.result;
          const workbook = XLSX.read(binaryString, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setExcelData(jsonData);
          //studentsDataList = JSON.stringify(excelData);
        };
        reader.readAsBinaryString(file);

        const studentsDataList = JSON.stringify(excelData);
        if (studentsDataList) {
          alert(studentsDataList)
          const response = await fetch((await getBaseUrl()).toString() + "student/import", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}`, 'Content-Type': 'application/json' },
            body: studentsDataList,
          });

          if (response.ok) {
            setProcessing(false);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = "Import_Result_" + new Date().getTime() + ".txt"
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Swal.fire({
              title: "Success!",
              html: "<b>" + "Successfully Imported! </br> Please check the result in downloaded text file : </br>" + fileName + "</b>",
              icon: "success",
              showConfirmButton: true,
              background: "url(/bg_card.png)",
            });

            navigate("/dashboard/students");
          } else {
            const resData = JSON.parse(JSON.stringify(await response.json()));
            setProcessing(false);
            Swal.fire({
              title: "Error!",
              html: "<b>" + "Data NOT Imported. Error : \n" + resData.error + "</b>",
              icon: "error",
              showConfirmButton: true,
              background: "url(/bg_card.png)",
            });
            console.error('Failed to send data.');
          }
        }
      } catch (error) {
        setProcessing(false);
        Swal.fire({
          title: "Error!",
          html: "<b>" + "Data NOT Imported. Exception : \n" + error + "</b>",
          icon: "error",
          showConfirmButton: true,
          background: "url(/bg_card.png)",
        });
      }
    } else {
      //  Swal.fire("Please select correct file and try again!");
    }
  }

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("studentsList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const onStudentDelete = () => {
      fetchStudents()
    }

    const fetchStudents = async () => {

      if (!localStorage.getItem('schoolId')) {
        const schools = await getSchoolsFromCache();
        setSchools(schools)
        let inputArray = [];
        schools.map((school) => (
          inputOptions[school._id] = school.code.substring(3) + " : " + school.nameEnglish + ", " + school.district + ", " + school.state
        ))

        setInputOptions(inputOptions);
        //  alert(inputOptions) 
        {/*  MySwal.fire({
          title: 'Select the Niswan',
          background: "url(/bg_card.png)",
          html: (
            <div className="mb-2" style={{ height: '30vh' }}>
              <Select id="selectBox" options={
                schools.map((option) => ({
                  value: option._id, label: option.code + " : " + option.nameEnglish
                }
                ))
              }
                onChange={handleSelectChange}
                selectedValues={selectedOptions}
              //  value={selectedOptions}
              />
            </div>
          ),
          preConfirm: () => {

            // Get selected value from dropdown
            var drpUserIdInput = $('#selectBox').val();
            setSelectedOptions(drpUserIdInput)
          }
        }).then((result) => {
          //  const resultStr = JSON.parse(JSON.stringify(result));
          //  alert(resultStr);
          if (result.isConfirmed) {
            // Handle the submitted data
            console.log('User confirmed selection:', selectedOptions);
          }
        });
*/}
        await Swal.fire({
          title: "<h3 style='color:blue; font-size: 25px;'>Select the Niswan</h3>",
          input: "select",
          inputOptions: inputOptions,
          inputPlaceholder: "Select the Niswan : UN-* ",
          showCancelButton: true,
          background: "url(/bg_card.png)",
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value && value != "") {
                schoolId = value;
                localStorage.setItem('schoolId', value);
                localStorage.setItem('schoolName', "UN-" + inputOptions[schoolId]);
              } else {
                navigate("/dashboard");
              }
              resolve();
            });
          }
        });

      } else {
        schoolId = localStorage.getItem('schoolId')
      }

      setSupLoading(true)
      if (schoolId) {

        try {
          const responnse = await axios.get(
            (await getBaseUrl()).toString() + "student/bySchoolId/" + schoolId,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (responnse.data.success) {
            let sno = 1;
            const data = await responnse.data.students.map((student) => ({
              _id: student._id,
              sno: sno++,
              name: student.userId?.name,
              schoolName: student.schoolId?.nameEnglish,
              rollNumber: student.rollNumber,
              address: student.address,
              city: student.city,
              district: student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.State : "",
              active: student.active,
              course: student.courses && student.courses?.length > 0 ? student.courses.map(course => course.name ? course.name + ", " : "") : "",
              courses: student.courses && student.courses?.length > 0 ? student.courses : null,
              fatherName: student.fatherName ? student.fatherName : student.motherName ? student.motherName : student.guardianName ? student.guardianName : "",
              action: (<StudentButtons Id={student._id} onStudentDelete={onStudentDelete} />),
            }));
            setStudents(data);
            setFilteredStudents(data)
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
      } else {
        navigate("/dashboard");
      }
    };

    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    const records = students.filter((student) => (
      student.rollNumber?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || student.course?.toString().toLowerCase().includes(e.target.value.toLowerCase())
      || student.active?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredStudents(records)
  }

  const handleShowFilter = async () => {
    setShowFilter("show");
  };
  const handleHideFilter = async () => {
    setShowFilter(null);
  };

  const handleFilter = (e) => {
    const records = students.filter((sup) => (
      sup.course?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.name?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredStudents(records)
  }

  if (!filteredStudent) {
    return getSpinner();
  }

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="lg:mt-3 p-5">
      <div className="text-center">
        <h3 className="text-xl lg:text-2xl font-bold px-5 py-0 text-gray-600">Manage Students</h3>
        <h3 className="text-md lg:text-xl mt-3 font-bold text-gray-500 px-5 py-0">{localStorage.getItem('schoolName')}</h3>
      </div>
      <div className="flex justify-between items-center mt-5 relative">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex border shadow-lg rounded-md justify-between items-center relative bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-2 rounded-l-md`}>
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-0.5 border rounded shadow-md justify-center"
              onChange={handleSearch}
            />
          </div>
          <div className="p-1 mt-0.5 rounded-md items-center justify-center ">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {/*  <img src="/filter.jpg" className="rounded border border-green-500 w-8 p-1 mr-3 shadow-lg bg-white"/>*/}

        {/* <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div> */}

        {LinkIcon("/dashboard/add-student", "Add")}
        {/* {user.role === "superadmin" || user.role === "hquser" ?
          <div className="hidden lg:block" onClick={handleImport}>{LinkIcon("#", "Import")}</div> : null} */}
      </div>



      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredStudent} showGridlines highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
      </div>
    </div>
  )
}

export default List