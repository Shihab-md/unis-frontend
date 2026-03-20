import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaPaperPlane, FaUpload } from "react-icons/fa";
import { addInspectionReport } from "../../api/inspectionReportApi";

const getPlainTextFromHtml = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
};

export default function InspectionReportAdd() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [acYear, setAcYear] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
      alert("Only pdf, jpg, jpeg, png files are allowed.");
    }

    setFiles(allowed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Inspection report title is required.");
    if (!reportDate) return alert("Report date is required.");
    if (!acYear.trim()) return alert("Academic year is required.");
    if (!contentHtml.trim()) return alert("Inspection report content is required.");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("reportDate", reportDate);
      formData.append("acYear", acYear);
      formData.append("contentHtml", contentHtml);
      formData.append("contentText", getPlainTextFromHtml(contentHtml));

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      await addInspectionReport(formData);

      alert("Inspection report submitted successfully.");
      navigate("/dashboard/inspection-reports");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Failed to submit inspection report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-5">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Submit Inspection Report</h2>
              <p className="text-sm text-slate-500">Weekly / Monthly inspection report submission</p>
            </div>
            <Link
              to="/dashboard/inspection-reports"
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-4 shadow-sm md:p-6">
          <div className="mb-6 rounded-xl bg-teal-600 px-4 py-3 text-white">
            <h3 className="text-lg font-bold">Inspection Report Submission Form</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Report Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter inspection report title"
                className="w-full rounded-xl border bg-slate-50 px-3 py-3 text-sm outline-none"
              />
            </Field>

            <Field label="Report Date">
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full rounded-xl border bg-slate-50 px-3 py-3 text-sm outline-none"
              />
            </Field>

            <Field label="Academic Year">
              <input
                value={acYear}
                onChange={(e) => setAcYear(e.target.value)}
                placeholder="2025-2026"
                className="w-full rounded-xl border bg-slate-50 px-3 py-3 text-sm outline-none"
              />
            </Field>

            <Field label="Attachments (pdf / jpg / png)">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-slate-50 px-3 py-3 text-sm text-slate-700">
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
            <div className="mt-4 rounded-xl border bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">Selected Files</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
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
            <div className="rounded-xl border bg-white">
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
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow disabled:opacity-60"
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}