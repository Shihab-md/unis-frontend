import React, { useEffect, useState } from "react";
//import { fetchDepartments } from "../../utils/SupervisorHelper";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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
          `https://unis-server.vercel.app/api/supervisor/${id}`,
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
        `https://unis-server.vercel.app/api/supervisor/${id}`,
        supervisor,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
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
        <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-6">Edit Supervisor</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={supervisor.name}
                  onChange={handleChange}
                  placeholder="Insert Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
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
                  value={supervisor.email}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="Insert Email"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Supervisor ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supervisor ID
                </label>
                <input
                  type="text"
                  name="supervisorId"
                  value={supervisor.supervisorId}
                  onChange={handleChange}
                  placeholder="Supervisor ID"
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
                  value={supervisor.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={supervisor.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Route Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Route Name
                </label>
                <input
                  type="text"
                  name="routeName"
                  value={supervisor.routeName}
                  onChange={handleChange}
                  placeholder="Route Name"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={supervisor.qualification}
                  onChange={handleChange}
                  placeholder="Qualification"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={new Date(supervisor.dob)}
                  format={"yyyy-mm-dd"}
                  onChange={handleChange}
                  placeholder="DOB"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
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
                  Marital Status
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
                  Date of Joining
                </label>
                <input
                  type="date"
                  name="doj"
                  selected={supervisor.doj}
                  //format="mm/dd/yyyy"
                  onChange={handleChange}
                  placeholder="DOJ"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={supervisor.designation}
                  onChange={handleChange}
                  placeholder="Designation"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Salary
                </label>
                <input
                  type="number"
                  name="salary"
                  onChange={handleChange}
                  value={supervisor.salary}
                  placeholder="Salary"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit Supervisor
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
