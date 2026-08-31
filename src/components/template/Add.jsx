import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const TEMPLATE_MODULE_OPTIONS = [
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "MARKSHEET", label: "Marksheet" },
];

const MARKSHEET_TYPE_OPTIONS = [
  { value: "NORMAL", label: "Normal Marksheet (Quarterly / Half Yearly / Annual)" },
  { value: "CONSOLIDATED", label: "Consolidated Marksheet" },
];

const Add = () => {

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [formData, setFormData] = useState({
    templateModule: "CERTIFICATE",
    marksheetType: "NORMAL",
    certificateFees: "75",
  });
  const [courses, setCourses] = useState([]);
  const [processing, setProcessing] = useState(null)

  const navigate = useNavigate()
  const safeCourses = Array.isArray(courses) ? courses : [];
  const isMarksheetTemplate = formData.templateModule === "MARKSHEET";

  const filteredCourses = useMemo(() => {
    if (isMarksheetTemplate) return safeCourses;
    return safeCourses.filter(course => course.type === "Deeniyath Education"
      || course.type === "Islamic Home Science"
      || course.type === "Teacher Training");
  }, [safeCourses, isMarksheetTemplate]);

  useEffect(() => {
    if (checkAuth("templateAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const getCoursesMap = async (id) => {
      const coursesData = await getCoursesFromCache(id);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    };
    getCoursesMap();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
      return;
    }

    if (name === "templateModule") {
      setFormData((prevData) => ({
        ...prevData,
        templateModule: value,
        marksheetType: value === "MARKSHEET" ? (prevData.marksheetType || "NORMAL") : "",
        certificateFees: value === "MARKSHEET" ? "0" : (prevData.certificateFees || "75"),
      }));
      return;
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const moduleValue = formData.templateModule || "CERTIFICATE";
    const feesValue = Number(formData.certificateFees || 0);
    if (moduleValue === "CERTIFICATE" && (!Number.isFinite(feesValue) || feesValue < 0)) {
      setProcessing(false);
      showSwalAlert("Info!", "Certificate fees must be 0 or greater.", "info");
      return;
    }

    if (moduleValue === "MARKSHEET" && formData.file && formData.file.type !== "application/pdf") {
      setProcessing(false);
      showSwalAlert("Info!", "Marksheet template must be a PDF file.", "info");
      return;
    }

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== undefined && value !== null) {
        formDataObj.append(key, value)
      }
    })

    if (!formDataObj.has("certificateFees")) {
      formDataObj.append("certificateFees", moduleValue === "CERTIFICATE" ? "75" : "0");
    }

    try {
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const url = (await getBaseUrl()).toString() + "template/add";
      const response = await axios.post(url, formDataObj,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/templates");
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="max-w-4xl mx-auto mt-2 p-5 shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-sm lg:text-xl font-semibold items-center justify-center">Enter Template Details</h2>
        <Link to="/dashboard/templates" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" title="Close" aria-label="Close" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
          <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Use <b>Certificate</b> for existing certificate printing. Use <b>Marksheet</b> to upload PDF templates for normal or consolidated marksheet printing.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Template Module <span className="text-red-700">*</span>
              </label>
              <select
                name="templateModule"
                value={formData.templateModule || "CERTIFICATE"}
                onChange={handleChange}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                {TEMPLATE_MODULE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {isMarksheetTemplate ? (
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Marksheet Type <span className="text-red-700">*</span>
                </label>
                <select
                  name="marksheetType"
                  value={formData.marksheetType || "NORMAL"}
                  onChange={handleChange}
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  {MARKSHEET_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Select Course <span className="text-red-700">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId || ""}
                onChange={handleChange}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                {filteredCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code ? `${course.code} - ` : ""}{course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Details <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="details"
                value={formData.details || ""}
                onChange={handleChange}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {!isMarksheetTemplate ? (
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Certificate Fees
                </label>
                <input
                  type="number"
                  name="certificateFees"
                  value={formData.certificateFees || ""}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            ) : null}

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-500">
                Upload Template {isMarksheetTemplate ? "PDF" : "Image/PDF"}<span className="text-red-700">*</span>
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                placeholder="Upload Template"
                required
                accept={isMarksheetTemplate ? "application/pdf" : "image/*,application/pdf"}
                className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
        >
          Add Template
        </button>
      </form>
    </div>
  );
};

export default Add;
