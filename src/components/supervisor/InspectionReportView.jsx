import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  handleRightClickAndFullScreen,
  getSpinner,
  checkAuth,
  getFormattedDate,
  showSwalAlert,
} from "../../utils/CommonHelper";
import { FaRegTimesCircle, FaPrint, FaEye, FaDownload } from "react-icons/fa";
import { fetchInspectionReportById } from "../../api/inspectionReportApi";
import ViewCard from "../dashboard/ViewCard";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspectionReport, setInspectionReport] = useState(null);

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  useEffect(() => {
    if (checkAuth("inspectionReportView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const loadInspectionReport = async () => {
      try {
        const res = await fetchInspectionReportById(id);

        if (res?.success) {
          setInspectionReport(res.data);
        } else {
          showSwalAlert("Error!", "Inspection report not found.", "error");
          navigate("/dashboard/inspection-reports");
        }
      } catch (error) {
        showSwalAlert(
          "Error!",
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load inspection report.",
          "error"
        );
        navigate("/dashboard/inspection-reports");
      }
    };

    loadInspectionReport();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!inspectionReport) {
    return getSpinner();
  }

  return (
    <>
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }

            .print-root {
              display: block !important;
            }

            body {
              background: white !important;
            }
          }
        `}
      </style>

      {/* SCREEN VIEW */}
      <div className="no-print max-w-4xl mx-auto mt-2 p-5">
        <div className="flex py-2 px-4 items-center justify-between bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Inspection Report Details</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1 rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              <FaPrint />
              Print / Save PDF
            </button>

            <Link to="/dashboard/inspection-reports">
              <FaRegTimesCircle className="text-2xl text-red-700 bg-gray-200 rounded-xl shadow-md" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="py-4 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
            <div>
              <ViewCard type="title" text="Title" />
              <ViewCard type="data" text={inspectionReport?.title || "-"} />

              <ViewCard type="title" text="Report Date" />
              <ViewCard type="data" text={getFormattedDate(inspectionReport?.reportDate) || "-"} />

              <ViewCard type="title" text="Supervisor Name" />
              <ViewCard type="data" text={inspectionReport?.supervisorId + " : " + inspectionReport?.userId?.name || "-"} />

              <ViewCard type="title" text="Niswan" />
              <ViewCard type="data" text={inspectionReport?.schoolId?.code + " : " + inspectionReport?.schoolId?.nameEnglish || "-"} />

              <div className="mt-4 mb-2">
                <p className="text-sm font-semibold text-slate-700">Report Content</p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4 shadow-sm min-h-[180px]">
                {inspectionReport?.contentHtml ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: inspectionReport.contentHtml }}
                  />
                ) : (
                  <p className="text-sm text-slate-500">No content available.</p>
                )}
              </div>

              <div className="mt-6 mb-2">
                <p className="text-sm font-semibold text-slate-700">Attachments</p>
              </div>

              {inspectionReport?.attachments?.length > 0 ? (
                <div className="space-y-3">
                  {inspectionReport.attachments.map((file, index) => (
                    <div
                      key={`${file.driveFileId || file.fileName}-${index}`}
                      className="flex flex-col gap-3 rounded-lg border bg-slate-50 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {file.fileName || `Attachment ${index + 1}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {file.mimeType || "-"}
                          {file.size ? ` | ${Math.ceil(Number(file.size) / 1024)} KB` : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {file.driveViewUrl ? (
                          <a
                            href={file.driveViewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                          >
                            <FaEye />
                            View
                          </a>
                        ) : null}

                        {file.driveDownloadUrl ? (
                          <a
                            href={file.driveDownloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200"
                          >
                            <FaDownload />
                            Download
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border bg-slate-50 px-4 py-4 text-sm text-slate-500 shadow-sm">
                  No attachments uploaded.
                </div>
              )}
            </div>
          </div>

          <button
            className="w-full mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
            onClick={() => navigate("/dashboard/inspection-reports")}
          >
            Back
          </button>
        </div>
      </div>

      {/* PRINT VIEW */}
      <div className="print-root hidden p-6">
        <div className="max-w-4xl mx-auto">
          <div className="border rounded-md p-6">
            <h1 className="text-2xl font-bold text-center mb-6">
              Inspection Report
            </h1>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <PrintInfo label="Title" value={inspectionReport?.title} />
              <PrintInfo
                label="Report Date"
                value={getFormattedDate(inspectionReport?.reportDate)}
              />
              <PrintInfo
                label="Supervisor Name"
                value={inspectionReport?.supervisorName}
              />
              <PrintInfo
                label="Niswan"
                value={inspectionReport?.niswan || inspectionReport?.schoolName}
              />
            </div>

            <div className="mb-6">
              <p className="font-semibold mb-2">Report Content</p>
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: inspectionReport?.contentHtml || "-" }}
              />
            </div>

            <div>
              <p className="font-semibold mb-2">Attachments</p>
              {inspectionReport?.attachments?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {inspectionReport.attachments.map((file, index) => (
                    <li key={`${file.driveFileId || file.fileName}-${index}`}>
                      {file.fileName || `Attachment ${index + 1}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">No attachments uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function PrintInfo({ label, value }) {
  return (
    <div>
      <p className="font-semibold">{label}</p>
      <p>{value || "-"}</p>
    </div>
  );
}

export default View;