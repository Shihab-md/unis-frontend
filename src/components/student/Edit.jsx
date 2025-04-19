import React, { useEffect, useState } from "react";
import { getSchools } from "../../utils/SchoolHelper";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Edit = () => {
  const [student, setSudent] = useState({
    name: "",
    email: "",
    role: "",
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
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchools(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const fetchSudent = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/student/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const student = responnse.data.student;
          setSudent((prev) => ({
            ...prev,
            name: student.userId.name,
            email: student.userId.email,
            role: student.userId.role,
            schoolId: student.schoolId._id,
            studentId: student.studentId,
            contactNumber: student.contactNumber,
            address: student.address,
            designation: student.designation,
            qualification: student.qualification,
            dob: student.dob,
            gender: student.gender,
            maritalStatus: student.maritalStatus,
            doj: student.doj,
            salary: student.salary
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchSudent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSudent((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `https://unis-server.vercel.app/api/student/${id}`,
        student,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("Updated Successfully...");
        navigate("/admin-dashboard/students");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {student ? (
        <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Staff Details</h2>
            <Link to="/admin-dashboard/students" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">

                {/* School */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Niswan <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="schoolId"
                    value={student.schoolId}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Niswan</option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={student.name}
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
                    value={student.email}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Insert Email"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Sudent ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sudent ID <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={student.studentId}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Sudent ID"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="role"
                    value={student.role}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={student.contactNumber}
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
                    value={student.address}
                    onChange={handleChange}
                    //    placeholder="Address"
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
                    value={student.designation}
                    onChange={handleChange}
                    //  placeholder="Route Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
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
                    value={student.qualification}
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
                    value={moment(new Date(student.dob)).format("YYYY-MM-DD")}
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
                    value={student.gender}
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
                    value={student.maritalStatus}
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
                    value={moment(new Date(student.doj)).format("YYYY-MM-DD")}
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
                    value={student.salary}
                    //    placeholder="Salary"
                    className="mt-1 mb-3 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Sudent
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
