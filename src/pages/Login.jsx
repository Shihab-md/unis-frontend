import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  getPrcessing,
  showSwalAlert,
} from "../utils/CommonHelper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  // ✅ run once (not every render)
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const handleForgotPass = () => {
    showSwalAlert("Info!", "Please contact HQ Admin!", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const base = await getBaseUrl();
      const response = await axios.post(`${base}auth/login`, {
        email: email.trim(),
        password,
      });

      if (!response.data?.success) {
        // fallback (backend should use HTTP status, but keep safe)
        showSwalAlert("Login failed", response.data?.error || "Login failed", "error");
        setProcessing(false);
        return;
      }

      // ✅ store token + user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("userId", response.data.user._id);

      // optional school info (for HQ roles it can be null)
      if (response.data.user.schoolId) {
        localStorage.setItem("schoolId", response.data.user.schoolId);
      } else {
        localStorage.removeItem("schoolId");
      }

      if (response.data.user.schoolName) {
        localStorage.setItem("schoolName", response.data.user.schoolName);
      } else {
        localStorage.removeItem("schoolName");
      }

      login(response.data.user);
      setProcessing(false);
      navigate("/dashboard");
    } catch (err) {
      setProcessing(false);

      const status = err?.response?.status;
      const apiMessage = err?.response?.data?.error;

      // ✅ New backend behavior: 401 for both wrong email/password
      if (status === 401) {
        showSwalAlert("Login failed", "Invalid email or password.", "error");
        return;
      }

      // Setup issues (not linked to school)
      if (status === 400) {
        showSwalAlert("Login failed", apiMessage || "Invalid request.", "error");
        return;
      }

      // Network error / no response
      if (!err?.response) {
        showSwalAlert("Network error", "Unable to reach server. Please try again.", "error");
        return;
      }

      // Everything else
      showSwalAlert("Error!", apiMessage || "Server error. Please try again later.", "error");
    }
  };

  if (processing) return getPrcessing();

  return (
    <div>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />

      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 h-75 bg-[url(/bg-img.jpg)] bg-fixed bg-cover bg-center bg-repeat">
        <img width={140} className="rounded-md shadow-lg w-34 border" src="/Logo - UNIS.PNG" />
        <p className="p-5 font-bold text-shadow-lg text-indigo-900 text-4xl">UNIS ACADEMY</p>

        <div className="border p-6 w-80 bg-white shadow-lg rounded-lg bg-[url(/bg-img.jpg)]">
          <h2 className="flex text-2xl font-bold mb-4 content-right">Login</h2>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 mt-1 border rounded-md"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 mt-1 border rounded-md"
                placeholder="*****"
                value={password}
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
