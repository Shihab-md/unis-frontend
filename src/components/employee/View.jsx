import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getFormattedDate, showSwalAlert } from "../../utils/CommonHelper";
import { useParams, useNavigate, Link } from "react-router-dom";
import ViewCard from "../dashboard/ViewCard";
import { FaRegTimesCircle, FaPrint } from "react-icons/fa";
import EmployeeProfilePrint from "../../components/report/EmployeeProfilePrint";
import { AutoText, useLanguage } from "../../i18n/LanguageContext";
import { formatAge, formatWorkingExperience } from "../../utils/employeeProfileUtils";

const View = () => {
  const { tr, direction, fontFamily } = useLanguage();
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
          <div dir={direction} style={{ fontFamily }} className="no-print max-w-3xl mx-auto mt-2 p-5 shadow-lg border">
            <div className="flex py-2 px-4 items-center justify-between bg-teal-700 text-white rounded-lg shadow-lg">
              <AutoText as="h2" text={tr("Employee Details")} variant="button" className="font-semibold" />

              <div className="flex items-center gap-3 text-xs lg:text-lg">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-700"
                >
                  <FaPrint />
                  <AutoText text={tr("Print / Save PDF")} variant="button" />
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

                <ViewCard type="title" text="Father / Guardian Name" />
                <ViewCard type="data" text={employee?.fatherGuardianName || "-"} />

                <ViewCard type="title" text="Qualification" />
                <ViewCard type="data" text={employee?.qualification} />

                <ViewCard type="title" text="Date of Birth" />
                <ViewCard type="data" text={getFormattedDate(employee?.dob)} />

                <ViewCard type="title" text="Age" />
                <ViewCard type="data" text={formatAge(employee?.dob, tr)} />

                <ViewCard type="title" text="Gender" />
                <ViewCard type="data" text={tr(employee?.gender || "-")} />

                <ViewCard type="title" text="Marital Status" />
                <ViewCard type="data" text={tr(employee?.maritalStatus || "-")} />

                <ViewCard type="title" text="Date of Joining" />
                <ViewCard type="data" text={getFormattedDate(employee?.doj)} />

                <ViewCard type="title" text="Working Experience" />
                <ViewCard type="data" text={formatWorkingExperience(employee?.doj, tr)} />

                <ViewCard type="title" text="Other Designation" />
                <ViewCard type="data" text={<span className="whitespace-pre-wrap break-words">{employee?.otherDesignation || "-"}</span>} />

                <ViewCard type="title" text="Hadhiya" />
                <ViewCard type="data" text={employee?.salary} />

                <ViewCard type="title" text="Travelling Allowance" />
                <ViewCard type="data" text={employee?.travellingAllowance ?? 0} />

                <ViewCard type="title" text="Activities carried out" />
                <ViewCard type="data" text={<span className="whitespace-pre-wrap break-words">{employee?.activitiesCarriedOut || "-"}</span>} />

                <ViewCard type="title" text="Bank account details" />
                <ViewCard type="data" text={<span className="whitespace-pre-wrap break-words">{employee?.bankAccountDetails || "-"}</span>} />

                <div className="flex space-x-3 mb-5" />
              </div>
            </div>

            <button
              className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
              onClick={() => navigate("/dashboard/employees")}
            >
              <AutoText text={tr("Back")} variant="button" className="font-bold" />
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