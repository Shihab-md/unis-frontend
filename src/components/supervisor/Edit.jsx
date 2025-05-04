import React, { useEffect, useState } from "react";
//import { fetchDepartments } from "../../utils/SupervisorHelper";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import { getBaseUrl } from '../../utils/CommonHelper'
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Edit = () => {
  const [supervisor, setSupervisor] = useState({
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
  // const [departments, setDepartments] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  {/*} useEffect(() => {
    const getDepartments = async () => {
      const departments = await fetchDepartments();
      setDepartments(departments);
    };
    getDepartments();
  }, []); */}

  useEffect(() => {
    const fetchSupervisor = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const supervisor = responnse.data.supervisor;
          setSupervisor((prev) => ({
            ...prev,
            name: supervisor.userId.name,
            email: supervisor.userId.email,
            supervisorId: supervisor.supervisorId,
            contactNumber: supervisor.contactNumber,
            address: supervisor.address,
            routeName: supervisor.routeName,
            qualification: supervisor.qualification,
            dob: supervisor.dob,
            gender: supervisor.gender,
            maritalStatus: supervisor.maritalStatus,
            doj: supervisor.doj,
            designation: supervisor.designation,
            salary: supervisor.salary
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchSupervisor();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupervisor((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        (await getBaseUrl()).toString() + `supervisor/${id}`,
        supervisor,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("Updated Successfully...");
        navigate("/admin-dashboard/supervisors");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {supervisor ? (
        <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Supervisor Details</h2>
            <Link to="/admin-dashboard/supervisors" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={supervisor.name}
                    onChange={handleChange}
                    //      placeholder="Insert Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={supervisor.email}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Insert Email"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Supervisor ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supervisor ID <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="supervisorId"
                    value={supervisor.supervisorId}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Supervisor ID"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={supervisor.contactNumber}
                    onChange={handleChange}
                    //     placeholder="Contact Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
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
                    value={supervisor.address}
                    onChange={handleChange}
                    //    placeholder="Address"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Route Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Route Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="routeName"
                    value={supervisor.routeName}
                    onChange={handleChange}
                    //    placeholder="Route Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Qualification <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={supervisor.qualification}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={moment(new Date(supervisor.dob)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //    placeholder="DOB"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="gender"
                    value={supervisor.gender}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Marital Status <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={supervisor.maritalStatus}
                    onChange={handleChange}
                    placeholder="Marital Status"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                {/* Date of Joining */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Joining <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="doj"
                    value={moment(new Date(supervisor.doj)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //     placeholder="DOJ"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salary <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="salary"
                    onChange={handleChange}
                    value={supervisor.salary}
                    //    placeholder="Salary"
                    className="mt-1 p-2 mb-3 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Supervisor
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
