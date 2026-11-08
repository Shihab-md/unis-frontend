import { openPreservedFilterPopup } from '../common/PreservedFilterPopup';
import { readPopupFilters, savePopupFilters, loadPopupOptions, popupFilterValue } from '../../utils/popupFilterStorage';
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, EmployeeButtons, EmployeeCard, conditionalRowStyles } from '../../utils/EmployeeHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import Swal from 'sweetalert2';
import {
  getBaseUrl, handleRightClickAndFullScreen, getSpinner, getPrcessing, checkAuth,
  LinkIcon, showSwalAlert, toCamelCase, getFilterGif
} from '../../utils/CommonHelper';
import { useAuth } from '../../context/AuthContext'
import { PERMISSIONS } from '../../auth/permissions'
import { isGlobalHqReadRole } from '../../auth/roles'
import { AutoText, useLanguage } from '../../i18n/LanguageContext';
import 'animate.css';
import * as XLSX from 'xlsx';

const POPUP_KEYS = {'schoolId': 'empSchoolId', 'role': 'empRole', 'status': 'empStatus', 'q': 'popupFilter:employee:search'};

const List = () => {
  const { tr, t, direction, fontFamily } = useLanguage();

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const [schools, setSchools] = useState([])
  const [employees, setEmployees] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredEmployee, setFilteredEmployees] = useState(null)
  const [filtering, setFiltering] = useState(false)

  const [processing, setProcessing] = useState(null)

  const [searchText, setSearchText] = useState(() => readPopupFilters(POPUP_KEYS).q);
  const [listDataLoaded, setListDataLoaded] = useState(false);

  const navigate = useNavigate()
  const { user, can } = useAuth();

  const requestRef=useRef(0);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const getEmployeeUserId = (employee) => {
    return String(
      employee?.userId?._id ||
      employee?.userId ||
      ""
    );
  };

  const isLoggedInEmployeeRow = (employee) => {
    return getEmployeeUserId(employee) === String(user?._id || "");
  };

  const handleEmployeeDeleteRefresh = () => {
    const data = null; // keep same production behavior

    if (data) {
      getFilteredEmployees();
    } else {
      getEmployees();
    }
  };

  const buildEmployeeRow = (sup, sno, onEmployeeDelete) => {
    const isSelfRow = isLoggedInEmployeeRow(sup);

    return {
      _id: sup._id,
      sno,
      empId: sup.employeeId,
      name: sup.userId?.name,
      role: sup.userId?.role,
      contactNumber: sup.contactNumber,
      email: sup.userId?.email,
      organizationType: sup.organizationType || "NISWAN",
      schoolCode: String(sup.organizationType || "").toUpperCase() === "HQ"
        ? (localStorage.getItem("organizationCode") || "HQ")
        : sup.schoolId?.code,
      schoolName: String(sup.organizationType || "").toUpperCase() === "HQ"
        ? (localStorage.getItem("organizationName") || "UNIS Headquarters")
        : sup.schoolId?.nameEnglish,
      designation: sup.designation,
      active: sup.active,
      address: sup.schoolId?.address,
      distrcitState:
        sup.schoolId?.districtStateId?.district && sup.schoolId?.districtStateId?.state
          ? sup.schoolId?.districtStateId?.district + ", " + sup.schoolId?.districtStateId?.state
          : "",
      doj: sup.doj,
      dob: sup.dob,
      isSelfRow,
      action: (
        <EmployeeButtons
          Id={sup._id}
          targetRole={sup.userId?.role}
          isSelfRow={isSelfRow}
          onEmployeeDelete={onEmployeeDelete}
        />
      ),
    };
  };

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
        {key:'role',label:'Role',options:[['superadmin','SuperAdmin'],['hqadmin','HQ Admin'],['accountant','Accountant'],['hquser','HQ User'],['hqstaff','HQ Staff'],['admin','Admin'],['employee','Employee'],['teacher','Teacher'],['usthadh','Usthadh'],['warden','Warden'],['staff','Staff']].map(([role,label])=>({value:role,label:t(`roles.${role}`,label)}))},
        {key:'status',label:'Status',options:choices(['Active','In-Active'])},
        ],values,defaults:Object.fromEntries(Object.keys(POPUP_KEYS).map(key=>[key,''])),tr,direction,fontFamily,
      });
      if(!next)return;
      savePopupFilters(POPUP_KEYS,next,'employees');
      setSearchText(next.q);
      if(Object.keys(POPUP_KEYS).some(key=>key!=='q' && next[key]))await getFilteredEmployees();
      else await getEmployees();
    } catch(error) {
      showSwalAlert('Error!',error?.response?.data?.error || tr('Error!'),'error');
    }
  };

    const getFilteredEmployees = async () => {
    const request=++requestRef.current;
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

      if (request!==requestRef.current)return;
      if (responnse.data.success) {
        let sno = 1;

        const data = responnse.data.employees.map((sup) =>
          buildEmployeeRow(sup, sno++, handleEmployeeDeleteRefresh)
        );

        setEmployees(data);
      setListDataLoaded(true);
        setFilteredEmployees(data)
        localStorage.removeItem('employees');
        localStorage.setItem('employees', JSON.stringify(responnse.data));
      }

    } catch (error) {
      console.log(error.message)
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    } finally {
      if(request===requestRef.current){setFiltering(false);setSupLoading(false);}
    }
  }

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: `<h3 style='color:blue; font-size: 25px;'>${tr("Import Employee Data")}</h3>`,
      input: "file",
      background: "url(/bg_card.png)",
      inputAttributes: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        "accept": ".xlsx, .xls",
        "aria-label": tr("Upload Employee Data.")
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
              title: tr("Success!"),
              html: `<b>${tr("Successfully Imported!")} </br> ${tr("Please check the result in downloaded text file :")} </br>${fileName}</b>`,
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
              title: tr("Error!"),
              html: `<b>${tr("Data NOT Imported. Error :")} ${resData.error}</b>`,
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
          title: tr("Error!"),
          html: `<b>${tr("Data NOT Imported. Exception :")} ${error}</b>`,
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

    // Employee filter cache belongs only to global HQ readers. Clear any stale
    // HQ filter state before loading a scoped Supervisor/Niswan Employee list.
    if (!isGlobalHqReadRole(user?.role)) {
      localStorage.removeItem('employees');
      localStorage.removeItem('empSchoolId');
      localStorage.removeItem('empRole');
      localStorage.removeItem('empStatus');
    }

    // Authenticate the User.
    if (checkAuth("employeesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchEmployees = async () => {
      setSupLoading(true)

      const data = localStorage.getItem('employees');
      if (['empSchoolId','empRole','empStatus'].some(popupFilterValue)) {
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
    const request=++requestRef.current;

    const data = localStorage.getItem('employees');

    if (data && ['empSchoolId','empRole','empStatus'].some(popupFilterValue)) {

      let sno = 1;

      const data1 = JSON.parse(data).employees.map((sup) =>
        buildEmployeeRow(sup, sno++, handleEmployeeDeleteRefresh)
      );

      setEmployees(data1);
      setListDataLoaded(true);
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

        if (request!==requestRef.current)return;
      if (responnse.data.success) {
          let sno = 1;

          const data = responnse.data.employees.map((sup) =>
            buildEmployeeRow(sup, sno++, handleEmployeeDeleteRefresh)
          );

          setEmployees(data);
      setListDataLoaded(true);
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
    setFilteredEmployees(employees.filter((sup) => !searchText || (
      sup.name?.toLowerCase().includes(searchText.toLowerCase())
      || sup.empId?.toLowerCase().includes(searchText.toLowerCase())
      || sup.role?.toLowerCase().includes(searchText.toLowerCase())
      || sup.schoolCode?.toLowerCase().includes(searchText.toLowerCase())
      || sup.designation?.toLowerCase().includes(searchText.toLowerCase())
      || sup.active?.toLowerCase().includes(searchText.toLowerCase())
      || sup.contactNumber?.toString().toLowerCase().includes(searchText.toLowerCase())
    )));
  },[employees,searchText,listDataLoaded]);

  if (!filteredEmployee) {
    return getSpinner();
  }

  if (processing) {
    return getPrcessing();
  }

  return (
    <div dir={direction} style={{ fontFamily }} className="p-3 lg:p-5 bg-repeat mt-1 lg:mt-5">
      <div className="text-center">
        <AutoText as="h3" text={tr("Manage Employees")} variant="heading" className="font-bold px-5 py-0 text-gray-600" />
        <p className='text-xs sm:text-sm justify-center text-rose-700'>
          ({tr("Records Count")} : {filteredEmployee ? filteredEmployee.length : 0})
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
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {isGlobalHqReadRole(user.role) ?
          <div className="mr-3" onClick={openFilterPopup}>{LinkIcon("#", "Filter")}</div>
          : null}

        {can(PERMISSIONS.EMPLOYEE_CREATE) ?
          LinkIcon("/dashboard/add-employee", "Add") : null}
        {can(PERMISSIONS.EMPLOYEE_IMPORT) ?
          <div className="hidden lg:block" onClick={handleImport}>{LinkIcon("#", "Import")}</div> : null}
      </div>

      {(localStorage.getItem('empSchoolId') != null && localStorage.getItem('empSchoolId') != 'null')
        || (localStorage.getItem('empRole') != null && localStorage.getItem('empRole') != 'null')
        || (localStorage.getItem('empStatus') != null && localStorage.getItem('empStatus') != 'null') ?

        <div className='grid lg:flex mt-3 lg:mt-5 text-xs text-lime-600 items-center justify-center'>
          <p className='lg:mr-3 justify-center text-center'>{tr("Filter Applied:")} </p>

          <p>{localStorage.getItem('empSchoolId') != null && localStorage.getItem('empSchoolId') != 'null' ?
            <span className='text-blue-500'>{tr("Niswan")}: <span className='text-gray-500'>
              {schools.filter(school => school._id === localStorage.getItem('empSchoolId')).map(school => school.code + " : " + school.nameEnglish) + ", "}
            </span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('empRole') != null && localStorage.getItem('empRole') != 'null' ?
            <span className='text-blue-500'>{tr("Role")}: <span className='text-gray-500'>
              {t(`roles.${String(localStorage.getItem('empRole') || '').toLowerCase()}`, toCamelCase(localStorage.getItem('empRole')))}</span></span> : null}</p>

          <p className='lg:ml-3'>{localStorage.getItem('empStatus') != null && localStorage.getItem('empStatus') != 'null' ?
            <span className='text-blue-500'>{tr("Status")}: <span className='text-gray-500'>
              {tr(localStorage.getItem('empStatus'))}</span></span> : null}</p>

        </div>
        : <div className='flex mt-3 lg:mt-7'></div>}

      {filtering ?
        getFilterGif() : (
          <>
            {/* Mobile / Tablet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {filteredEmployee.map((row) => (
                <EmployeeCard key={row._id} row={row} />
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden lg:block mt-3">
              <DataTable columns={columns} data={filteredEmployee} highlightOnHover striped responsive conditionalRowStyles={conditionalRowStyles} />
            </div>
          </>)}
    </div>
  )
}

export default List