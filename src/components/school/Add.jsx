import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New School</h2>
      <form onSubmit={handleSubmit}>
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
              placeholder="Insert Code"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              placeholder="Insert Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              placeholder="Insert Address"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* District / State */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="district"
              onChange={handleChange}
              placeholder="Insert District / State"
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
              placeholder="Insert Contact Number"
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
              placeholder="Insert Email"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

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

          {/* Incharge1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge1 Name
            </label>
            <input
              type="text"
              name="incharge1"
              onChange={handleChange}
              placeholder="Incharge1 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Incharge1 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge1 Number
            </label>
            <input
              type="number"
              name="incharge1Number"
              onChange={handleChange}
              placeholder="Incharge1 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Incharge2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge2 Name
            </label>
            <input
              type="text"
              name="incharge2"
              onChange={handleChange}
              placeholder="Incharge2 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge2 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge2 Number
            </label>
            <input
              type="number"
              name="incharge2Number"
              onChange={handleChange}
              placeholder="Incharge2 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge3 Name
            </label>
            <input
              type="text"
              name="incharge3"
              onChange={handleChange}
              placeholder="Incharge3 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge3 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge3 Number
            </label>
            <input
              type="number"
              name="incharge3Number"
              onChange={handleChange}
              placeholder="Incharge3 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge4 Name
            </label>
            <input
              type="text"
              name="incharge4"
              onChange={handleChange}
              placeholder="Incharge4 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge4 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge4 Number
            </label>
            <input
              type="number"
              name="incharge4Number"
              onChange={handleChange}
              placeholder="Incharge4 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge5 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge5 Name
            </label>
            <input
              type="text"
              name="incharge5"
              onChange={handleChange}
              placeholder="Incharge5 Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>

          {/* Incharge5 Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incharge5 Number
            </label>
            <input
              type="number"
              name="incharge5Number"
              onChange={handleChange}
              placeholder="Incharge5 Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            //required
            />
          </div>
        </div>
        <button
          type="submit"
          data-ripple-light="true"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
        >
          Add School
        </button>
      </form>
    </div>
  );
};

export default Add;
