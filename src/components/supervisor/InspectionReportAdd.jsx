import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaPaperPlane, FaUpload, FaRegTimesCircle } from "react-icons/fa";
import { addInspectionReport } from "../../api/inspectionReportApi";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import {
  handleRightClickAndFullScreen,
  checkAuth,
  showSwalAlert,
  getPrcessing,
} from "../../utils/CommonHelper";

const getPlainTextFromHtml = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function InspectionReportAdd() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [reportDate] = useState(getTodayDate());
  const [contentHtml, setContentHtml] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    handleRightClickAndFullScreen();

    if (checkAuth("inspectionReportAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const loadSchools = async () => {
      try {
        setLoadingSchools(true);

        const res = await getSchoolsFromCache();
        const list = Array.isArray(res) ? res : res?.schools || [];

        const role = String(localStorage.getItem("role") || "").toLowerCase();
        const rawSchoolIds = localStorage.getItem("schoolIds");
        const supSchoolIds = rawSchoolIds ? JSON.parse(rawSchoolIds) : [];
        const mySchoolId = localStorage.getItem("schoolId");

        const filtered =
          role === "supervisor" && Array.isArray(supSchoolIds) && supSchoolIds.length > 0
            ? list.filter((s) => s && supSchoolIds.includes(String(s._id)))
            : list;

        setSchools(filtered);

        if (filtered.length === 1) {
          setSchoolId(String(filtered[0]._id));
          return;
        }

        const found = filtered.find((s) => String(s._id) === String(mySchoolId));
        if (found) {
          setSchoolId(String(found._id));
        }
      } catch (error) {
        showSwalAlert(
          "Error!",
          error?.message || "Failed to load Niswan list.",
          "error"
        );
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
  }, [navigate]);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "align",
  ];

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const allowed = selected.filter((file) =>
      ["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(file.type)
    );

    if (allowed.length !== selected.length) {
      showSwalAlert("Info!", "Only pdf, jpg, jpeg, png files are allowed.", "info");
    }

    setFiles(allowed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!schoolId.trim()) {
      showSwalAlert("Info!", "Niswan is required.", "info");
      return;
    }

    if (!title.trim()) {
      showSwalAlert("Info!", "Inspection report title is required.", "info");
      return;
    }

    if (!reportDate) {
      showSwalAlert("Info!", "Report date is required.", "info");
      return;
    }

    if (!contentHtml.trim() || !getPlainTextFromHtml(contentHtml)) {
      showSwalAlert("Info!", "Inspection report content is required.", "info");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("schoolId", schoolId);
      formData.append("title", title.trim());
      formData.append("reportDate", reportDate);
      formData.append("contentHtml", contentHtml);
      formData.append("contentText", getPlainTextFromHtml(contentHtml));

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await addInspectionReport(formData);

      showSwalAlert(
        "Success!",
        res?.message || "Inspection report submitted successfully.",
        "success"
      );

      navigate("/dashboard/inspection-reports");
    } catch (error) {
      showSwalAlert(
        "Error!",
        error?.response?.data?.message ||
        error.message ||
        "Failed to submit inspection report.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return getPrcessing();
  }

  return (
    <div className="mt-1 p-5">
      <div className="mt-1 rounded-lg border bg-white p-4 shadow-lg md:p-6">
        <div className="mb-6 flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-white shadow">
          <h3 className="text-lg font-semibold">Add Inspection Report</h3>
          <Link to="/dashboard/inspection-reports">
            <FaRegTimesCircle className="ml-7 rounded-xl bg-gray-200 text-2xl text-red-700 shadow-md" />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <Field label="Niswan" className="md:col-span-4">
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                disabled={loadingSchools || schools.length === 1}
                className="w-full rounded-md border bg-slate-50 px-3 py-2.5 text-sm outline-none shadow-sm disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select Niswan</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.code} : {school.nameEnglish || school.name || school.schoolName || ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Report Title" className="md:col-span-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border bg-slate-50 px-3 py-2.5 text-sm outline-none shadow-sm"
              />
            </Field>

            <Field label="Report Date" className="md:col-span-2">
              <input
                type="date"
                value={reportDate}
                disabled
                className="w-full cursor-not-allowed rounded-md border bg-slate-100 px-3 py-2.5 text-sm outline-none shadow-sm"
              />
            </Field>

            <Field label="Attachments (pdf / jpg / png)" className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm hover:bg-slate-100">
                <FaUpload className="text-teal-600" />
                <span>Choose files</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </Field>
          </div>

          {files.length > 0 && (
            <div className="mt-4 rounded-md border bg-slate-50 p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-slate-700">Selected Files</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-slate-500">{Math.ceil(file.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Report Content
            </label>
            <div className="overflow-hidden rounded-md border bg-white shadow-sm">
              <ReactQuill
                theme="snow"
                value={contentHtml}
                onChange={setContentHtml}
                modules={modules}
                formats={formats}
                className="min-h-[280px]"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-teal-700 disabled:opacity-60"
            >
              <FaPaperPlane />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}