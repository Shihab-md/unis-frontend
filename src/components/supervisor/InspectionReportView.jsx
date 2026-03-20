import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaDownload, FaEye, FaPrint } from "react-icons/fa";
import { fetchInspectionReportById } from "../../api/inspectionReportApi";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

export default function InspectionReportView() {
  const { id } = useParams();
  const printRef = useRef(null);

  const [inspectionReport, setInspectionReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInspectionReport = async () => {
    try {
      setLoading(true);
      const res = await fetchInspectionReportById(id);
      setInspectionReport(res?.data || null);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Failed to load inspection report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspectionReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Loading inspection report...</div>;
  }

  if (!inspectionReport) {
    return <div className="p-6 text-center text-sm text-slate-500">Inspection report not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-5">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
            }
          }
          .report-html h1, .report-html h2, .report-html h3 {
            font-weight: 700;
            margin-top: 12px;
            margin-bottom: 8px;
          }
          .report-html p {
            margin-bottom: 10px;
            line-height: 1.8;
          }
          .report-html ul, .report-html ol {
            margin-left: 20px;
            margin-bottom: 10px;
          }
        `}
      </style>

      <div className="mx-auto max-w-5xl space-y-4">
        <div className="no-print rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">View Inspection Report</h2>
              <p className="text-sm text-slate-500">Inspection report details and attachments</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/inspection-reports"
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Back
              </Link>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
              >
                <FaPrint />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        <div ref={printRef} className="rounded-2xl border bg-white p-4 shadow-sm md:p-6">
          <div className="mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-slate-800">{inspectionReport.title}</h1>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Report Date" value={formatDate(inspectionReport.reportDate)} />
            <Info label="Academic Year" value={inspectionReport.acYear || "-"} />
            <Info label="Supervisor Name" value={inspectionReport.supervisorName || "-"} />
            <Info label="Niswan" value={inspectionReport.niswan || inspectionReport.schoolName || "-"} />
          </div>

          <div className="mb-6 rounded-xl border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Report Content</p>
            <div
              className="report-html text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: inspectionReport.contentHtml || "" }}
            />
          </div>

          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Attachments</p>

            {inspectionReport.attachments?.length ? (
              <div className="space-y-3">
                {inspectionReport.attachments.map((file, index) => (
                  <div
                    key={`${file.driveFileId}-${index}`}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Info label="File Name" value={file.fileName || "-"} />
                      <Info label="Type" value={file.mimeType || "-"} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 no-print">
                      <a
                        href={file.driveViewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                      >
                        <FaEye />
                        View
                      </a>
                      <a
                        href={file.driveDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                      >
                        <FaDownload />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No attachments uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}