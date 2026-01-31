import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getFormattedDate, showSwalAlert } from '../../utils/CommonHelper';
import { useParams, useNavigate, Link } from "react-router-dom";
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("employeeView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchEmployee = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setEmployee(responnse.data.employee);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/employees");
        }
      }
    };

    fetchEmployee();
  }, []);

  return (
    <>
      {employee ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Employee Details</h2>
            <Link to="/dashboard/employees" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="flex mt-2 space-x-3 mb-3 items-center justify-center" >
                <img className='size-40 border mt-3 items-center justify-center rounded-lg shadow-lg'
                  src={employee.userId.profileImage && employee.userId.profileImage != "" ? employee.userId.profileImage + "?" + new Date().getTime() : "/avatar.png"}
                />
              </div>
              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Name" />
              <ViewCard type="data" text={employee.userId.name} />

              <ViewCard type="title" text="Email" />
              <ViewCard type="data" text={employee.userId.email} />

              <ViewCard type="title" text="Employee ID" />
              <ViewCard type="data" text={employee.employeeId} />

              <ViewCard type="title" text="Niswan Name" />
              <ViewCard type="data" text={employee.schoolId.nameEnglish} />

              <ViewCard type="title" text="Contact Number" />
              <ViewCard type="data" text={employee.contactNumber} />

              <ViewCard type="title" text="Address" />
              <ViewCard type="data" text={employee.address} />

              <ViewCard type="title" text="Qualification" />
              <ViewCard type="data" text={employee.qualification} />

              <ViewCard type="title" text="Date of Birth" />
              <ViewCard type="data" text={getFormattedDate(employee.dob)} />

              <ViewCard type="title" text="Gender" />
              <ViewCard type="data" text={employee.gender} />

              <ViewCard type="title" text="Marital Status" />
              <ViewCard type="data" text={employee.maritalStatus} />

              <ViewCard type="title" text="Date of Joining" />
              <ViewCard type="data" text={getFormattedDate(employee.doj)} />

              <ViewCard type="title" text="Salary" />
              <ViewCard type="data" text={employee.salary} />

              <ViewCard type="title" text="More details about the Employee" />
              <ViewCard type="data" text={employee.designation} />

              <div className="flex space-x-3 mb-5" />
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/dashboard/employees`)}
          >  Back
          </button>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;
