import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const View = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/school/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setSchool(responnse.data.school);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchSchool();
  }, []);
  return (
    <>
      {school ? (
        <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-8 text-center">
            School Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
            </div>
            <div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Code:</p>
                <p className="font-medium">{school.code}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Code:</p>
                <p className="font-medium">{school.code}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Name:</p>
                <p className="font-medium">{school.name}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Address:</p>
                <p className="font-medium">{school.address}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Contact Number:</p>
                <p className="font-medium">{school.contactNumber}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Email:</p>
                <p className="font-medium">{school.email}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Status:</p>
                <p className="font-medium">{school.active}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge1:</p>
                <p className="font-medium">{school.incharge1}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge1 Number:</p>
                <p className="font-medium">{school.incharge1Number}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge2:</p>
                <p className="font-medium">{school.incharge2}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge2 Number:</p>
                <p className="font-medium">{school.incharge2Number}</p>
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
