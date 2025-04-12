import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaArrowAltCircleRight,
} from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {

    e.preventDefault();
    try {
      const response = await axios.post(
        "https://unis-server.vercel.app/api/auth/login",
        { email, password }
      );
      if (response.data.success) {
        login(response.data.user)
        localStorage.setItem("token", response.data.token)
        if (response.data.user.role === "admin") {
          navigate('/admin-dashboard')
        } else {
          navigate("/employee-dashboard")
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error)
      } else {
        setError("Server Error")
      }
    }
  };

  return (
    <div>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <div
        className="flex flex-col items-center h-screen justify-center 
      bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6 h-75"
      >
        <img width={140} className='rounded-md shadow w-34' src="./Logo - UNIS.PNG" />
        <h2 className="p-5 font-bold text-4xl">
          UNIS ACADEMY
        </h2>
        <div className="border shadow p-6 w-80 bg-white">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border"
                placeholder="Enter Email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border"
                placeholder="*****"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-teal-600">
                Forgot password?
              </a>
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="flex w-full bg-teal-600 text-white py-2 items-center justify-center"
              >
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْم <span><FaArrowAltCircleRight classname="text-bold justify-end" /></span>
              </button>

              <div className="rounded flex bg-teal-600 border">
                <div className="pl-4 py-1">
                  <p className="text-lg font-bold">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْم </p>
                </div>

                <div className={`text-3xl flex justify-center items-center text-white px-4`}>
                <FaArrowAltCircleRight classname="text-bold justify-end" />
                </div>

              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
