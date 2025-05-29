import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClick, getSpinner } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const { id } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSupervisor = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setSupervisor(responnse.data.supervisor);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');;
        }
      }
    };

    fetchSupervisor();
  }, []);
  return (
    <>
      {supervisor ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Supervisor Details</h2>
            <Link to="/admin-dashboard/supervisors" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">

              <div className="flex mt-2 space-x-3 mb-3 items-center justify-center" >
                <img className='size-40 border items-center justify-center rounded-lg shadow-lg'
                  src={supervisor.userId.profileImage && supervisor.userId.profileImage != "" ? "data:image/jpeg;base64," + supervisor.userId.profileImage : "/avatar.png"}
                />
              </div>
              <div>
                <div className="flex mt-1 space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name:</p>
                  <p className="font-normal">{supervisor.userId.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Email:</p>
                  <p className="font-normal">{supervisor.userId.email}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Supervisor ID:</p>
                  <p className="font-normal">{supervisor.supervisorId}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Contact Number:</p>
                  <p className="font-normal">{supervisor.contactNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Address:</p>
                  <p className="font-normal">{supervisor.address}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Route:</p>
                  <p className="font-normal">{supervisor.routeName}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Qualification:</p>
                  <p className="font-normal">{supervisor.qualification}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Birth:</p>
                  <p className="font-normal">
                    {new Date(supervisor.dob).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Gender:</p>
                  <p className="font-normal">{supervisor.gender}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Marital Status:</p>
                  <p className="font-normal">{supervisor.maritalStatus}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Joining:</p>
                  <p className="font-normal">
                    {new Date(supervisor.doj).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Salary:</p>
                  <p className="font-normal">{supervisor.salary}</p>
                </div>
              </div>
            </div>
            <button
              className="w-full mt-1 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
              data-ripple-light="true"
              onClick={() => navigate(`/admin-dashboard/supervisors`)}
            >  Back
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
