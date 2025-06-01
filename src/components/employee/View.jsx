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
          Swal.fire('Error!', error.response.data.error, 'error');;
        }
      }
    };

    fetchEmployee();
  }, []);
  return (
    <>
      {employee ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md bg-blue-50">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Employee Details</h2>
            <Link to="/dashboard/employees" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">
              <div className="flex mt-2 space-x-3 mb-3 items-center justify-center" >
                <img className='size-40 border items-center justify-center rounded-lg shadow-lg'
                  src={employee.userId.profileImage && employee.userId.profileImage != "" ? "data:image/jpeg;base64," + employee.userId.profileImage : "/avatar.png"}
                />
              </div>
              <div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name:</p>
                  <p className="font-normal">{employee.userId.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Email:</p>
                  <p className="font-normal">{employee.userId.email}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Employee ID:</p>
                  <p className="font-normal">{employee.employeeId}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Niswan Name:</p>
                  <p className="font-normal">{employee.schoolId.nameEnglish}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Contact Number:</p>
                  <p className="font-normal">{employee.contactNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Address:</p>
                  <p className="font-normal">{employee.address}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Designation:</p>
                  <p className="font-normal">{employee.designation}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Qualification:</p>
                  <p className="font-normal">{employee.qualification}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Birth:</p>
                  <p className="font-normal">
                    {new Date(employee.dob).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Gender:</p>
                  <p className="font-normal">{employee.gender}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Marital Status:</p>
                  <p className="font-normal">{employee.maritalStatus}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Joining:</p>
                  <p className="font-normal">
                    {new Date(employee.doj).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Salary:</p>
                  <p className="font-normal">{employee.salary}</p>
                </div>
              </div>
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
