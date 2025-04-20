import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
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
          setStudent(responnse.data.student);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchStudent();
  }, []);
  return (
    <>
      {student ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Student Details</h2>
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
                  <p className="font-medium">Niswan Name:</p>
                  <p className="font-normal">{student.schoolId.nameEnglish}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Roll Number:</p>
                  <p className="font-normal">{student.rollNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name:</p>
                  <p className="font-normal">{student.userId.name}</p>
                </div>
                
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Addmission:</p>
                  <p className="font-normal">{new Date(student.doa).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Date of Birth:</p>
                  <p className="font-normal">{new Date(student.dob).toLocaleDateString()}</p>
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
                  <p className="font-medium">Blood Group:</p>
                  <p className="font-normal">{student.bloodGroup}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Identification Mark 1:</p>
                  <p className="font-normal">{student.idMark1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Identification Mark 2:</p>
                  <p className="font-normal">{student.idMark2}</p>
                </div>

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Father's Name:</p>
                  <p className="font-normal">{student.fatherName}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Father's Number:</p>
                  <p className="font-normal">{student.fatherNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Father's Occupation:</p>
                  <p className="font-normal">{student.fatherOccupation}</p>
                </div>

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Mother's Name:</p>
                  <p className="font-normal">{student.motherName}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Mother's Number:</p>
                  <p className="font-normal">{student.motherNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Mother's Occupation:</p>
                  <p className="font-normal">{student.motherOccupation}</p>
                </div>

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Guardian's Name:</p>
                  <p className="font-normal">{student.guardianName}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Guardian's Number:</p>
                  <p className="font-normal">{student.guardianNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Guardian's Occupation:</p>
                  <p className="font-normal">{student.guardianOccupation}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Guardian's Relationship:</p>
                  <p className="font-normal">{student.guardianRelation}</p>
                </div>



                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Address:</p>
                  <p className="font-normal">{student.address}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">State / District:</p>
                  <p className="font-normal">{student.district}</p>
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
