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
          <div className="w-full mt-6 bg-teal-700 text-white font-bold py-2 px-4 rounded">
            <h4 className="text-xl font-bold text-center">
              School Detail
            </h4></div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium" style="color:red">Code :</p>
                <p className="font-medium">{school.code}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Name in English :</p>
                <p className="font-normal">{school.nameEnglish}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Name in Arabic :</p>
                <p className="font-normal">{school.nameArabic}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Name in Native :</p>
                <p className="font-normal">{school.nameNative}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Address :</p>
                <p className="font-normal">{school.address}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">District / State :</p>
                <p className="font-normal">{school.district}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Contact Number :</p>
                <p className="font-normal">{school.contactNumber}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Email :</p>
                <p className="font-normal">{school.email}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Status :</p>
                <p className="font-normal">{school.active}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-1 Name :</p>
                <p className="font-normal">{school.incharge1}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-1 Number :</p>
                <p className="font-normal">{school.incharge1Number}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-2 Name :</p>
                <p className="font-normal">{school.incharge2}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-2 Number :</p>
                <p className="font-normal">{school.incharge2Number}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-3 Name :</p>
                <p className="font-normal">{school.incharge3}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-3 Number :</p>
                <p className="font-normal">{school.incharge3Number}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-4 Name :</p>
                <p className="font-normal">{school.incharge4}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-4 Number :</p>
                <p className="font-normal">{school.incharge4Number}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-5 Name :</p>
                <p className="font-normal">{school.incharge5}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="font-medium">Incharge-5 Number :</p>
                <p className="font-normal">{school.incharge5Number}</p>
              </div>
              <div className="flex space-x-3 mb-5" />
            </div>
          </div>
          <button
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
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
