import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSupervisors } from '../../utils/SupervisorHelper';
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClick, checkAuth } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  //document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });
  
  const [supervisors, setSupervisors] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate()

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("schoolAdd") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }
  });

  useEffect(() => {
    const getSupervisorsMap = async (id) => {
      const supervisors = await getSupervisors(id);
      setSupervisors(supervisors);
    };
    getSupervisorsMap();
  }, []);

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
        (await getBaseUrl()).toString() + "school/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          html: "<b>Successfully Added!</b>",
          icon: "success",
          timer: 1600,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        navigate("/dashboard/schools");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        Swal.fire('Error!', error.response.data.error, 'error');
      }
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md content-center shadow-md">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Enter Niswan Details</h2>
          <Link to="/dashboard/schools" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Code <span className="text-red-700">*</span>
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
                <label className="block mt-2 text-sm font-medium text-gray-700">
                  Name in English <span className="text-red-700">*</span>
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

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-700">*</span>
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

              {/* District - State */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  District & State <span className="text-red-700">*</span>
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
                  Active <span className="text-red-700">*</span>
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
                  Select Supervisor <span className="text-red-700">*</span>
                </label>
                <select
                  name="supervisorId"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Supervisor</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor._id} value={supervisor._id}>
                      {supervisor.supervisorId + " : " + supervisor.userId.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
              <label className="block text-sm font-medium text-gray-700">
                Supervisor Id <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="supervisorId"
                onChange={handleChange}
                //  placeholder="Incharge1 Name"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>*/}

              <div className="flex space-x-3 mb-5" />
              <div className="flex space-x-3 mb-5" />

              {/* Incharge1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Incharge-1 Name <span className="text-red-700">*</span>
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
                  Incharge-1 Number <span className="text-red-700">*</span>
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
                  className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
                //required
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            data-ripple-light="true"
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
          >
            Add Niswan
          </button>
        </form>
      </div>
    </>
  );
};

export default Add;
