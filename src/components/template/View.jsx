import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  getSpinner,
  checkAuth,
  showSwalAlert,
} from "../../utils/CommonHelper";
import ViewCard from "../dashboard/ViewCard";
import { FaRegTimesCircle } from "react-icons/fa";

const View = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleShowDialog = () => {
    setShow(true);
  };

  const handleHideDialog = () => {
    setShow(false);
  };

  useEffect(() => {
    if (checkAuth("templateView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const fetchTemplate = async () => {
      try {
        const response = await axios.get(
          `${(await getBaseUrl()).toString()}template/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response?.data?.success) {
          setTemplate(response.data.template);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
        } else {
          showSwalAlert("Error!", "Failed to load template details.", "error");
        }
        navigate("/dashboard/templates/");
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  const rawFileUrl = template?.template && template.template !== "" ? template.template : "";
  const fileUrl = rawFileUrl ? `${rawFileUrl}?${new Date().getTime()}` : "/template.jpg";

  const isPdf = useMemo(() => {
    return rawFileUrl && String(rawFileUrl).toLowerCase().includes(".pdf");
  }, [rawFileUrl]);

  const downloadName = useMemo(() => {
    if (!template?._id) return isPdf ? "template.pdf" : "template.jpg";
    return isPdf ? `template_${template._id}.pdf` : `template_${template._id}.jpg`;
  }, [template, isPdf]);

  return (
    <>
      {template ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">
              Template Details
            </h2>
            <Link to="/dashboard/templates">
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
              {show && (
                <div
                  className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
                  onClick={handleHideDialog}
                  title="Click outside to Close"
                >
                  <div
                    className="bg-white rounded-lg shadow-2xl max-w-[95vw] max-h-[95vh] overflow-auto p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isPdf ? (
                      <div className="w-[90vw] max-w-5xl">
                        <iframe
                          title="Template PDF Preview"
                          src={fileUrl}
                          className="w-full h-[80vh] border shadow-lg rounded-lg bg-white"
                        />
                        <div className="mt-3 flex justify-end gap-3">
                          <a
                            href={rawFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Open PDF
                          </a>
                          <a
                            href={rawFileUrl}
                            download={downloadName}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Download PDF
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[90vw]">
                        <img
                          className="max-w-[90vw] max-h-[80vh] object-contain border shadow-lg rounded-lg"
                          src={fileUrl}
                          alt="Template Preview"
                        />
                        <div className="mt-3 flex justify-end">
                          <a
                            href={rawFileUrl || "/template.jpg"}
                            download={downloadName}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Download Image
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div
                className="flex mt-2 space-x-3 mb-3 items-center justify-center"
                title="Click to ZOOM"
              >
                {isPdf ? (
                  <div
                    onClick={handleShowDialog}
                    className="size-40 mt-5 border rounded-lg shadow-lg hover:-translate-y-0.5 cursor-pointer flex flex-col items-center justify-center bg-gray-50"
                  >
                    <div className="text-5xl">📄</div>
                    <div className="mt-2 text-xs font-semibold text-gray-700 text-center px-2">
                      PDF Preview
                    </div>
                  </div>
                ) : (
                  <img
                    className="size-40 mt-5 border items-center justify-center rounded-lg shadow-lg hover:-translate-y-0.5 cursor-pointer object-cover"
                    onClick={handleShowDialog}
                    src={fileUrl}
                    alt="Template Thumbnail"
                  />
                )}
              </div>

              <div className="flex justify-center mb-4">
                {rawFileUrl ? (
                  <a
                    href={rawFileUrl}
                    download={downloadName}
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {isPdf ? "Download PDF" : "Download Image"}
                  </a>
                ) : null}
              </div>

              <div>
                <div className="flex mt-1 space-x-3 mb-5" />

                <ViewCard type="title" text="Course Name" />
                <ViewCard type="data" text={template?.courseId?.name || "-"} />

                <ViewCard type="title" text="Details" />
                <ViewCard type="data" text={template?.details || "-"} />

                <div className="flex mt-1 space-x-3 mb-5" />
              </div>
            </div>

            <button
              className="w-full mt-1 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
              data-ripple-light="true"
              onClick={() => navigate(`/dashboard/templates`)}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;