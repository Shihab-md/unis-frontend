import React, { useEffect, useState } from "react";
//import { fetchDepartments } from "../../utils/InstituteHelper";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import {
  FaWindowClose
} from "react-icons/fa";

const Edit = () => {
  const [institute, setInstitute] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    routeName: "",
    qualification: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    doj: "",
    designation: "",
    salary: "",
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
            name: institute.userId.name,
            email: institute.userId.email,
            instituteId: institute.instituteId,
            contactNumber: institute.contactNumber,
            address: institute.address,
            routeName: institute.routeName,
            qualification: institute.qualification,
            dob: institute.dob,
            gender: institute.gender,
            maritalStatus: institute.maritalStatus,
            doj: institute.doj,
            designation: institute.designation,
            salary: institute.salary
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
          <div className="grid items-center justify-end px-1 py-1">
            <Link to="/admin-dashboard/institutes" >
              <FaWindowClose className="text-xl bg-red-700 text-white rounded shadow-md" />
            </Link>
          </div>
          <div className="grid grid-cols-1 mt-2 bg-teal-700 text-white font-bold py-2 px-4 rounded">
            <div><h2 className="grid text-xl font-semibold items-center justify-center">Update Institute Details</h2></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-3 mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={institute.name}
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

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="number"
                  name="contactNumber"
                  value={institute.name}
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
                  value={institute.name}
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
                  value={institute.name}
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
                  name="routeName"
                  value={institute.name}
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
                  value={institute.name}
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
                  value={institute.name}
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
                  value={institute.name}
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
                  value={institute.name}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
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
