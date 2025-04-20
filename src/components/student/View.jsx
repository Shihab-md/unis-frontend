import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [academic, setAcademic] = useState(null);
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
          const student = responnse.data.student;
          const academicResponse = await axios.get(
            `https://unis-server.vercel.app/api/student/${student._id}/${'vieww'}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          setStudent(student);

          if (academicResponse.data.success) {
            setAcademic(academicResponse.data.academic);
          } else {
            alert("No academic Found : " + responnse.data.student._id);
          }
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

                <div className="flex space-x-3 mb-5" />

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

                <div className="flex space-x-3 mb-5" />

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

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Address:</p>
                  <p className="font-normal">{student.address}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">State / District:</p>
                  <p className="font-normal">{student.district}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Academic Year:</p>
                  <p className="font-normal">{academic.acYear.acYear}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** COURCE-1 DETAILS *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId1.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId1.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Reference Number :</p>
                  <p className="font-normal">{academic.refNumber1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Fees :</p>
                  <p className="font-normal">{academic.fees1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Discount :</p>
                  <p className="font-normal">{academic.discount1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Final Fees :</p>
                  <p className="font-normal">{academic.finalFees1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid :</p>
                  <p className="font-normal">{academic.paid1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid Date  :</p>
                  <p className="font-normal">{new Date(academic.paidDate1).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Balance Fees :</p>
                  <p className="font-normal">{academic.balance1}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** COURCE-2 DETAILS *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId2.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId2.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Reference Number :</p>
                  <p className="font-normal">{academic.refNumber2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Fees :</p>
                  <p className="font-normal">{academic.fees2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Discount :</p>
                  <p className="font-normal">{academic.discount2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Final Fees :</p>
                  <p className="font-normal">{academic.finalFees2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid :</p>
                  <p className="font-normal">{academic.paid2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium text-blue-500">Paid Date  :</p>
                  <p className="font-normal">{new Date(academic.paidDate2).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Balance Fees :</p>
                  <p className="font-normal">{academic.balance2}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** COURCE-3 DETAILS *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId3.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId3.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Reference Number :</p>
                  <p className="font-normal">{academic.refNumber3}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Fees :</p>
                  <p className="font-normal">{academic.fees3}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Discount :</p>
                  <p className="font-normal">{academic.discount3}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Final Fees :</p>
                  <p className="font-normal">{academic.finalFees3}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid :</p>
                  <p className="font-normal">{academic.paid3}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid Date  :</p>
                  <p className="font-normal">{new Date(academic.paidDate3).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Balance Fees :</p>
                  <p className="font-normal">{academic.balance3}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** COURCE-4 DETAILS *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId4.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId4.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Reference Number :</p>
                  <p className="font-normal">{academic.refNumber4}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Fees :</p>
                  <p className="font-normal">{academic.fees4}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Discount :</p>
                  <p className="font-normal">{academic.discount4}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Final Fees :</p>
                  <p className="font-normal">{academic.finalFees4}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid :</p>
                  <p className="font-normal">{academic.paid4}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid Date  :</p>
                  <p className="font-normal">{new Date(academic.paidDate4).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Balance Fees :</p>
                  <p className="font-normal">{academic.balance4}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** COURCE-5 DETAILS *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId5.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId5.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Reference Number :</p>
                  <p className="font-normal">{academic.refNumber5}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Fees :</p>
                  <p className="font-normal">{academic.fees5}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Discount :</p>
                  <p className="font-normal">{academic.discount5}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Final Fees :</p>
                  <p className="font-normal">{academic.finalFees5}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid :</p>
                  <p className="font-normal">{academic.paid5}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Paid Date  :</p>
                  <p className="font-normal">{new Date(academic.paidDate5).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Balance Fees :</p>
                  <p className="font-normal">{academic.balance5}</p>
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
