import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper'
import { getSchoolsFromCache } from '../../utils/SchoolHelper'
import { columnsSelect, getStudentsBySchoolAndCourse } from '../../utils/StudentHelper'
import { getCertificateTemplatesFromCache } from '../../utils/TemplateHelper'
import DataTable from 'react-data-table-component'
import Select from 'react-select';
import { FaRegTimesCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Create = () => {

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [formData, setFormData] = useState({});
  const [schools, setSchools] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [tempId, setTempId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [selectedCertificateFees, setSelectedCertificateFees] = useState("0");
  const [selectedIssueDate, setSelectedIssueDate] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [createdAll, setCreatedAll] = useState(null)

  const [selectedRows, setSelectedRows] = React.useState(false);
  const [toggledClearRows, setToggleClearRows] = React.useState(false);

  const navigate = useNavigate()
  const safeSchools = Array.isArray(schools) ? schools : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const safeStudents = Array.isArray(students) ? students : [];

  useEffect(() => {
    if (checkAuth("certificateAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  }, [navigate]);

  const handleRowChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleClearRows = () => {
    setToggleClearRows(!toggledClearRows);
  }

  const isSelectedCertificateFree = () => {
    const feeValue = Number(selectedCertificateFees);
    return Number.isFinite(feeValue) && feeValue <= 0;
  };

  const isExistingCertificateBlock = (row) =>
    String(row?.certificateBlockReason || "").toLowerCase().includes("certificate already created");

  const isCertificateRowDisabled = (row) => {
    if (isExistingCertificateBlock(row)) return true;
    if (isSelectedCertificateFree()) return false;
    return !row?.canSelectCertificate;
  };


  const getTemplateFees = (templateId) => {
    const selectedTemplate = safeTemplates.find(
      (template) => String(template._id) === String(templateId)
    );

    const feeValue = Number(selectedTemplate?.certificateFees);
    return String(Number.isFinite(feeValue) && feeValue >= 0 ? feeValue : 75);
  };

  const handleReload = async (schoolIdVal = schoolId, templateIdVal = tempId) => {
    setStudentsLoading(true)
    try {
      console.log("Hi : " + schoolIdVal + ", " + templateIdVal)
      if (schoolIdVal && schoolIdVal != null && schoolIdVal !== ''
        && templateIdVal && templateIdVal != null && templateIdVal !== '') {
        setStudents([]);
        const studentsData = await getStudentsBySchoolAndCourse(schoolIdVal, templateIdVal);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } else {
        setStudents([]);
      }
      setSelectedRows([]);
      handleClearRows();
    } finally {
      setStudentsLoading(false)
    }
  };

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schoolsData = await getSchoolsFromCache(id);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const getTemplatesMap = async () => {
      const templatesData = await getCertificateTemplatesFromCache();
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    };
    getTemplatesMap();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "templateId") {
      console.log('HIHIIH - ' + value)
      setTempId(value);
      setSelectedCertificateFees(getTemplateFees(value));
      handleReload(schoolId, value);
    }

    if (name === "schoolId") {
      setSchoolId(value);
      handleReload(value, tempId);
    }
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tempId) {
      showSwalAlert("Error!", "Please Select Template!", "warning");
      return;
    }

    if (!schoolId) {
      showSwalAlert("Error!", "Please Select Niswan!", "warning");
      return;
    }

    if (!selectedIssueDate) {
      showSwalAlert("Error!", "Please Select Certificate Issue Date!", "warning");
      return;
    }

    if (!(selectedRows && selectedRows.length > 0)) {
      showSwalAlert("Error!", "Please Select Students!", "warning");
      return;
    }

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Access-Control-Allow-Origin": "*",
        Accept: "application/json",
      };

      const formDataNew = new FormData();
      formDataNew.set("templateId", tempId);
      formDataNew.set("schoolId", schoolId);
      formDataNew.set("issueDate", selectedIssueDate.toISOString());

      let downloaded = false;
      setCreatedAll(true);

      for (const selectedRow of selectedRows) {
        formDataNew.delete("studentId");
        formDataNew.set("studentId", selectedRow._id);

        const url = (await getBaseUrl()).toString() + "certificate/add";
        const response = await axios.post(url, formDataNew, { headers });

        if (response?.data?.success) {
          const resData = response.data;
          const link = document.createElement("a");

          if (resData.type === "base64pdf" && resData.file) {
            link.href = "data:application/pdf;base64," + resData.file;
            link.download = resData.fileName || "certificate.pdf";
          } else if (resData.type === "url" && (resData.downloadUrl || resData.file)) {
            link.href = resData.downloadUrl || resData.file;
            link.download = resData.fileName || "certificate.pdf";
          } else {
            continue;
          }

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          downloaded = true;
        }
      }

      setCreatedAll(false);

      if (downloaded) {
        showSwalAlert("Success!", "Successfully Created!", "success");
        navigate("/dashboard/certificates");
      } else {
        showSwalAlert("Error!", "Certificates NOT created.....", "error");
      }
    } catch (error) {
      setCreatedAll(false);

      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      } else {
        showSwalAlert("Error!", "Certificate creation failed.", "error");
      }
    }
  };

  if (createdAll) {
    return getPrcessing();
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mt-2 p-5 shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-sm lg:text-xl font-semibold items-center justify-center">Create Certificates</h2>
          <Link to="/dashboard/certificates" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Templates */}
              <div className='md:col-span-1'>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Select Template <span className="text-red-700">*</span>
                </label>
                <select
                  name="templateId"
                  value={tempId}
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  {safeTemplates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.courseId?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate Fees */}
              <div className="grid grid-cols-1 md:col-span-1">
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Certificate Fees
                </label>
                <input
                  type="number"
                  value={selectedCertificateFees}
                  disabled={true}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100 text-slate-700"
                />
              </div>

              {/* Issue Date */}
              <div className="grid grid-cols-1 md:col-span-1">
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Certificate Issue Date <span className="text-red-700">*</span>
                </label>
                <DatePicker
                  name="issueDate"
                  selected={selectedIssueDate}
                  onChange={(date) => setSelectedIssueDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  isClearable
                />
              </div>

              {/* Schools  */}
              <div className='md:col-span-3'>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Select Niswan <span className="text-red-700">*</span>
                </label>

                <Select className='mt-2 text-sm text-start mb-3'
                  name="schoolId"
                  options={safeSchools.map(option => ({
                    value: option._id, label: option.code + " : " + option.nameEnglish
                  }))}

                  onChange={(selectedOption) => {
                    const selectedValue = selectedOption?.value || "";
                    setSchoolId(selectedValue);
                    handleReload(selectedValue, tempId);
                    setFormData((prevData) => ({ ...prevData, schoolId: selectedValue }));
                  }}
                  maxMenuHeight={210}
                  defaultOptions={[{ value: '', label: '' }]}
                />
              </div>

              {/* Students List */}
              <div className=''>
                <label className="block md:col-span-2 mt-2 text-sm font-medium text-slate-500">
                  Select Students <span className="text-red-700">*</span>
                </label>
              </div>
              <div className="flex space-x-1" />
              <div className='md:col-span-2 mb-5 border rounded-md shadow-lg'>
                {!studentsLoading ?
                  <DataTable
                    columns={columnsSelect}
                    data={safeStudents}
                    reloadData={handleReload}
                    selectableRows
                    selectableRowDisabled={isCertificateRowDisabled}
                    onSelectedRowsChange={handleRowChange}
                    clearSelectedRows={toggledClearRows}
                    highlightOnHover
                    striped
                  />
                  : <div className='flex items-center justify-center rounded-lg shadow-xl border'>
                    <img width={250} className='flex items-center justify-center' src="/spinner1.gif" />
                  </div>}
              </div>

            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
          >
            Create Certificate
          </button>
        </form>
      </div>
    </>
  );
};

export default Create;
