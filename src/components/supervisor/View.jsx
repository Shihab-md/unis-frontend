import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const View = () => {
  const { id } = useParams();
  const [supervisor, setSupervisor] = useState(null);

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
          <h2 className="text-2xl font-bold mb-8 text-center">
            Supervisor Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={`https://unis-server.vercel.app/${supervisor.userId.profileImage}`}
                className="rounded-full border w-72"
              />
            </div>
            <div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Name:</p>
                <p className="font-medium">{supervisor.userId.name}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Email:</p>
                <p className="font-medium">{supervisor.userId.email}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Supervisor ID:</p>
                <p className="font-medium">{supervisor.supervisorId}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Contact Number:</p>
                <p className="font-medium">{supervisor.contactNumber}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Address:</p>
                <p className="font-medium">{supervisor.address}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Route:</p>
                <p className="font-medium">{supervisor.routeName}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Qualification:</p>
                <p className="font-medium">{supervisor.qualification}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Date of Birth:</p>
                <p className="font-medium">
                  {new Date(supervisor.dob).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Gender:</p>
                <p className="font-medium">{supervisor.gender}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Marital Status:</p>
                <p className="font-medium">{supervisor.maritalStatus}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Date of Joining:</p>
                <p className="font-medium">
                  {new Date(supervisor.doj).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Salary:</p>
                <p className="font-medium">{supervisor.salary}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div> Loading ....</div>
      )}
    </>
  );
};

export default View;
