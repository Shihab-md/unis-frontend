import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl } from '../../utils/CommonHelper'
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
          (await getBaseUrl()).toString() + `student/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const student = responnse.data.student;
          const academicResponse = await axios.get(
            (await getBaseUrl()).toString() + `student/${student._id}/${'vieww'}`,
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
              <div className="flex border items-center justify-center rounded-lg shadow-lg">
                <img
                  src={"data:image/jpeg;base64," + student.userId.profileImage}
                  className="rounded-full border w-72"
                />
              </div>
              <div>
                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Niswan Name (Arabic):</p>
                  <p className="font-normal">{student.schoolId && student.schoolId.nameArabic ? student.schoolId.nameArabic : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Niswan Name (English):</p>
                  <p className="font-normal">{student.schoolId && student.schoolId.nameEnglish ? student.schoolId.nameEnglish : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Niswan Name (Native):</p>
                  <p className="font-normal">{student.schoolId && student.schoolId.nameNative ? student.schoolId.nameNative : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Roll Number:</p>
                  <p className="font-normal">{student.rollNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name:</p>
                  <p className="font-normal">{student.userId && student.userId.name ? student.userId.name : ""}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Status:</p>
                  <p className="font-normal">{student.active}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Remarks:</p>
                  <p className="font-normal">{student.remarks}</p>
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
                  <p className="font-normal">{academic.acYear && academic.acYear.acYear ? academic.acYear.acYear : ""}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Deeniyath Education *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId1 && academic.instituteId1.name ? academic.instituteId1.name : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId1 && academic.courseId1.name ? academic.courseId1.name : ""}</p>
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

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** School Education *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId2 && academic.instituteId2.name ? academic.instituteId2.name : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.instituteId2 && academic.courseId2.name ? academic.courseId2.name : ""}</p>
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

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** College Education *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId3 && academic.instituteId3.name ? academic.instituteId3.name : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.instituteId3 && academic.courseId3.name ? academic.courseId3.name : ""}</p>
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

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Vocation Course - 1 *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId4 && academic.instituteId4.name ? academic.instituteId4.name : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId4 && academic.courseId4.name ? academic.courseId4.name : ""}</p>
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

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Vocation Course - 2 *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Institute Name:</p>
                  <p className="font-normal">{academic.instituteId5 && academic.instituteId5.name ? academic.instituteId5.name : ""}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Course Name :</p>
                  <p className="font-normal">{academic.courseId5 && academic.courseId5.name ? academic.courseId5.name : ""}</p>
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

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Hostel Details *****</p>
                  <p className="font-normal"></p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Hostel Admission:</p>
                  <p className="font-normal">{student.hostel}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Hostel Reference Number :</p>
                  <p className="font-normal">{student.hostelRefNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Hostel Fees :</p>
                  <p className="font-normal">{student.hostelFees}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Hostel Fees Discount :</p>
                  <p className="font-normal">{student.hostelDiscount}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Hostel Final Fees :</p>
                  <p className="font-normal">{student.hostelFinalFees}</p>
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
