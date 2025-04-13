import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaWindowClose
} from "react-icons/fa";

const Edit = () => {
  const [course, setCourse] = useState({
    name: "",
    remarks: "",
    subject1: "",
    subject1MaxMark: "",
    subject1PassMark: "",
    subject2: "",
    subject2MaxMark: "",
    subject2PassMark: "",
    subject3: "",
    subject3MaxMark: "",
    subject3PassMark: "",
    subject4: "",
    subject4MaxMark: "",
    subject4PassMark: "",
    subject5: "",
    subject5MaxMark: "",
    subject5PassMark: "",
    subject6: "",
    subject6MaxMark: "",
    subject6PassMark: "",
    subject7: "",
    subject7MaxMark: "",
    subject7PassMark: "",
    subject8: "",
    subject8MaxMark: "",
    subject8PassMark: "",
    subject9: "",
    subject9MaxMark: "",
    subject9PassMark: "",
    subject10: "",
    subject10MaxMark: "",
    subject10PassMark: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/course/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const course = responnse.data.course;
          setCourse((prev) => ({
            ...prev,
            code: course.code,
            name: course.name,
            remarks: course.remarks,

            subject1: course.subject1,
            subject1MaxMark: course.subject1MaxMark,
            subject1PassMark: course.subject1PassMark,
            subject2: course.subject2,
            subject2MaxMark: course.subject2MaxMark,
            subject2PassMark: course.subject2PassMark,
            subject3: course.subject3,
            subject3MaxMark: course.subject3MaxMark,
            subject3PassMark: course.subject3PassMark,
            subject4: course.subject4,
            subject4MaxMark: course.subject4MaxMark,
            subject4PassMark: course.subject4PassMark,
            subject5: course.subject5,
            subject5MaxMark: course.subject5MaxMark,
            subject5PassMark: course.subject5PassMark,
            subject6: course.subject6,
            subject6MaxMark: course.subject6MaxMark,
            subject6PassMark: course.subject6PassMark,
            subject7: course.subject7,
            subject7MaxMark: course.subject7MaxMark,
            subject7PassMark: course.subject7PassMark,
            subject8: course.subject8,
            subject8MaxMark: course.subject8MaxMark,
            subject8PassMark: course.subject8PassMark,
            subject9: course.subject9,
            subject9MaxMark: course.subject9MaxMark,
            subject9PassMark: course.subject9PassMark,
            subject10: course.subject10,
            subject10MaxMark: course.subject10MaxMark,
            subject10PassMark: course.subject10PassMark,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchCourse();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `https://unis-server.vercel.app/api/course/${id}`,
        course,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("Updated Successfully...");
        navigate("/admin-dashboard/courses");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {course ? (
        <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
          <div className="grid items-center justify-end px-1 py-1">
            <Link to="/admin-dashboard/courses" >
              <FaWindowClose className="text-xl bg-red-700 text-white rounded shadow-md" />
            </Link>
          </div>
          <div className="grid grid-cols-1 mt-2 bg-teal-700 text-white font-bold py-2 px-4 rounded">
            <div><h2 className="grid text-xl font-semibold items-center justify-center">Update Course Details</h2></div>
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
                  value={course.code}
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
                  value={course.name}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Remarks <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={course.remarks}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                // required
                />
              </div>

              {/* Subject-1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-1 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="subject1"
                  value={course.subject1}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-1 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-1 Max Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject1MaxMark"
                  value={course.subject1MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-1 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-1 Pass Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject1PassMark"
                  value={course.subject1PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-2 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="subject2"
                  value={course.subject2}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-2 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-2 Max Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject2MaxMark"
                  value={course.subject2MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-2 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-2 Pass Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject2PassMark"
                  value={course.subject2PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-3 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="subject3"
                  value={course.subject3}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-3 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-3 Max Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject3MaxMark"
                  value={course.subject3MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-3 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-3 Pass Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject3PassMark"
                  value={course.subject3PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-4 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="subject4"
                  value={course.subject4}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-4 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-4 Max Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject4MaxMark"
                  value={course.subject4MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-4 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-4 Pass Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject4PassMark"
                  value={course.subject4PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-5 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="subject5"
                  value={course.subject5}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-5 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-5 Max Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject5MaxMark"
                  value={course.subject5MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-5 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-5 Pass Marks <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject5PassMark"
                  value={course.subject5PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-6 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-6
                </label>
                <input
                  type="text"
                  name="subject6"
                  value={course.subject6}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-6 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-6 Max Marks
                </label>
                <input
                  type="number"
                  name="subject6MaxMark"
                  value={course.subject6MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-6 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-6 Pass Marks
                </label>
                <input
                  type="number"
                  name="subject6PassMark"
                  value={course.subject6PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-7 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-7
                </label>
                <input
                  type="text"
                  name="subject7"
                  value={course.subject7}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-7 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-7 Max Marks
                </label>
                <input
                  type="number"
                  name="subject7MaxMark"
                  value={course.subject7MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-7 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-7 Pass Marks
                </label>
                <input
                  type="number"
                  name="subject7PassMark"
                  value={course.subject7PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-8 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-8
                </label>
                <input
                  type="text"
                  name="subject8"
                  value={course.subject8}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-8 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-8 Max Marks
                </label>
                <input
                  type="number"
                  name="subject8MaxMark"
                  value={course.subject8MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-8 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-8 Pass Marks
                </label>
                <input
                  type="number"
                  name="subject8PassMark"
                  value={course.subject8PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-9 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-9
                </label>
                <input
                  type="text"
                  name="subject9"
                  value={course.subject9}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-9 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-9 Max Marks
                </label>
                <input
                  type="number"
                  name="subject9MaxMark"
                  value={course.subject9MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-9 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-9 Pass Marks
                </label>
                <input
                  type="number"
                  name="subject9PassMark"
                  value={course.subject9PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-10 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-10
                </label>
                <input
                  type="text"
                  name="subject10"
                  value={course.subject10}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-10 Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-10 Max Marks
                </label>
                <input
                  type="number"
                  name="subject10MaxMark"
                  value={course.subject10MaxMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-10 Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject-10 Pass Marks
                </label>
                <input
                  type="number"
                  name="subject10PassMark"
                  value={course.subject10PassMark}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Course
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
