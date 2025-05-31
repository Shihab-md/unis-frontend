import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClick, checkAuth } from '../../utils/CommonHelper';
import { getCourses } from '../../utils/CourseHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [formData, setFormData] = useState({});
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("templateAdd") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const getCoursesMap = async (id) => {
      const courses = await getCourses(id);
      setCourses(courses);
    };
    getCoursesMap();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
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

      const url = (await getBaseUrl()).toString() + "template/add";
      const response = await axios.post(url, formDataObj,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          html: "<b>Successfully Added!</b>",
          icon: "success",
          timer: 1600,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        navigate("/dashboard/templates");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        Swal.fire('Error!', error.response.data.error, 'error');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">Enter Template Details</h2>
        <Link to="/dashboard/templates" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Select Course <span className="text-red-700">*</span>
              </label>
              <select
                name="courseId"
                onChange={handleChange}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Details <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="details"
                onChange={handleChange}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Template Upload */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700">
                Upload Template Image<span className="text-red-700">*</span>
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                placeholder="Upload Template"
                required
                accept="image/*"
                className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Add Template
        </button>
      </form>
    </div>
  );
};

export default Add;