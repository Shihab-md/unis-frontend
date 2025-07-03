import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getFormattedDate, showSwalAlert } from '../../utils/CommonHelper';
import ViewCard from "../dashboard/ViewCard";
import { columnsSelectForAcademic } from '../../utils/StudentHelper'
import DataTable from 'react-data-table-component'
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
      showSwalAlert("Error!", "User Authorization Failed!", "error");
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
          setStudent(student);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/students/");
        }
      }
    };

    fetchStudent();
  }, []);

  return (
    <>
      {student ? (
        <div className="max-w-3xl mx-auto mt-2 p-5 rounded-md shadow-lg border">
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

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Status" />
                <ViewCard type="data" text={student.active} />
                <ViewCard type="title" text="Remarks" />
                <ViewCard type="data" text={student.remarks} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Date of Admission" />
                <ViewCard type="data" text={getFormattedDate(student.doa)} />
                <ViewCard type="title" text="Date of Birth" />
                <ViewCard type="data" text={getFormattedDate(student.dob)} />
                <ViewCard type="title" text="Gender" />
                <ViewCard type="data" text={student.gender} />
                <ViewCard type="title" text="Marital Status" />
                <ViewCard type="data" text={student.maritalStatus} />
                <ViewCard type="title" text="Mother Tongue" />
                <ViewCard type="data" text={student.motherTongue} />
                <ViewCard type="title" text="Blood Group" />
                <ViewCard type="data" text={student.bloodGroup} />
                <ViewCard type="title" text="Identification Mark 1" />
                <ViewCard type="data" text={student.idMark1} />
                <ViewCard type="title" text="Identification Mark 2" />
                <ViewCard type="data" text={student.idMark2} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="About Student" />
                <ViewCard type="data" text={student.about} />

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
                <ViewCard type="title" text="Area & Town / City" />
                <ViewCard type="data" text={student.city} />
                <ViewCard type="title" text="Landmark" />
                <ViewCard type="data" text={student.landmark} />
                <ViewCard type="title" text="Pincode" />
                <ViewCard type="data" text={student.pincode} />
                <ViewCard type="title" text="State & District" />
                <ViewCard type="data" text={student.districtStateId ? student.districtStateId?.district + ", " + student.districtStateId?.state : ""} />

                <div className="flex space-x-3 mb-7" />

                <ViewCard type="header" text="Academic Details" />
                <div className='mb-3 border rounded-md  p-0'>
                  <DataTable className="p-0" columns={columnsSelectForAcademic} data={student._academics} highlightOnHover striped />
                </div>

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="header" text="Hostel Details" />
                <ViewCard type="title" text="Hostel Admission" />
                <ViewCard type="data" text={student.hostel} />
                <ViewCard type="title" text="Hostel Reference Number " />
                <ViewCard type="data" text={student.hostelRefNumber} />
                <ViewCard type="title" text="Hostel Fees " />
                <ViewCard type="data" text={student.hostelFees} />
                {/*  <ViewCard type="title" text="Hostel Fees Discount " />
                <ViewCard type="data" text={student.hostelDiscount} />
                <ViewCard type="title" text="Hostel Final Fees " />
                <ViewCard type="data" text={student.hostelFinalFees} /> */}

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
