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
            Class Section Detail
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>

            </div>
            <div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Class:</p>
                <p className="font-medium">{classSection.classs}</p>
              </div>
              <div className="flex space-x-3 mb-5">
                <p className="text-lg font-bold">Section:</p>
                <p className="font-medium">{classSection.section}</p>
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
