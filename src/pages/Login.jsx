import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getPrcessing } from '../utils/CommonHelper';
import Swal from 'sweetalert2';

const Login = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  // To prevent right-click
  //document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  //document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(null)

  const handleForgotPass = async (e) => {
    Swal.fire('', 'Please contact HQ Admin.', 'info')
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await axios.post(
        (await getBaseUrl()).toString() + "auth/login",
        { email, password }
      );
      if (response.data.success) {
        setProcessing(false);
        login(response.data.user)
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);

        if (!(response.data.user.role === "superadmin"
          || response.data.user.role === "hquser"
          || response.data.user.role === "supervisor")) {
          //  alert(response.data.user.schoolId)
          //  alert(response.data.user.schoolName)
          localStorage.setItem('schoolId', response.data.user.schoolId);
          localStorage.setItem('schoolName', response.data.user.schoolName);
        }

        if (response.data.user && response.data.user.role) {
          navigate('/dashboard')

        } else {
          Swal.fire('Error!', 'Server Error', 'error');
          navigate("/login")
        }
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        Swal.fire('Error!', 'Server is busy : Please try after sometime.', 'error');
        setError(error.response.data.error)
      } else {
        Swal.fire('Error!', 'Server Error', 'error');
        setError("Server Error")
      }
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <div>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      {/*<div
        className="flex flex-col items-center h-screen justify-center 
      bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6 h-75 bg-[url(/bg-img.jpg)] bg-fixed bg-cover bg-center bg-repeat"
      >*/}
      <div
        className="flex flex-col items-center justify-center min-h-screen
       space-y-6 h-75 bg-[url(/bg-img.jpg)] bg-fixed bg-cover bg-center bg-repeat"
      >
        <img width={140} className='rounded-md shadow-lg w-34 border' src="/Logo - UNIS.PNG" />
        <p className="p-5 font-bold text-shadow-lg text-indigo-900 text-4xl">
          UNIS ACADEMY
        </p>
        <div className="border p-6 w-80 bg-white shadow-lg rounded-lg bg-[url(/bg-img.jpg)]">
          <h2 className="flex text-2xl font-bold mb-4 content-right">Login</h2>
          {/* {error && <p className="text-red-500">{error}</p>}*/}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 mt-1 border rounded-md"
                placeholder="Enter Email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="block text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 mt-1 border rounded-md"
                placeholder="*****"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-5 flex items-center justify-between">
              <a href="#" onClick={handleForgotPass} className="text-yellow-700">
                Forgot password?
              </a>
            </div>
            <div className="mb-3">
              <button
                type="submit"
                className="flex w-full bg-teal-600 text-white py-2 items-center justify-center rounded-lg shadow-xl hover:bg-teal-700"
              >
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْم
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
