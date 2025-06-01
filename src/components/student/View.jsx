import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClick, getSpinner, checkAuth } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [academic, setAcademic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("studentView") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

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
          Swal.fire('Error!', error.response.data.error, 'error');;
        }
      }
    };

    fetchStudent();
  }, []);

  return (
    <>
      {student ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md bg-blue-50">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Student Details</h2>
            <Link to="/dashboard/students" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md</div>grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">
              <div className="flex mt-2 space-x-3 mb-3 items-center justify-center" >
                <img className='size-40 border items-center justify-center rounded-lg shadow-lg'
                  src={student.userId.profileImage && student.userId.profileImage != "" ? "data</div>image/jpeg;base64," + student.userId.profileImage : "/avatar.png"}
                />
              </div>
              <div className="p-2">
                <div className="flex space-x-3 mb-5" />

                <div className="border p-2 font-medium bg-purple-100">Niswan Name (English)</div>
                <div className="border p-2 font-normal">{student.schoolId && student.schoolId.nameEnglish ? student.schoolId.code + " : " + student.schoolId.nameEnglish : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Roll Number</div>
                <div className="border p-2 font-normal">{student.rollNumber}</div>

                <div className="border p-2 font-medium bg-purple-100">Name</div>
                <div className="border p-2 font-normal">{student.userId && student.userId.name ? student.userId.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Status</div>
                <div className="border p-2 font-normal">{student.active}</div>

                <div className="border p-2 font-medium bg-purple-100">Remarks</div>
                <div className="border p-2 font-normal">{student.remarks}</div>

                <div className="flex space-x-3 mb-5" />

                <div className="border p-2 font-medium bg-purple-100">Date of Addmission</div>
                <div className="border p-2 font-normal">{new Date(student.doa).toLocaleDateString()}</div>

                <div className="border p-2 font-medium bg-purple-100">Date of Birth</div>
                <div className="border p-2 font-normal">{new Date(student.dob).toLocaleDateString()}</div>

                <div className="border p-2 font-medium bg-purple-100">Gender</div>
                <div className="border p-2 font-normal">{student.gender}</div>

                <div className="border p-2 font-medium bg-purple-100">Marital Status</div>
                <div className="border p-2 font-normal">{student.maritalStatus}</div>

                <div className="border p-2 font-medium bg-purple-100">Blood Group</div>
                <div className="border p-2 font-normal">{student.bloodGroup}</div>

                <div className="border p-2 font-medium bg-purple-100">Identification Mark 1</div>
                <div className="border p-2 font-normal">{student.idMark1}</div>

                <div className="border p-2 font-medium bg-purple-100">Identification Mark 2</div>
                <div className="border p-2 font-normal">{student.idMark2}</div>

                <div className="flex space-x-3 mb-5" />

                <div className="border p-2 font-medium bg-purple-100">Father's Name</div>
                <div className="border p-2 font-normal">{student.fatherName}</div>

                <div className="border p-2 font-medium bg-purple-100">Father's Number</div>
                <div className="border p-2 font-normal">{student.fatherNumber} </div>

                <div className="border p-2 font-medium bg-purple-100">Father's Occupation</div>
                <div className="border p-2 font-normal">{student.fatherOccupation} </div>

                <div className="border p-2 font-medium bg-purple-100">Mother's Name</div>
                <div className="border p-2 font-normal">{student.motherName} </div>

                <div className="border p-2 font-medium bg-purple-100">Mother's Number</div>
                <div className="border p-2 font-normal">{student.motherNumber} </div>

                <div className="border p-2 font-medium bg-purple-100">Mother's Occupation</div>
                <div className="border p-2 font-normal">{student.motherOccupation} </div>

                <div className="border p-2 font-medium bg-purple-100">Guardian's Name</div>
                <div className="border p-2 font-normal">{student.guardianName} </div>

                <div className="border p-2 font-medium bg-purple-100">Guardian's Number</div>
                <div className="border p-2 font-normal">{student.guardianNumber} </div>

                <div className="border p-2 font-medium bg-purple-100">Guardian's Occupation</div>
                <div className="border p-2 font-normal">{student.guardianOccupation} </div>

                <div className="border p-2 font-medium bg-purple-100">Guardian's Relationship</div>
                <div className="border p-2 font-normal">{student.guardianRelation} </div>

                <div className="flex space-x-3 mb-5" />

                <div className="border p-2 font-medium bg-purple-100">Address</div>
                <div className="border p-2 font-normal">{student.address} </div>

                <div className="border p-2 font-medium bg-purple-100">State / District</div>
                <div className="border p-2 font-normal">{student.district} </div>

                <div className="flex space-x-3 mb-5" />

                <div className="border p-2 font-medium bg-purple-100">Academic Year</div>
                <div className="border p-2 font-normal">{academic.acYear && academic.acYear.acYear ? academic.acYear.acYear : ""} </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Deeniyath Education ***** </p>
                </div>

                <div className="border p-2 font-medium bg-purple-100">Institute Name</div>
                <div className="border p-2 font-normal">{academic.instituteId1 && academic.instituteId1.name ? academic.instituteId1.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Course Name </div>
                <div className="border p-2 font-normal">{academic.courseId1 && academic.courseId1.name ? academic.courseId1.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Reference Number </div>
                <div className="border p-2 font-normal">{academic.refNumber1}</div>

                <div className="border p-2 font-medium bg-purple-100">Fees </div>
                <div className="border p-2 font-normal">{academic.fees1}</div>

                <div className="border p-2 font-medium bg-purple-100">Discount </div>
                <div className="border p-2 font-normal">{academic.discount1}</div>

                <div className="border p-2 font-medium bg-purple-100">Final Fees </div>
                <div className="border p-2 font-normal">{academic.finalFees1}</div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** School Education ***** </p>
                </div>

                <div className="border p-2 font-medium bg-purple-100">Institute Name</div>
                <div className="border p-2 font-normal">{academic.instituteId2 && academic.instituteId2.name ? academic.instituteId2.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Course Name </div>
                <div className="border p-2 font-normal">{academic.instituteId2 && academic.courseId2.name ? academic.courseId2.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Reference Number </div>
                <div className="border p-2 font-normal">{academic.refNumber2}</div>

                <div className="border p-2 font-medium bg-purple-100">Fees </div>
                <div className="border p-2 font-normal">{academic.fees2}</div>

                <div className="border p-2 font-medium bg-purple-100">Discount </div>
                <div className="border p-2 font-normal">{academic.discount2}</div>

                <div className="border p-2 font-medium bg-purple-100">Final Fees </div>
                <div className="border p-2 font-normal">{academic.finalFees2}</div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** College Education ***** </p>
                </div>

                <div className="border p-2 font-medium bg-purple-100">Institute Name</div>
                <div className="border p-2 font-normal">{academic.instituteId3 && academic.instituteId3.name ? academic.instituteId3.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Course Name </div>
                <div className="border p-2 font-normal">{academic.instituteId3 && academic.courseId3.name ? academic.courseId3.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Reference Number </div>
                <div className="border p-2 font-normal">{academic.refNumber3}</div>

                <div className="border p-2 font-medium bg-purple-100">Fees </div>
                <div className="border p-2 font-normal">{academic.fees3}</div>

                <div className="border p-2 font-medium bg-purple-100">Discount </div>
                <div className="border p-2 font-normal">{academic.discount3}</div>

                <div className="border p-2 font-medium bg-purple-100">Final Fees </div>
                <div className="border p-2 font-normal">{academic.finalFees3}</div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Vocation Course - 1 ***** </p>
                </div>

                <div className="border p-2 font-medium bg-purple-100">Institute Name</div>
                <div className="border p-2 font-normal">{academic.instituteId4 && academic.instituteId4.name ? academic.instituteId4.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Course Name </div>
                <div className="border p-2 font-normal">{academic.courseId4 && academic.courseId4.name ? academic.courseId4.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Reference Number </div>
                <div className="border p-2 font-normal">{academic.refNumber4}</div>

                <div className="border p-2 font-medium bg-purple-100">Fees </div>
                <div className="border p-2 font-normal">{academic.fees4}</div>

                <div className="border p-2 font-medium bg-purple-100">Discount </div>
                <div className="border p-2 font-normal">{academic.discount4}</div>

                <div className="border p-2 font-medium bg-purple-100">Final Fees </div>
                <div className="border p-2 font-normal">{academic.finalFees4}</div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Vocation Course - 2 ***** </p>
                </div>

                <div className="border p-2 font-medium bg-purple-100">Institute Name</div>
                <div className="border p-2 font-normal">{academic.instituteId5 && academic.instituteId5.name ? academic.instituteId5.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Course Name </div>
                <div className="border p-2 font-normal">{academic.courseId5 && academic.courseId5.name ? academic.courseId5.name : ""}</div>

                <div className="border p-2 font-medium bg-purple-100">Reference Number </div>
                <div className="border p-2 font-normal">{academic.refNumber5}</div>

                <div className="border p-2 font-medium bg-purple-100">Fees </div>
                <div className="border p-2 font-normal">{academic.fees5}</div>

                <div className="border p-2 font-medium bg-purple-100">Discount </div>
                <div className="border p-2 font-normal">{academic.discount5}</div>

                <div className="border p-2 font-medium bg-purple-100">Final Fees </div>
                <div className="border p-2 font-normal">{academic.finalFees5}</div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5 justify-center">
                  <p className="font-medium text-blue-500">***** Hostel Details ***** </p>
                </div>

                <div className="border p-2 font-medium bg-purple-100">Hostel Admission</div>
                <div className="border p-2 font-normal">{student.hostel}</div>

                <div className="border p-2 font-medium bg-purple-100">Hostel Reference Number </div>
                <div className="border p-2 font-normal">{student.hostelRefNumber}</div>

                <div className="border p-2 font-medium bg-purple-100">Hostel Fees </div>
                <div className="border p-2 font-normal">{student.hostelFees}</div>

                <div className="border p-2 font-medium bg-purple-100">Hostel Fees Discount </div>
                <div className="border p-2 font-normal">{student.hostelDiscount}</div>

                <div className="border p-2 font-medium bg-purple-100">Hostel Final Fees </div>
                <div className="border p-2 font-normal">{student.hostelFinalFees}</div>

              </div>
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover</div>bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/dashboard/students`)}
          >  Back
          </button>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;
