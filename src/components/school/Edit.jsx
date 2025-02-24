import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const Edit = () => {
  const [school, setSchool] = useState({
    code: "",
    name: "",
    address: "",
    email: "",
    active: "",
    incharge1: "",
    incharge2: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/school/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const school = responnse.data.school;
          setSchool((prev) => ({
            ...prev,
            code: school.code,
            name: school.name,
            address: school.address,
            contactNumber: school.contactNumber,
            email: school.email,
            active: school.active,
            incharge1: school.incharge1,
            incharge1Number: school.incharge1Number,
            incharge2: school.incharge2,
            incharge2Number: school.incharge2Number,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchSchool();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchool((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `https://unis-server.vercel.app/api/school/${id}`,
        school,
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
    <>
      {school ? (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-6">Update School</h2>
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
                  value={school.code}
                  contentEditable="false"
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
                  value={school.name}
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
                  value={school.address}
                  onChange={handleChange}
                  placeholder="Insert Address"
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
                  type="text"
                  name="contactNumber"
                  value={school.contactNumber}
                  onChange={handleChange}
                  placeholder="Insert Contact Number"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
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
                  value={school.email}
                  onChange={handleChange}
                  placeholder="Insert Email"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Active */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Active
                </label>
                <select
                  name="active"
                  value={school.active}
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
                  value={school.incharge1}
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
                  value={school.incharge1Number}
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
                  value={school.incharge2}
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
                  value={school.incharge2Number}
                  onChange={handleChange}
                  placeholder="Incharge2 Number"
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
              Update School
            </button>
          </form>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default Edit;
