import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getCoursesFromCache } from '../../utils/CourseHelper';
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
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

const Edit = () => {

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [courses, setCourses] = useState([]);
  const [processing, setProcessing] = useState(null)
  const [template, setTemplate] = useState({
    courseId: "",
    details: "",
    templateModule: "CERTIFICATE",
    marksheetType: "",
    certificateFees: "75",
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const safeCourses = Array.isArray(courses) ? courses : [];
  const isMarksheetTemplate = template.templateModule === "MARKSHEET";

  const filteredCourses = useMemo(() => {
    if (isMarksheetTemplate) return safeCourses;
    return safeCourses.filter(course => course.type === "Deeniyath Education"
      || course.type === "Islamic Home Science"
      || course.type === "Teacher Training");
  }, [safeCourses, isMarksheetTemplate]);

  useEffect(() => {
    const getCoursesMap = async (id) => {
      const coursesData = await getCoursesFromCache(id);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    };
    getCoursesMap();
  }, []);

  useEffect(() => {
    if (checkAuth("templateEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchTemplate = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `template/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const template = responnse.data.template;
          setTemplate((prev) => ({
            ...prev,
            courseId: template.courseId && template.courseId._id ? template.courseId._id : "",
            details: template.details || "",
            templateModule: template.templateModule || "CERTIFICATE",
            marksheetType: template.marksheetType || "",
            certificateFees: String(template.certificateFees ?? 75),
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/templates/");
        }
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setTemplate((prevData) => ({ ...prevData, [name]: files[0] }));
      return;
    }

    if (name === "templateModule") {
      setTemplate((prevData) => ({
        ...prevData,
        templateModule: value,
        marksheetType: value === "MARKSHEET" ? (prevData.marksheetType || "NORMAL") : "",
        certificateFees: value === "MARKSHEET" ? "0" : (prevData.certificateFees || "75"),
      }));
      return;
    }

    setTemplate((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const moduleValue = template.templateModule || "CERTIFICATE";
    const feesValue = Number(template.certificateFees || 0);
    if (moduleValue === "CERTIFICATE" && (!Number.isFinite(feesValue) || feesValue < 0)) {
      setProcessing(false);
      showSwalAlert("Info!", "Certificate fees must be 0 or greater.", "info");
      return;
    }

    if (moduleValue === "MARKSHEET" && template.file && template.file.type !== "application/pdf") {
      setProcessing(false);
      showSwalAlert("Info!", "Marksheet template must be a PDF file.", "info");
      return;
    }

    try {
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const formDataObj = new FormData();
      formDataObj.append("courseId", template.courseId || "");
      formDataObj.append("details", template.details || "");
      formDataObj.append("templateModule", moduleValue);
      formDataObj.append("marksheetType", moduleValue === "MARKSHEET" ? (template.marksheetType || "NORMAL") : "");
      formDataObj.append("certificateFees", moduleValue === "CERTIFICATE" ? (template.certificateFees || "75") : "0");

      if (template.file) {
        formDataObj.append("file", template.file);
      }

      const response = await axios.put(
        (await getBaseUrl()).toString() + `template/${id}`,
        formDataObj,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
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
    <>
      {template ? (
        <div className="max-w-4xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-sm lg:text-xl font-semibold items-center justify-center">Update Template Details</h2>
            <Link to="/dashboard/templates" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" title="Close" aria-label="Close" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Template Module <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="templateModule"
                    value={template.templateModule || "CERTIFICATE"}
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
                      value={template.marksheetType || "NORMAL"}
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
                    value={template.courseId || ""}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-2 p-2 block w-full border border-gray-300 rounded-md bg-slate-100"
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
                    value={template.details || ""}
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
                      value={template.certificateFees || ""}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                    />
                  </div>
                ) : null}

                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-500">
                    Update Template {isMarksheetTemplate ? "PDF" : "Image/PDF"}
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    placeholder="Upload Template"
                    accept={isMarksheetTemplate ? "application/pdf" : "image/*,application/pdf"}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 mb-5 text-[11px] text-slate-500">
                    Leave empty to keep existing template file.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
            >
              Update Template
            </button>
          </form>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default Edit;
