import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getBaseUrl, handleRightClickAndFullScreen, getPrcessing } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Setting = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [processing, setProcessing] = useState(null)
  const navigate = useNavigate();
  const { user } = useAuth()
  const [setting, setSetting] = useState({
    userId: user._id,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSetting({ ...setting, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (setting.newPassword !== setting.confirmPassword) {
      setError("New Password and Confirm Password are not matched");
    } else {
      setProcessing(true);
      try {
        const response = await axios.put(
          (await getBaseUrl()).toString() + "setting/change-password",
          setting,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.success) {
          setProcessing(false);
          Swal.fire({
            title: "Success!",
            html: "<b>Password changed Successfully...!</b>",
            icon: "success",
            timer: 1600,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          navigate("/dashboard");
          setError("")
        }
      } catch (error) {
        setProcessing(false);
        if (error.response && !error.response.data.success) {
          setError(error.response.data.error)
          Swal.fire('Error!', error.response.data.error, 'error');
        }
      }
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-7 rounded-md shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">Change Password</h2>
        <Link to="/dashboard" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>
      {/*  <p className="text-red-500">{error}</p> */}
      <form onSubmit={handleSubmit}>
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">

          {/* Old Password */}
          <div className="mt-5">
            <label className="text-sm font-medium text-gray-700">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Old Password"
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* New Password */}
          <div className="mt-5">
            <label className="text-sm mt-5 font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mt-5 mb-5">
            <label className="text-sm mt-5 mb-5 font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default Setting;
