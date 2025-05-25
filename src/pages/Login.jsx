import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClick } from '../utils/CommonHelper';
import Swal from 'sweetalert2';
import { 
  FaArrowAltCircleRight,
} from "react-icons/fa";

const Login = () => {
  // To prevent right-click.
    document.addEventListener('contextmenu', handleRightClick);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {

    e.preventDefault();
    try {
      const response = await axios.post(
        (await getBaseUrl()).toString() + "auth/login",
        { email, password }
      );
      if (response.data.success) {
        login(response.data.user)
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("role", response.data.user.role)
        if (response.data.user.role === "superadmin" || response.data.user.role === "hquser") {
          navigate('/admin-dashboard')

        } else if (response.data.user.role === "admin") {
          navigate('/admin-dashboard')

        } else if (response.data.user.role === "supervisor") {
          navigate('/admin-dashboard')
          // navigate('/supervisor-dashboard')

        } else if (response.data.user.role === "teacher") {
          navigate('/admin-dashboard')
          // navigate('/teacher-dashboard')

        } else if (response.data.user.role === "student") {
          navigate('/admin-dashboard')
          //navigate('/student-dashboard')

        } else if (response.data.user.role === "parent") {
          navigate('/parent-dashboard')

        } else {
          alert("Login Expired OR Failed.")
          navigate("/login")
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        Swal.fire('Error!', error.response.data.error, 'error');
        setError(error.response.data.error)
      } else {
        Swal.fire('Error!', 'Server Error', 'error');
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
        <img width={140} className='rounded-md shadow-lg w-34' src="./Logo - UNIS.PNG" />
        <h2 className="p-5 font-bold text-4xl text-shadow-lg">
          UNIS ACADEMY
        </h2>
        <div className="border p-6 w-80 bg-white shadow-lg rounded-lg">
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
            <div className="mb-5">
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
            <div className="mb-5 flex items-center justify-between">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-teal-600">
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

              {/*   <div className="rounded flex bg-teal-600 border">
              <Link type="submit" >
                <div className="py-2 px-6 justify-end items-center">
                  <p className="text-white justify-end">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْم </p>
                </div>

                <div className="text-2xl flex justify-end items-center text-white px-5">
                  <FaArrowAltCircleRight classname="text-bold justify-end" />
                </div>
              </Link>*/}
            </div>


          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
