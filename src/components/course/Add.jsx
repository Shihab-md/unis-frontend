import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [processing, setProcessing] = useState(null)
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

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("courseAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await axios.post((await getBaseUrl()).toString() + 'course/add', course, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/courses");
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
        <h2 className="text-xl font-semibold items-center justify-center">Enter Course Details</h2>
        <Link to="/dashboard/courses" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-7">

            {/* Type */}
            <div>
              <label className="block mt-5 text-sm font-medium text-slate-500">
                Education Type <span className="text-red-700">*</span>
              </label>
              <select
                name="type"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                <option value="Deeniyath Education">Deeniyath Education</option>
                <option value="School Education">School Education</option>
                <option value="College Education">College Education</option>
                <option value="Islamic Home Science">Islamic Home Science</option>
                <option value="Teacher Training">Teacher Training</option>
                <option value="Vocational Courses">Vocational Courses</option>
              </select>
            </div>

            <div className="hidden lg:block flex space-x-3 mb-5" />

            {/* Code */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block text-sm font-medium text-slate-500">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-7">
              {/* Fees */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Fees <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="fees"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Years */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Years <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="years"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 mb-5" />
            <div className="hidden lg:block flex space-x-3 mb-5" />

            {/* Subject-1 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
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
              {/* Subject-1 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject1MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Subject-1 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  name="subject1PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Subject-2 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
                Subject-2
              </label>
              <input
                type="text"
                name="subject2"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //    required
              />
            </div>

            <div className="grid grid-cols-2 gap-7 justify-between">
              {/* Subject-2 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject2MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Subject-2 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject2PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>
            </div>

            {/* Subject-3 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
                Subject-3
              </label>
              <input
                type="text"
                name="subject3"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //    required
              />
            </div>

            <div className="grid grid-cols-2 gap-7 justify-between">
              {/* Subject-3 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject3MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>

              {/* Subject-3 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject3PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //    required
                />
              </div>
            </div>

            {/* Subject-4 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
                Subject-4
              </label>
              <input
                type="text"
                name="subject4"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //  required
              />
            </div>

            <div className="grid grid-cols-2 gap-7 justify-between">
              {/* Subject-4 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject4MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //   required
                />
              </div>

              {/* Subject-4 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject4PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>

            {/* Subject-5 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
                Subject-5
              </label>
              <input
                type="text"
                name="subject5"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              //   required
              />
            </div>

            <div className="grid grid-cols-2 gap-7 justify-between">
              {/* Subject-5 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject5MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-5 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject5PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //   required
                />
              </div>
            </div>

            {/* Subject-6 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
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
              {/* Subject-6 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject6MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-6 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject6PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>

            {/* Subject-7 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
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
              {/* Subject-7 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject7MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-7 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject7PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>

            {/* Subject-8 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
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
              {/* Subject-8 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject8MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-8 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject8PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>

            {/* Subject-9 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
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
              {/* Subject-9 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject9MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-9 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject9PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>

            {/* Subject-10 */}
            <div>
              <label className="block text-sm font-medium text-slate-500">
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
              {/* Subject-10 Max Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Max Mark
                </label>
                <input
                  type="number"
                  name="subject10MaxMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>

              {/* Subject-10 Pass Mark */}
              <div>
                <label className="block text-sm font-medium text-slate-500">
                  Pass Mark
                </label>
                <input
                  type="number"
                  name="subject10PassMark"
                  onChange={handleChange}
                  min="0"
                  className="mt-1 mb-5 p-2 block w-full border border-gray-300 rounded-md"
                //  required
                />
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Add Course
        </button>
      </form>
    </div>
  );
};

export default Add;