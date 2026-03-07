import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  getSpinner,
  checkAuth,
  getFormattedDate,
  showSwalAlert,
} from "../../utils/CommonHelper";
import ViewCard from "../dashboard/ViewCard";
import { FaRegTimesCircle, FaPrint } from "react-icons/fa";
import SupervisorProfilePrint from "../../components/report/SupervisorProfilePrint";

const View = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const { id } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (checkAuth("supervisorView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const fetchSupervisor = async () => {
      try {
        const response = await axios.get(
          `${(await getBaseUrl()).toString()}supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response?.data?.success) {
          setSupervisor(response.data.supervisor);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/supervisors/");
        } else {
          showSwalAlert("Error!", "Failed to load supervisor details.", "error");
          navigate("/dashboard/supervisors/");
        }
      }
    };

    fetchSupervisor();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {supervisor ? (
        <>
          {/* SCREEN VIEW */}
          <div className="no-print max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
            <div className="flex py-2 px-4 items-center justify-between bg-teal-700 text-white rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold">Supervisor Details</h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-700"
                >
                  <FaPrint />
                  Print / Save PDF
                </button>

                <Link to="/dashboard/supervisors">
                  <FaRegTimesCircle className="text-2xl text-red-700 bg-gray-200 rounded-xl shadow-md" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="py-4 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
                <div className="flex mt-4 space-x-3 mb-3 items-center justify-center">
                  <img
                    className="size-40 border items-center justify-center rounded-lg shadow-lg hover:-translate-y-0.5"
                    src={
                      supervisor?.userId?.profileImage &&
                      supervisor.userId.profileImage !== ""
                        ? `${supervisor.userId.profileImage}?${new Date().getTime()}`
                        : "/avatar.png"
                    }
                    alt="Supervisor"
                  />
                </div>

                <div>
                  <div className="flex mt-1 space-x-3 mb-5" />

                  <ViewCard type="title" text="Name" />
                  <ViewCard type="data" text={supervisor?.userId?.name} />

                  <ViewCard type="title" text="Email" />
                  <ViewCard type="data" text={supervisor?.userId?.email} />

                  <ViewCard type="title" text="Supervisor ID" />
                  <ViewCard type="data" text={supervisor?.supervisorId} />

                  <ViewCard type="title" text="Contact Number" />
                  <ViewCard type="data" text={supervisor?.contactNumber} />

                  <ViewCard type="title" text="Address" />
                  <ViewCard type="data" text={supervisor?.address} />

                  <ViewCard type="title" text="Route" />
                  <ViewCard type="data" text={supervisor?.routeName} />

                  <ViewCard type="title" text="Qualification" />
                  <ViewCard type="data" text={supervisor?.qualification} />

                  <ViewCard type="title" text="Date of Birth" />
                  <ViewCard type="data" text={getFormattedDate(supervisor?.dob)} />

                  <ViewCard type="title" text="Gender" />
                  <ViewCard type="data" text={supervisor?.gender} />

                  <ViewCard type="title" text="Marital Status" />
                  <ViewCard type="data" text={supervisor?.maritalStatus} />

                  <ViewCard type="title" text="Job Type" />
                  <ViewCard type="data" text={supervisor?.jobType} />

                  <ViewCard type="title" text="Date of Joining" />
                  <ViewCard type="data" text={getFormattedDate(supervisor?.doj)} />

                  <ViewCard type="title" text="Salary" />
                  <ViewCard type="data" text={supervisor?.salary} />

                  <ViewCard type="title" text="Remarks" />
                  <ViewCard type="data" text={supervisor?.remarks} />
                </div>
              </div>

              <button
                className="w-full mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
                onClick={() => navigate("/dashboard/supervisors")}
              >
                Back
              </button>
            </div>
          </div>

          {/* PRINT VIEW */}
          <div className="print-root hidden print:block">
            <SupervisorProfilePrint supervisor={supervisor} />
          </div>
        </>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;