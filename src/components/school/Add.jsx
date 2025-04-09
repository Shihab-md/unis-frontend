import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const Add = () => {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key])
    })

    try {
      const response = await axios.post(
        "https://unis-server.vercel.app/api/school/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        navigate("/admin-dashboard/schools");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }

  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-5 rounded-md shadow-md">
      <div className="w-full mt-6 bg-teal-700 text-white font-bold py-2 px-4 rounded">
        <h2 className="text-xl font-bold text-center">Add Niswan</h2>
        <Link to="/admin-dashboard/schools" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded" />
        </Link>
      </div>

      <div className="grid grid-cols-2 mt-6 bg-teal-700 text-white font-bold py-2 px-4 rounded">
        <div> <h2 className="text-xl font-bold text-center">Add Niswan</h2></div>
        <div className="text-right align-right">
          <Link to="/admin-dashboard/schools" >
            <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded text-right alignment-right" />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3 mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              type="text"
              name="code"
              onChange={handleChange}
              placeholder=""
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Name English*/}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name in English
            </label>
            <input
              type="text"
              name="nameEnglish"
              onChange={handleChange}
              placeholder=""
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Name Arabic*/}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name in Arabic
            </label>
            <input
              type="text"
              name="nameArabic"
              onChange={handleChange}
              placeholder=""
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //  required
            />
          </div>

          {/* Name Native*/}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name in Native
            </label>
            <input
              type="text"
              name="nameNative"
              onChange={handleChange}
              placeholder=""
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //  required
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Area
            </label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              // placeholder="Insert Address"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* District / State */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              District / State
            </label>
            <input
              type="text"
              name="district"
              onChange={handleChange}
              //  placeholder="Insert District / State"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="number"
              name="contactNumber"
              onChange={handleChange}
              //  placeholder="Insert Contact Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              //  placeholder="Insert Email"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          <div className="flex space-x-3 mb-5" />
          <div className="flex space-x-3 mb-5" />

          {/* Active */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Active
            </label>
            <select
              name="active"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            >
              <option value="">Select</option>
              <option value="Active">Active</option>
              <option value="In-Active">In-Active</option>
            </select>
          </div>

          {/* Supervisor Id */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supervisor Id
            </label>
            <input
              type="text"
              name="supervisorId"
              onChange={handleChange}
              //  placeholder="Incharge1 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex space-x-3 mb-5" />
          <div className="flex space-x-3 mb-5" />

          {/* Incharge1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-1 Name
            </label>
            <input
              type="text"
              name="incharge1"
              onChange={handleChange}
              //  placeholder="Incharge1 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Incharge1 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-1 Number
            </label>
            <input
              type="number"
              name="incharge1Number"
              onChange={handleChange}
              //  placeholder="Incharge1 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Incharge2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-2 Name
            </label>
            <input
              type="text"
              name="incharge2"
              onChange={handleChange}
              //  placeholder="Incharge2 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge2 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-2 Number
            </label>
            <input
              type="number"
              name="incharge2Number"
              onChange={handleChange}
              //  placeholder="Incharge2 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-3 Name
            </label>
            <input
              type="text"
              name="incharge3"
              onChange={handleChange}
              //  placeholder="Incharge3 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge3 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-3 Number
            </label>
            <input
              type="number"
              name="incharge3Number"
              onChange={handleChange}
              //  placeholder="Incharge3 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-4 Name
            </label>
            <input
              type="text"
              name="incharge4"
              onChange={handleChange}
              //  placeholder="Incharge4 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge4 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-4 Number
            </label>
            <input
              type="number"
              name="incharge4Number"
              onChange={handleChange}
              //  placeholder="Incharge4 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge5 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-5 Name
            </label>
            <input
              type="text"
              name="incharge5"
              onChange={handleChange}
              //  placeholder="Incharge5 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge5 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-5 Number
            </label>
            <input
              type="number"
              name="incharge5Number"
              onChange={handleChange}
              //  placeholder="Incharge5 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge6 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-6 Name
            </label>
            <input
              type="text"
              name="incharge6"
              onChange={handleChange}
              //  placeholder="Incharge5 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge6 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-6 Number
            </label>
            <input
              type="number"
              name="incharge6Number"
              onChange={handleChange}
              //  placeholder="Incharge5 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge7 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-7 Name
            </label>
            <input
              type="text"
              name="incharge7"
              onChange={handleChange}
              //  placeholder="Incharge5 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge7 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge-7 Number
            </label>
            <input
              type="number"
              name="incharge7Number"
              onChange={handleChange}
              //  placeholder="Incharge5 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          <button
            data-ripple-light="true"
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate(`/admin-dashboard/schools`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            data-ripple-light="true"
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Niswan
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
