import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  const [course, setCourse] = useState({
    code: "",
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

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://unis-server.vercel.app/api/course/add', course, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.data.success) {
        alert("Added Successfully...");
        navigate("/admin-dashboard/courses");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">Enter Course Details</h2>
        <Link to="/admin-dashboard/supervisors" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
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
              onChange={handleChange}
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
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            // required
            />
          </div>

          <div className="flex space-x-3 mb-5" />

          {/* Subject-1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-1 <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="subject1"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-1 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject1MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Subject-1 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject1PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Subject-2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-2 <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="subject2"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-2 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject2MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Subject-2 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject2PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Subject-3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-3 <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="subject3"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-3 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject3MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Subject-3 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject3PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Subject-4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-4 <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="subject4"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-4 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject4MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Subject-4 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject4PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Subject-5 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-5 <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="subject5"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-5 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject5MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Subject-5 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="subject5PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Subject-6 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-6
            </label>
            <input
              type="text"
              name="subject6"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //  required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-6 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks
              </label>
              <input
                type="number"
                name="subject6MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>

            {/* Subject-6 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks
              </label>
              <input
                type="number"
                name="subject6PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>
          </div>

          {/* Subject-7 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-7
            </label>
            <input
              type="text"
              name="subject7"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //  required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-7 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks
              </label>
              <input
                type="number"
                name="subject7MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>

            {/* Subject-7 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks
              </label>
              <input
                type="number"
                name="subject7PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>
          </div>

          {/* Subject-8 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-8
            </label>
            <input
              type="text"
              name="subject8"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //  required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-8 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks
              </label>
              <input
                type="number"
                name="subject8MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>

            {/* Subject-8 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks
              </label>
              <input
                type="number"
                name="subject8PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>
          </div>

          {/* Subject-9 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-9
            </label>
            <input
              type="text"
              name="subject9"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //  required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-9 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks
              </label>
              <input
                type="number"
                name="subject9MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>

            {/* Subject-9 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks
              </label>
              <input
                type="number"
                name="subject9PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>
          </div>

          {/* Subject-10 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject-10
            </label>
            <input
              type="text"
              name="subject10"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //  required
            />
          </div>

          <div className="grid grid-cols-2 gap-7 justify-between">
            {/* Subject-10 Max Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Marks
              </label>
              <input
                type="number"
                name="subject10MaxMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>

            {/* Subject-10 Pass Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pass Marks
              </label>
              <input
                type="number"
                name="subject10PassMark"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Course
        </button>
      </form>
    </div>
  );
};

export default Add;