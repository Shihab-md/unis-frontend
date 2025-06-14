import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getFormattedDate } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

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
            Swal.fire('Error!', "No academic data Found : " + responnse.data.student.userId.name, 'error');
            navigate("/dashboard/students/");
          }
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard/students/");
        }
      }
    };

    fetchStudent();
  }, []);

  return (
    <>
      {student ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 rounded-md shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Student Details</h2>
            <Link to="/dashboard/students" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="flex mt-2 space-x-3 mb-1 items-center justify-center" >
                <img className='size-40 border mt-3 items-center justify-center rounded-lg shadow-lg'
                  src={student.userId.profileImage && student.userId.profileImage != "" ? student.userId.profileImage + "?" + new Date().getTime() : "/avatar.png"}
                />
              </div>
              <div className="p-2">
                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Niswan Name (English)" />
                <ViewCard type="data" text={student.schoolId && student.schoolId.nameEnglish ? student.schoolId.code + " : " + student.schoolId.nameEnglish : ""} />
                <ViewCard type="title" text="Roll Number" />
                <ViewCard type="data" text={student.rollNumber} />
                <ViewCard type="title" text="Name" />
                <ViewCard type="data" text={student.userId && student.userId.name ? student.userId.name : ""} />
                <ViewCard type="title" text="Status" />
                <ViewCard type="data" text={student.active} />
                <ViewCard type="title" text="Remarks" />
                <ViewCard type="data" text={student.remarks} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Date of Addmission" />
                <ViewCard type="data" text={getFormattedDate(student.doa)} />
                <ViewCard type="title" text="Date of Birth" />
                <ViewCard type="data" text={getFormattedDate(student.dob)} />
                <ViewCard type="title" text="Gender" />
                <ViewCard type="data" text={student.gender} />
                <ViewCard type="title" text="Marital Status" />
                <ViewCard type="data" text={student.maritalStatus} />
                <ViewCard type="title" text="Blood Group" />
                <ViewCard type="data" text={student.bloodGroup} />
                <ViewCard type="title" text="Identification Mark 1" />
                <ViewCard type="data" text={student.idMark1} />
                <ViewCard type="title" text="Identification Mark 2" />
                <ViewCard type="data" text={student.idMark2} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Father's Name" />
                <ViewCard type="data" text={student.fatherName} />
                <ViewCard type="title" text="Father's Number" />
                <ViewCard type="data" text={student.fatherNumber} />
                <ViewCard type="title" text="Father's Occupation" />
                <ViewCard type="data" text={student.fatherOccupation} />
                <ViewCard type="title" text="Mother's Name" />
                <ViewCard type="data" text={student.motherName} />
                <ViewCard type="title" text="Mother's Number" />
                <ViewCard type="data" text={student.motherNumber} />
                <ViewCard type="title" text="Mother's Occupation" />
                <ViewCard type="data" text={student.motherOccupation} />
                <ViewCard type="title" text="Guardian's Name" />
                <ViewCard type="data" text={student.guardianName} />
                <ViewCard type="title" text="Guardian's Number" />
                <ViewCard type="data" text={student.guardianNumber} />
                <ViewCard type="title" text="Guardian's Occupation" />
                <ViewCard type="data" text={student.guardianOccupation} />
                <ViewCard type="title" text="Guardian's Relationship" />
                <ViewCard type="data" text={student.guardianRelation} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Address" />
                <ViewCard type="data" text={student.address} />
                <ViewCard type="title" text="State / District" />
                <ViewCard type="data" text={student.district} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Academic Year" />
                <ViewCard type="data" text={academic.acYear && academic.acYear.acYear ? academic.acYear.acYear : ""} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="header" text="Deeniyath Education" />
                <ViewCard type="title" text="Institute Name" />
                <ViewCard type="data" text={academic.instituteId1 && academic.instituteId1.name ? academic.instituteId1.name : ""} />
                <ViewCard type="title" text="Course Name " />
                <ViewCard type="data" text={academic.courseId1 && academic.courseId1.name ? academic.courseId1.name : ""} />
                <ViewCard type="title" text="Reference Number " />
                <ViewCard type="data" text={academic.refNumber1} />
                <ViewCard type="title" text="Fees " />
                <ViewCard type="data" text={academic.fees1} />
                <ViewCard type="title" text="Discount " />
                <ViewCard type="data" text={academic.discount1} />
                <ViewCard type="title" text="Final Fees " />
                <ViewCard type="data" text={academic.finalFees1} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="header" text="School Education" />
                <ViewCard type="title" text="Institute Name" />
                <ViewCard type="data" text={academic.instituteId2 && academic.instituteId2.name ? academic.instituteId2.name : ""} />
                <ViewCard type="title" text="Course Name " />
                <ViewCard type="data" text={academic.instituteId2 && academic.courseId2.name ? academic.courseId2.name : ""} />
                <ViewCard type="title" text="Reference Number " />
                <ViewCard type="data" text={academic.refNumber2} />
                <ViewCard type="title" text="Fees " />
                <ViewCard type="data" text={academic.fees2} />
                <ViewCard type="title" text="Discount " />
                <ViewCard type="data" text={academic.discount2} />
                <ViewCard type="title" text="Final Fees " />
                <ViewCard type="data" text={academic.finalFees2} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="header" text="College Education" />
                <ViewCard type="title" text="Institute Name" />
                <ViewCard type="data" text={academic.instituteId3 && academic.instituteId3.name ? academic.instituteId3.name : ""} />
                <ViewCard type="title" text="Course Name " />
                <ViewCard type="data" text={academic.instituteId3 && academic.courseId3.name ? academic.courseId3.name : ""} />
                <ViewCard type="title" text="Reference Number " />
                <ViewCard type="data" text={academic.refNumber3} />
                <ViewCard type="title" text="Fees " />
                <ViewCard type="data" text={academic.fees3} />
                <ViewCard type="title" text="Discount " />
                <ViewCard type="data" text={academic.discount3} />
                <ViewCard type="title" text="Final Fees " />
                <ViewCard type="data" text={academic.finalFees3} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="header" text="Vocation Course - 1" />
                <ViewCard type="title" text="Institute Name" />
                <ViewCard type="data" text={academic.instituteId4 && academic.instituteId4.name ? academic.instituteId4.name : ""} />
                <ViewCard type="title" text="Course Name " />
                <ViewCard type="data" text={academic.courseId4 && academic.courseId4.name ? academic.courseId4.name : ""} />
                <ViewCard type="title" text="Reference Number " />
                <ViewCard type="data" text={academic.refNumber4} />
                <ViewCard type="title" text="Fees " />
                <ViewCard type="data" text={academic.fees4} />
                <ViewCard type="title" text="Discount " />
                <ViewCard type="data" text={academic.discount4} />
                <ViewCard type="title" text="Final Fees " />
                <ViewCard type="data" text={academic.finalFees4} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="header" text="Vocation Course - 2" />
                <ViewCard type="title" text="Institute Name" />
                <ViewCard type="data" text={academic.instituteId5 && academic.instituteId5.name ? academic.instituteId5.name : ""} />
                <ViewCard type="title" text="Course Name " />
                <ViewCard type="data" text={academic.courseId5 && academic.courseId5.name ? academic.courseId5.name : ""} />
                <ViewCard type="title" text="Reference Number " />
                <ViewCard type="data" text={academic.refNumber5} />
                <ViewCard type="title" text="Fees " />
                <ViewCard type="data" text={academic.fees5} />
                <ViewCard type="title" text="Discount " />
                <ViewCard type="data" text={academic.discount5} />
                <ViewCard type="title" text="Final Fees " />
                <ViewCard type="data" text={academic.finalFees5} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="header" text="Hostel Details" />
                <ViewCard type="title" text="Hostel Admission" />
                <ViewCard type="data" text={student.hostel} />
                <ViewCard type="title" text="Hostel Reference Number " />
                <ViewCard type="data" text={student.hostelRefNumber} />
                <ViewCard type="title" text="Hostel Fees " />
                <ViewCard type="data" text={student.hostelFees} />
                <ViewCard type="title" text="Hostel Fees Discount " />
                <ViewCard type="data" text={student.hostelDiscount} />
                <ViewCard type="title" text="Hostel Final Fees " />
                <ViewCard type="data" text={student.hostelFinalFees} />

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
