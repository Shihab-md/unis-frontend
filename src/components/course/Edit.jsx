import React, { useEffect, useState } from "react";
import axios from "axios";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Edit = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [processing, setProcessing] = useState(null)
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

    // Authenticate the User.
    if (checkAuth("courseEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchCourse = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `course/${id}`,
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
            type: course.type,
            remarks: course.remarks,
            fees: course.fees,
            years: course.years,

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
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/courses");
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
    setProcessing(true);
    try {
      const response = await axios.put(
        (await getBaseUrl()).toString() + `course/${id}`,
        course,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
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
    <>
      {course ? (
        <div className="max-w-4xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Course Details</h2>
            <Link to="/dashboard/courses" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4 gap-y-7">

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-500">
                    Education Type <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="type"
                    onChange={handleChange}
                    value={course.type}
                    disabled={true}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Education Type</option>
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
                  <label className="block text-sm font-medium text-slate-500">
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
                  <label className="block text-sm font-medium text-slate-500">
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
                  <label className="block text-sm font-medium text-slate-500">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-7">
                  {/* Fees */}
                  <div>
                    <label className="block text-sm font-medium text-slate-500">
                      Fees <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="number"
                      name="fees"
                      value={course.fees}
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
                      value={course.years}
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
                    value={course.subject1}
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
                      value={course.subject1MaxMark}
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
                      value={course.subject1PassMark}
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
                    value={course.subject2}
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
                      value={course.subject2MaxMark}
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
                      value={course.subject2PassMark}
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
                    value={course.subject3}
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
                      value={course.subject3MaxMark}
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
                      value={course.subject3PassMark}
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
                    value={course.subject4}
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
                      value={course.subject4MaxMark}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //  required
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
                      value={course.subject4PassMark}
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
                    value={course.subject5}
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
                      value={course.subject5MaxMark}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
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
                      value={course.subject5PassMark}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    //    required
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
                    value={course.subject6}
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
                      value={course.subject6MaxMark}
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
                      value={course.subject6PassMark}
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
                    value={course.subject7}
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
                      value={course.subject7MaxMark}
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
                      value={course.subject7PassMark}
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
                    value={course.subject8}
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
                      value={course.subject8MaxMark}
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
                      value={course.subject8PassMark}
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
                    value={course.subject9}
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
                      value={course.subject9MaxMark}
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
                      value={course.subject9PassMark}
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
                    value={course.subject10}
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
                      value={course.subject10MaxMark}
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
                      value={course.subject10PassMark}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 mb-3 p-2 block w-full border border-gray-300 rounded-md"
                    //  required
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Course
            </button>
          </form>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default Edit;
