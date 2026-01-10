import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, EmployeeButtons, conditionalRowStyles } from '../../utils/EmployeeHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';
import {
  getBaseUrl, handleRightClickAndFullScreen, getSpinner, getPrcessing, checkAuth,
  LinkIcon, showSwalAlert, toCamelCase, getFilterGif
} from '../../utils/CommonHelper';
import { useAuth } from '../../context/AuthContext'
import 'animate.css';
import * as XLSX from 'xlsx';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [schools, setSchools] = useState([])
  const [employees, setEmployees] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredEmployee, setFilteredEmployees] = useState(null)
  const [filtering, setFiltering] = useState(false)

  const [processing, setProcessing] = useState(null)

  const navigate = useNavigate()

  const { user } = useAuth();

  const MySwal = withReactContent(Swal);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  const openFilterPopup = async () => {
    let selectedSchool;
    let selectedRole;
    let selectedStatus;
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
                selectedSchool = selectedOption.value;
              }}
              maxMenuHeight={210}
              placeholder=''
            />
          </div>

          <div className='grid'>
            <span className='text-sm mb-1 text-start text-blue-500'>Role</span>
            <Select className='text-sm text-start mb-3'
              options={
                [{ value: 'superadmin', label: 'SuperAdmin' },
                { value: 'hquser', label: 'HQUser' },
                { value: 'admin', label: 'Admin' },
                { value: 'teacher', label: 'Teacher' },
                { value: 'usthadh', label: 'Usthadh' },
                { value: 'warden', label: 'Warden' },
                { value: 'staff', label: 'Staff' }]
              }

              onChange={(selectedOption) => {
                selectedRole = selectedOption.value;
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
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const select1 = selectedSchool ? selectedSchool : null;
        const select2 = selectedRole ? selectedRole : null;
        const select3 = selectedStatus ? selectedStatus : null;

        return [select1, select2, select3];
      }
    });

    if (formValues) {
      if (formValues[0] || formValues[1] || formValues[2]) {

        console.log('Selected values:', formValues);
        const empSchoolId = formValues[0] ? formValues[0] : null;
        const empRole = formValues[1] ? formValues[1] : null;
        const empStatus = formValues[2] ? formValues[2] : null;

        console.log('Selected empSchoolId:', formValues[0]);
        console.log('Selected empRole:', formValues[1]);
        console.log('Selected empStatus:', formValues[2]);

        localStorage.setItem('empSchoolId', empSchoolId);
        localStorage.setItem('empRole', empRole);
        localStorage.setItem('empStatus', empStatus);

        getFilteredEmployees();

      } else {

        localStorage.removeItem('employees');
        localStorage.removeItem('empSchoolId');
        localStorage.removeItem('empRole');
        localStorage.removeItem('empStatus');

        getEmployees();
      }
    }
  };

  const getFilteredEmployees = async () => {
    setFiltering(true)
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "employee/byEmpFilter/"
        + localStorage.getItem('empSchoolId') + "/"
        + localStorage.getItem('empRole') + "/"
        + localStorage.getItem('empStatus'),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (responnse.data.success) {
        let sno = 1;
        const data = await responnse.data.employees.map((sup) => ({
          _id: sup._id,
          sno: sno++,
          empId: sup.employeeId,
          name: sup.userId?.name,
          role: sup.userId?.role,
          contactNumber: sup.contactNumber,
          email: sup.userId?.email,
          schoolCode: sup.schoolId?.code,
          schoolName: sup.schoolId?.nameEnglish,
          designation: sup.designation,
          active: sup.active,
          action: (<EmployeeButtons Id={sup._id} />),
        }));
        setEmployees(data);
        setFilteredEmployees(data)
        localStorage.removeItem('employees');
        localStorage.setItem('employees', JSON.stringify(responnse.data));
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

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: "<h3 style='color:blue; font-size: 25px;'>Import Employee Data</h3>",
      input: "file",
      background: "url(/bg_card.png)",
      inputAttributes: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        "accept": ".xlsx, .xls",
        "aria-label": "Upload Employee Data."
      },
      showClass: { popup: `animate__animated animate__fadeInUp animate__faster` },
      hideClass: { popup: `animate__animated animate__fadeOutDown animate__faster` }
    });

    if (file) {
      //alert('Good')
      try {
        setProcessing(true);

        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(ws, {
          defval: "",     // keep blanks
          raw: true       // keep numbers (needed for Excel serial dates)
        });

        const studentsDataList = JSON.stringify(rawRows);
        //alert(studentsDataList)
        if (studentsDataList) {
          const response = await fetch((await getBaseUrl()).toString() + "employee/importEmp", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}`, 'Content-Type': 'application/json' },
            body: studentsDataList,
          });

          if (response.ok) {
            setProcessing(false);

            const text = await response.text();
            // If the server returns escaped newlines like "\\n"
            const fixed = text.replace(/\\n/g, "\r\n");
            const blob = new Blob([fixed], { type: "text/plain;charset=utf-8" });

            //const blob = await response.blob();
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

            navigate("/dashboard/employees");
            window.location.reload();
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
    if (checkAuth("employeesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchEmployees = async () => {
      setSupLoading(true)

      const data = localStorage.getItem('employees');
      if (data && (localStorage.getItem('empSchoolId')
        || localStorage.getItem('empRole')
        || localStorage.getItem('empStatus'))) {
        console.log("111")
        getFilteredEmployees();
      } else {
        console.log("222")
        getEmployees();
      }
    }
    fetchEmployees();
  }, []);

  const getEmployees = async () => {

    const onEmployeeDelete = () => {
      const data = null;//localStorage.getItem('employees');
      if (data) {
        console.log("333")
        getFilteredEmployees();
      } else {
        console.log("444")
        getEmployees();
      }
    }

    const me = String(user?._id || "");
    const data = localStorage.getItem('employees');
    console.log("Existing Data - " + JSON.parse(data))
    //alert(user._id)
    if (data && (localStorage.getItem('empSchoolId')
      || localStorage.getItem('empRole')
      || localStorage.getItem('empStatus'))) {
      let sno = 1;
      const data1 = JSON.parse(data).employees
        .filter((sup) => {
          const supUserId = String(sup?.userId?._id || sup?.userId || "");
          console.log(supUserId)
          return supUserId !== me;
        })
        .map((sup) => ({
          _id: sup._id,
          sno: sno++,
          empId: sup.employeeId,
          name: sup.userId?.name,
          role: sup.userId?.role,
          contactNumber: sup.contactNumber,
          email: sup.userId?.email,
          schoolCode: sup.schoolId?.code,
          schoolName: sup.schoolId?.nameEnglish,
          designation: sup.designation,
          active: sup.active,
          action: (<EmployeeButtons Id={sup._id} onEmployeeDelete={onEmployeeDelete} />),
        }));
      setEmployees(data1);
      setFilteredEmployees(data1);
      console.log("Data from local storage")

    } else {

      try {
        setFilteredEmployees(null);
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "employee",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.employees
            .filter((sup) => {
              const supUserId = String(sup?.userId?._id || sup?.userId || "");
              return supUserId !== me;
            }).map((sup) => ({
              _id: sup._id,
              sno: sno++,
              empId: sup.employeeId,
              name: sup.userId?.name,
              role: sup.userId?.role,
              contactNumber: sup.contactNumber,
              email: sup.userId?.email,
              schoolCode: sup.schoolId?.code,
              schoolName: sup.schoolId?.nameEnglish,
              designation: sup.designation,
              active: sup.active,
              //dob: new Date(sup.dob).toLocaleDateString(),
              //  profileImage: <img width={40} className='rounded-full' src={`https://unis-server.vercel.app/${sup.userId.profileImage}`} />,
              action: (<EmployeeButtons Id={sup._id} onEmployeeDelete={onEmployeeDelete} />),
            }));
          setEmployees(data);
          setFilteredEmployees(data);
          localStorage.removeItem('employees');
          localStorage.setItem('employees', JSON.stringify(responnse.data));
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
    const records = employees.filter((sup) => (
      sup.name?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.empId?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.role?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.schoolCode?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.designation?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.active?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.contactNumber?.toString().toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredEmployees(records)
  }

  if (!filteredEmployee) {
    return getSpinner();
  }

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-gray-600">Manage Employees
          <p className='flex md:grid text-sm md:text-base justify-center text-rose-700'>
            (Records Count : {filteredEmployee ? filteredEmployee.length : 0}) </p>
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
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {user.role === "superadmin" || user.role === "hquser" ?
          <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>
          : null}

        {user.role === "superadmin" || user.role === "admin" ?
          LinkIcon("/dashboard/add-employee", "Add") : null}
        {user.role === "superadmin" || user.role === "hquser" ?
          <div className="hidden lg:block" onClick={handleImport}>{LinkIcon("#", "Import")}</div> : null}
      </div>

      {(localStorage.getItem('empSchoolId') != null && localStorage.getItem('empSchoolId') != 'null')
        || (localStorage.getItem('empRole') != null && localStorage.getItem('empRole') != 'null')
        || (localStorage.getItem('empStatus') != null && localStorage.getItem('empStatus') != 'null') ?

        <div className='grid lg:flex mt-3 lg:mt-7 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>Filter Applied: </p>

          <p>{localStorage.getItem('empSchoolId') != null && localStorage.getItem('empSchoolId') != 'null' ?
            <span className='text-blue-500'>Niswan: <span className='text-gray-500'>
              {schools.filter(school => school._id === localStorage.getItem('empSchoolId')).map(school => school.code + " : " + school.nameEnglish) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('empRole') != null && localStorage.getItem('empRole') != 'null' ?
            <span className='text-blue-500'>Role: <span className='text-gray-500'>
              {toCamelCase(localStorage.getItem('empRole'))}</span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('empStatus') != null && localStorage.getItem('empStatus') != 'null' ?
            <span className='text-blue-500'>Status: <span className='text-gray-500'>
              {localStorage.getItem('empStatus')}</span></span> : null}</p>

        </div>
        : <div className='flex mt-3 lg:mt-7'></div>}

      {filtering ?
        getFilterGif() :
        <div className='mt-3 lg:mt-7 rounded-lg shadow-lg'>
          <DataTable columns={columns} data={filteredEmployee} highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
        </div>}
    </div>
  )
}

export default List