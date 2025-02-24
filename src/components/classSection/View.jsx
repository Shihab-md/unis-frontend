import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const View = () => {
  const { id } = useParams();
  const [classSection, setClassSection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassSection = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/classSection/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setClassSection(responnse.data.classSection);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchClassSection();
  }, []);
  return (
    <>
      {classSection ? (
        <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-8 text-center">
            ClassSection Detail
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>

            </div>
            <div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Code:</p>
                <p className="font-medium">{classSection.code}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Name:</p>
                <p className="font-medium">{classSection.name}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Address:</p>
                <p className="font-medium">{classSection.address}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Contact Number:</p>
                <p className="font-medium">{classSection.contactNumber}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Email:</p>
                <p className="font-medium">{classSection.email}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Status:</p>
                <p className="font-medium">{classSection.active}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge1:</p>
                <p className="font-medium">{classSection.incharge1}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge1 Number:</p>
                <p className="font-medium">{classSection.incharge1Number}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge2:</p>
                <p className="font-medium">{classSection.incharge2}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge2 Number:</p>
                <p className="font-medium">{classSection.incharge2Number}</p>
              </div>
            </div>
          </div>
          <button
            className="px-3 py-1 bg-blue-600 text-white"
            data-ripple-light="true"
            onClick={() => navigate(`/admin-dashboard/classSections`)}
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
