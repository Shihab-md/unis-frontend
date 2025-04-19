import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  const { id } = useParams();
  const [student, setSudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSudent = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/student/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setSudent(responnse.data.student);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchSudent();
  }, []);
  return (
    <>
      {student ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Staff Details</h2>
            <Link to="/admin-dashboard/students" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">
              <div className="flex space-x-3 mb-5" />
              <div>
                <img
                  src={`https://unis-server.vercel.app/${student.userId.profileImage}`}
                  className="rounded-full border w-72"
                />
              </div>
              <div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name:</p>
                  <p className="font-normal">{student.userId.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Email:</p>
                  <p className="font-normal">{student.userId.email}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Sudent ID:</p>
                  <p className="font-normal">{student.studentId}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Niswan Name:</p>
                  <p className="font-normal">{student.schoolId.nameEnglish}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Contact Number:</p>
                  <p className="font-normal">{student.contactNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Address:</p>
                  <p className="font-normal">{student.address}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Designation:</p>
                  <p className="font-normal">{student.designation}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Qualification:</p>
                  <p className="font-normal">{student.qualification}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Birth:</p>
                  <p className="font-normal">
                    {new Date(student.dob).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Gender:</p>
                  <p className="font-normal">{student.gender}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Marital Status:</p>
                  <p className="font-normal">{student.maritalStatus}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Joining:</p>
                  <p className="font-normal">
                    {new Date(student.doj).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Salary:</p>
                  <p className="font-normal">{student.salary}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/admin-dashboard/students`)}
          >  Back
          </button>
        </div>
      ) : (
        <div> Loading ....</div>
      )}
    </>
  );
};

export default View;
