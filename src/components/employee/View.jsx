import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClick, getSpinner, checkAuth } from '../../utils/CommonHelper';
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });
  
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("employeeView") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
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
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard/employees");
        }
      }
    };

    fetchEmployee();
  }, []);
  return (
    <>
      {employee ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 rounded-md shadow-md">
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
                  src={employee.userId.profileImage && employee.userId.profileImage != "" ? "data:image/jpeg;base64," + employee.userId.profileImage : "/avatar.png"}
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

              <ViewCard type="title" text="Designation" />
              <ViewCard type="data" text={employee.designation} />

              <ViewCard type="title" text="Qualification" />
              <ViewCard type="data" text={employee.qualification} />

              <ViewCard type="title" text="Date of Birth" />
              <ViewCard type="data" text={new Date(employee.dob).toLocaleDateString()} />

              <ViewCard type="title" text="Gender" />
              <ViewCard type="data" text={employee.gender} />

              <ViewCard type="title" text="Marital Status" />
              <ViewCard type="data" text={employee.maritalStatus} />

              <ViewCard type="title" text="Date of Joining" />
              <ViewCard type="data" text={new Date(employee.doj).toLocaleDateString()} />

              <ViewCard type="title" text="Salary" />
              <ViewCard type="data" text={employee.salary} />

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
