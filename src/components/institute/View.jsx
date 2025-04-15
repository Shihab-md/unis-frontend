import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  const { id } = useParams();
  const [institute, setInstitute] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/institute/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setInstitute(responnse.data.institute);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchInstitute();
  }, []);
  return (
    <>
      {institute ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Institute Details</h2>
            <Link to="/admin-dashboard/institutes" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">
              <div className="flex space-x-3 mb-5" />
              <div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Code:</p>
                  <p className="font-normal">{institute.iCode}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name:</p>
                  <p className="font-normal">{institute.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Email:</p>
                  <p className="font-normal">{institute.email}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Contact Number:</p>
                  <p className="font-normal">{institute.contactNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Address:</p>
                  <p className="font-normal">{institute.address}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">District:</p>
                  <p className="font-normal">{institute.district}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-1 Name :</p>
                  <p className="font-normal">{institute.incharge1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-1 Number :</p>
                  <p className="font-normal">{institute.incharge1Number}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-2 Name :</p>
                  <p className="font-normal">{institute.incharge2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-2 Number :</p>
                  <p className="font-normal">{institute.incharge2Number}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            className="w-full mt-1 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/admin-dashboard/institutes`)}
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
