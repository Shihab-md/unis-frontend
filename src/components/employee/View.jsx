import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getFormattedDate, showSwalAlert } from "../../utils/CommonHelper";
import { useParams, useNavigate, Link } from "react-router-dom";
import ViewCard from "../dashboard/ViewCard";
import { FaRegTimesCircle, FaPrint } from "react-icons/fa";
import EmployeeProfilePrint from "../../components/report/EmployeeProfilePrint";

const View = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (checkAuth("employeeView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `${(await getBaseUrl()).toString()}employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response?.data?.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/employees");
        } else {
          showSwalAlert("Error!", "Failed to load employee details.", "error");
          navigate("/dashboard/employees");
        }
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {employee ? (
        <>
          {/* SCREEN VIEW */}
          <div className="no-print max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
            <div className="flex py-2 px-4 items-center justify-between bg-teal-700 text-white rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold">Employee Details</h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-700"
                >
                  <FaPrint />
                  Print / Save PDF
                </button>

                <Link to="/dashboard/employees">
                  <FaRegTimesCircle className="text-2xl text-red-700 bg-gray-200 rounded-xl shadow-md" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
                <div className="flex mt-2 space-x-3 mb-3 items-center justify-center">
                  <img
                    className="size-40 border mt-3 items-center justify-center rounded-lg shadow-lg hover:-translate-y-0.5"
                    src={
                      employee?.userId?.profileImage && employee.userId.profileImage !== ""
                        ? `${employee.userId.profileImage}?${new Date().getTime()}`
                        : "/avatar.png"
                    }
                    alt="Employee"
                  />
                </div>

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Name" />
                <ViewCard type="data" text={employee?.userId?.name} />

                <ViewCard type="title" text="Email" />
                <ViewCard type="data" text={employee?.userId?.email} />

                <ViewCard type="title" text="Employee ID" />
                <ViewCard type="data" text={employee?.employeeId} />

                <ViewCard type="title" text="Niswan Name" />
                <ViewCard type="data" text={employee?.schoolId?.nameEnglish} />

                <ViewCard type="title" text="Contact Number" />
                <ViewCard type="data" text={employee?.contactNumber} />

                <ViewCard type="title" text="Address" />
                <ViewCard type="data" text={employee?.address} />

                <ViewCard type="title" text="Qualification" />
                <ViewCard type="data" text={employee?.qualification} />

                <ViewCard type="title" text="Date of Birth" />
                <ViewCard type="data" text={getFormattedDate(employee?.dob)} />

                <ViewCard type="title" text="Gender" />
                <ViewCard type="data" text={employee?.gender} />

                <ViewCard type="title" text="Marital Status" />
                <ViewCard type="data" text={employee?.maritalStatus} />

                <ViewCard type="title" text="Date of Joining" />
                <ViewCard type="data" text={getFormattedDate(employee?.doj)} />

                <ViewCard type="title" text="Salary" />
                <ViewCard type="data" text={employee?.salary} />

                <ViewCard type="title" text="More details about the Employee" />
                <ViewCard type="data" text={employee?.designation} />

                <div className="flex space-x-3 mb-5" />
              </div>
            </div>

            <button
              className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
              onClick={() => navigate("/dashboard/employees")}
            >
              Back
            </button>
          </div>

          {/* PRINT VIEW */}
          <div className="print-root hidden print:block">
            <EmployeeProfilePrint employee={employee} />
          </div>
        </>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;