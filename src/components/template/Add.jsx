import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import { getCoursesFromCache } from '../../utils/CourseHelper';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [formData, setFormData] = useState({});
  const [courses, setCourses] = useState([]);
  const [processing, setProcessing] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("templateAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const getCoursesMap = async (id) => {
      const courses = await getCoursesFromCache(id);
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
    setProcessing(true);

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
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/templates");
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="max-w-4xl mx-auto mt-2 p-5 shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">Enter Template Details</h2>
        <Link to="/dashboard/templates" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Select Course <span className="text-red-700">*</span>
              </label>
              <select
                name="courseId"
                onChange={handleChange}
                className="mt-2 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                {courses.filter(course => course.type === "Deeniyath Education"
                  || course.type === "Islamic Home Science"
                  || course.type === "Teacher Training").map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block text-sm font-medium text-slate-500">
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