import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const View = () => {
  const { id } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSupervisor = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/supervisor/${id}`,
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
          alert(error.response.data.error);
        }
      }
    };

    fetchSupervisor();
  }, []);
  return (
    <>
      {supervisor ? (
        <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
          <div className="w-full mt-6 bg-teal-700 text-white font-bold py-2 px-4 rounded">
          <h2 className="text-2xl font-bold text-center">
            Supervisor Details
          </h2></div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="flex space-x-3 mb-5" />
            <div>
              <img
                src={`https://unis-server.vercel.app/${supervisor.userId.profileImage}`}
                className="rounded-full border w-72"
              />
            </div>
            <div>
            <div className="flex space-x-3 mb-5" />
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
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            data-ripple-light="true"
            onClick={() => navigate(`/admin-dashboard/supervisors`)}
          >  Back
          </button>
        </div>
      ) : (
        <div> Loading ....</div>
      )}
    </>
  );
};

export default View;
