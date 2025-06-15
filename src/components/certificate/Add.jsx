import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing } from '../../utils/CommonHelper'
import { getSchoolsFromCache } from '../../utils/SchoolHelper'
import { columnsSelect, getStudentsBySchoolAndCourse } from '../../utils/StudentHelper'
import { getTemplatesFromCache } from '../../utils/TemplateHelper'
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Create = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [formData, setFormData] = useState(1);
  const [schools, setSchools] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [tempId, setTempId] = useState([]);

  const [studentsLoading, setStudentsLoading] = useState(false)

  const [createdAll, setCreatedAll] = useState(null)

  const [selectedRows, setSelectedRows] = React.useState(false);
  const [toggledClearRows, setToggleClearRows] = React.useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("certificateAdd") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }
  });

  const handleRowChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  // Toggle the state so React Data Table changes to clearSelectedRows are triggered
  const handleClearRows = () => {
    setToggleClearRows(!toggledClearRows);
  }

  const handleReload = async (schoolIdIdVal) => {
    setStudentsLoading(true)
    try {
      if (schoolIdIdVal) {
        const students = await getStudentsBySchoolAndCourse(schoolIdIdVal, tempId);
        setStudents(students);
      } else {
        setStudents([]);
      }
      setSelectedRows([]);
    } finally {
      setStudentsLoading(false)
    }

  };

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const getTemplatesMap = async (id) => {
      const templates = await getTemplatesFromCache(id);
      setTemplates(templates);
    };
    getTemplatesMap();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "templateId") {
      setTempId(value);
    }

    if (name === "schoolId") {
      handleReload(value);
    }
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRows && selectedRows.length > 0) {

      const formDataObj = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataObj.append(key, formData[key])
      })

      try {
        const headers = {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Access-Control-Allow-Origin': '*',
          'Accept': 'application/json'
        }

        const formDataNew = new FormData();
        formDataNew.set("templateId", formDataObj.get("templateId"));
        formDataNew.set("schoolId", formDataObj.get("schoolId"));
        let downloaded = false;
        setCreatedAll(true);
        for (const selectedRow of selectedRows) {
          //  alert(selectedRow._id);
          formDataNew.delete("studentId");
          formDataNew.set("studentId", selectedRow._id);

          const url = (await getBaseUrl()).toString() + "certificate/add";
          const response = await axios.post(url, formDataNew,
            {
              headers: headers
            }
          );
          if (response.data.success) {
            let resData = response.data;
            if (resData.image && resData.image != "") {
              let image = resData.image;
              const link = document.createElement('a');
              if (resData.type === 'base64') {
                link.href = "data:image/jpeg;base64," + image;
              } else {
                link.href = image;
              }
              link.download = resData.fileName || 'downloaded_image.png'; // Use provided name or default
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              downloaded = true;
            }
          }
        }
        if (downloaded) {
          setCreatedAll(false);
          Swal.fire({
            title: "Success!",
            html: "<b>Successfully created!</b>",
            icon: "success",
            timer: 1600,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          navigate("/dashboard/certificates");
        } else {
          setCreatedAll(false);
          Swal.fire('Error!', 'Certificates NOT created.....', 'error');
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          setCreatedAll(false);
        }
      }
    } else {
      Swal.fire('Error!', 'Please Select Students!', 'warning');
      //alert("Please Select Students!");
    }
  };

  if (createdAll) {
    return getPrcessing();
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Create Certificates</h2>
          <Link to="/dashboard/certificates" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autocomplete="off">
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Templates */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Template <span className="text-red-700">*</span>
                </label>
                <select
                  name="templateId"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.courseId.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Schools  */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Niswan<span className="text-red-700">*</span>
                </label>
                <select
                  name="schoolId"
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Niswan</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.code + " : " + school.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>

              {/* Students List */}
              <div className="">
                <label className="block mt-3 text-sm font-medium text-gray-700">
                  Select Students <span className="text-red-700">*</span>
                </label>
              </div>
              <div className="flex space-x-1" />
              <div className='mb-5 border rounded-md shadow-lg'>
                {!studentsLoading ?
                  <DataTable columns={columnsSelect} data={students} reloadData={handleReload} selectableRows onSelectedRowsChange={handleRowChange} clearSelectedRows={toggledClearRows} highlightOnHover striped />
                  : <div className='flex items-center justify-center rounded-lg shadow-xl border'>
                    <img width={250} className='flex items-center justify-center' src="/spinner1.gif" />
                  </div>}
              </div>

            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
          >
            Create Certificates
          </button>
        </form>
      </div>
    </>
  );
};

export default Create;