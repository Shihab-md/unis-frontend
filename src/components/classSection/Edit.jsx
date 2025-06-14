import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const Edit = () => {
  const [classSection, setClassSection] = useState({
    classs: "",
    section: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

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
          const classSection = responnse.data.classSection;
          setClassSection((prev) => ({
            ...prev,
            classs: classSection.classs,
            section: classSection.section,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchClassSection();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassSection((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `https://unis-server.vercel.app/api/classSection/${id}`,
        classSection,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        navigate("/dashboard/classSections");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {classSection ? (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-lg border">
          <h2 className="text-2xl font-bold mb-6">Update Class Section</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <input
                  type="text"
                  name="classs"
                  value={classSection.classs}
                  onChange={handleChange}
                  placeholder="Insert Class"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={classSection.section}
                  onChange={handleChange}
                  placeholder="Insert Section"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              data-ripple-light="true"
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Class Section
            </button>
          </form>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default Edit;
