import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClick } from '../../utils/CommonHelper'
import { getSchools } from '../../utils/SchoolHelper'
import { columnsSelect, getStudentsBySchool } from '../../utils/StudentHelper'
import { getTemplates } from '../../utils/TemplateHelper'
import DataTable from 'react-data-table-component'
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Create = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [formData, setFormData] = useState(1);
  const [schools, setSchools] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedRows, setSelectedRows] = React.useState(false);
  const [toggledClearRows, setToggleClearRows] = React.useState(false);

  const navigate = useNavigate()

  const handleRowChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  // Toggle the state so React Data Table changes to clearSelectedRows are triggered
  const handleClearRows = () => {
    setToggleClearRows(!toggledClearRows);
  }

  const handleReload = async (studentIdVal) => {
    if (studentIdVal) {
      const students = await getStudentsBySchool(studentIdVal);
      setStudents(students);
    } else {
      setStudents([]);
    }
    setSelectedRows([]);
  };

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchools(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const getTemplatesMap = async (id) => {
      const templates = await getTemplates(id);
      setTemplates(templates);
    };
    getTemplatesMap();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "schoolId") {
      handleReload(value);
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRows && selectedRows.length > 0) {
    //  selectedRows.map(selRow =>
      //  alert(selRow.rollNumber));

      const formDataObj = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataObj.append(key, formData[key])
      })

      Object.keys(selectedRows).forEach((key) => {
        formDataObj.append("studentId", selectedRows[key].rollNumber)
      })

      try {
        const headers = {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Access-Control-Allow-Origin': '*',
          'Accept': 'application/json'
        }

        const url = (await getBaseUrl()).toString() + "template/create";
        const response = await axios.post(url, formDataObj,
          {
            headers: headers
          }
        );
        if (response.data.success) {
          alert("Added Successfully...");
          navigate("/admin-dashboard/certificates");
        }

      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    } else {
      alert("Please Select Students!");
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Create Certificate</h2>
          <Link to="/admin-dashboard/certificates" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
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
                      {template.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Schools */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Niswan <span className="text-red-700">*</span>
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
                      {school.nameEnglish}
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
              <div className='mt-2 mb-5 gap-2 border rounded-md shadow-lg'>
                <DataTable columns={columnsSelect} data={students} reloadData={handleReload} selectableRows onSelectedRowsChange={handleRowChange} clearSelectedRows={toggledClearRows} />
              </div>

            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
          >
            Create Certificate
          </button>
        </form>
      </div>
    </>
  );
};

export default Create;