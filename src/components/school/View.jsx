import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const View = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const navigate = useNavigate();

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
            School Detail
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Code :</p>
                <p className="font-medium">{school.code}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Name in English :</p>
                <p className="font-medium">{school.nameEnglish}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Name in Arabic :</p>
                <p className="font-medium">{school.nameArabic}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Name in Native :</p>
                <p className="font-medium">{school.nameNative}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Address :</p>
                <p className="font-medium">{school.address}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">District / State :</p>
                <p className="font-medium">{school.address}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Contact Number :</p>
                <p className="font-medium">{school.contactNumber}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Email :</p>
                <p className="font-medium">{school.email}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Status :</p>
                <p className="font-medium">{school.active}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-1 Name :</p>
                <p className="font-medium">{school.incharge1}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-1 Number :</p>
                <p className="font-medium">{school.incharge1Number}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-2 Name :</p>
                <p className="font-medium">{school.incharge2}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-2 Number :</p>
                <p className="font-medium">{school.incharge2Number}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-3 Name :</p>
                <p className="font-medium">{school.incharge3}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-3 Number :</p>
                <p className="font-medium">{school.incharge3Number}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-4 Name :</p>
                <p className="font-medium">{school.incharge4}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-4 Number :</p>
                <p className="font-medium">{school.incharge4Number}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-5 Name :</p>
                <p className="font-medium">{school.incharge1}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Incharge-5 Number :</p>
                <p className="font-medium">{school.incharge1Number}</p>
              </div>
              <div className="flex space-x-3 mb-5"/>
            </div>
          </div>
          <button
            className="w-full px-7 py-1 bg-blue-600 text-white rounded"
            data-ripple-light="true"
            onClick={() => navigate(`/admin-dashboard/schools`)}
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
