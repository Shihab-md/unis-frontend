import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Edit = () => {
  const [institute, setInstitute] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    district: "",
    incharge1: "",
    incharge1Number: "",
    incharge2: "",
    incharge2Number: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

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
          const institute = responnse.data.institute;
          setInstitute((prev) => ({
            ...prev,
            iCode: institute.iCode,
            name: institute.name,
            type: institute.type,
            email: institute.email,
            contactNumber: institute.contactNumber,
            address: institute.address,
            district: institute.district,
            incharge1: institute.incharge1,
            incharge1Number: institute.incharge1Number,
            incharge2: institute.incharge2,
            incharge2Number: institute.incharge2Number,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchInstitute();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInstitute((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `https://unis-server.vercel.app/api/institute/${id}`,
        institute,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("Updated Successfully...");
        navigate("/admin-dashboard/institutes");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {institute ? (
        <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Institute Details</h2>
            <Link to="/admin-dashboard/institutes" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="iCode"
                    value={institute.iCode}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={institute.name}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Education Type <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="type"
                    onChange={handleChange}
                    value={institute.type}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Education Type</option>
                    <option value="Deeniyath Education">Deeniyath Education</option>
                    <option value="School Education">School Education</option>
                    <option value="College Education">College Education</option>
                    <option value="Vocational Courses">Vocational Courses</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={institute.contactNumber}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={institute.email}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  // required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={institute.address}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    District <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={institute.district}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Incharge1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-1 Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="incharge1"
                    value={institute.incharge1}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Incharge1 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-1 Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="incharge1Number"
                    value={institute.incharge1Number}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Incharge2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-2 Name
                  </label>
                  <input
                    type="text"
                    name="incharge2"
                    value={institute.incharge2}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>

                {/* Incharge2 Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incharge-2 Number
                  </label>
                  <input
                    type="number"
                    name="incharge2Number"
                    value={institute.incharge2Number}
                    onChange={handleChange}
                    className="mt-1 mb-3 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Institute
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
