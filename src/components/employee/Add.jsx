import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getSchools } from '../../utils/SchoolHelper'
import { getBaseUrl } from '../../utils/CommonHelper'
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  const [formData, setFormData] = useState({});
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchools(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      alert("file found")
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key])
    })

    try {
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const response = await axios.post(
        (await getBaseUrl()).toString() + "employee/add",
        formDataObj,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        alert("Added Successfully...");
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
      <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Enter Staff Details</h2>
          <Link to="/admin-dashboard/employees" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* School */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Select Niswan <span className="text-red-700">*</span>
                </label>
                <select
                  name="schoolId"
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
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Name <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  //  placeholder="Contact Number"
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
                  onChange={handleChange}
                  //  placeholder="Address"
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
                  onChange={handleChange}
                  //      placeholder="DOJ"
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
                  //    placeholder="Salary"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-700">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="******"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                {/* <FileBase64 type="file" name="profileImage" className="mt-1 p-2 block w-full border border-gray-300 rounded-md" multiple={false} onChange={handleChange} onDone={({ base64 }) => setFormData((prevData) => ({ ...prevData, [profileImage]: base64 }))} />                  
            
           <FileBase64 type="file" className="mt-1 p-2 block w-full border border-gray-300 rounded-md" multiple={false} onDone={({ base64 }) => setFormData({ profileImage: base64 })} onChange={(e) => e.target.files[0]} />
           */}

                <input
                  type="file"
                  name="image"
                  //     onChange={handleChange}
                  placeholder="Upload Image"
                  accept="image/*"
                  className="mt-1 mb-5 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
          >
            Add Employee
          </button>
        </form>
      </div>
    </>
  );
};

export default Add;