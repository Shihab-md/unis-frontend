import React, { useEffect, useState } from "react";
import { getSchools } from "../../utils/SchoolHelper";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import {
  FaWindowClose
} from "react-icons/fa";

const Edit = () => {
  const [employee, setEmployee] = useState({
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
    const fetchEmployee = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const employee = responnse.data.employee;
          setEmployee((prev) => ({
            ...prev,
            name: employee.userId.name,
            email: employee.userId.email,
            schoolId: employee.schoolId.nameEnglish,
            employeeId: employee.employeeId,
            contactNumber: employee.contactNumber,
            address: employee.address,
            designation: employee.designation,
            qualification: employee.qualification,
            dob: employee.dob,
            gender: employee.gender,
            maritalStatus: employee.maritalStatus,
            doj: employee.doj,
            salary: employee.salary
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchEmployee();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `https://unis-server.vercel.app/api/employee/${id}`,
        employee,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("Updated Successfully...");
        navigate("/admin-dashboard/employees");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {employee ? (
        <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
          <div className="grid items-center justify-end px-1 py-1">
            <Link to="/admin-dashboard/employees" >
              <FaWindowClose className="text-xl bg-red-700 text-white rounded shadow-md" />
            </Link>
          </div>
          <div className="grid grid-cols-1 mt-2 bg-teal-700 text-white font-bold py-2 px-4 rounded">
            <div><h2 className="grid text-xl font-semibold items-center justify-center">Update Employee Details</h2></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-3 mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={employee.name}
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
                  value={employee.email}
                  onChange={handleChange}
                  disabled={true}
                  //      placeholder="Insert Email"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee ID <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={employee.employeeId}
                  onChange={handleChange}
                  disabled={true}
                  //      placeholder="Employee ID"
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
                  value={employee.contactNumber}
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
                  value={employee.address}
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
                  value={employee.routeName}
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
                  value={employee.qualification}
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
                  value={moment(new Date(employee.dob)).format("YYYY-MM-DD")}
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
                  value={employee.gender}
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
                  value={employee.maritalStatus}
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
                  value={moment(new Date(employee.doj)).format("YYYY-MM-DD")}
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
                  value={employee.salary}
                  //    placeholder="Salary"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Employee
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
