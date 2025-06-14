import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth } from '../../utils/CommonHelper';
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("courseView") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const fetchCourse = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `course/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setCourse(responnse.data.course);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard/courses");
        }
      }
    };

    fetchCourse();
  }, []);
  return (
    <>
      {course ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 rounded-md shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Course Details</h2>
            <Link to="/dashboard/courses" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Code" />
              <ViewCard type="data" text={course.code} />
              <ViewCard type="title" text="Name" />
              <ViewCard type="data" text={course.name} />
              <ViewCard type="title" text="Education Type" />
              <ViewCard type="data" text={course.type} />
              <ViewCard type="title" text="Remarks" />
              <ViewCard type="data" text={course.remarks} />
              <ViewCard type="title" text="Fees" />
              <ViewCard type="data" text={course.fees} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-1 " />
              <ViewCard type="data" text={course.subject1} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject1MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject1PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-2 " />
              <ViewCard type="data" text={course.subject2} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject2MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject2PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-3 " />
              <ViewCard type="data" text={course.subject3} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject3MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject3PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-4 " />
              <ViewCard type="data" text={course.subject4} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject4MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject4PassMark} />


              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-5 " />
              <ViewCard type="data" text={course.subject5} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject5MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject5PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-6 " />
              <ViewCard type="data" text={course.subject6} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject6MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject6PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-7 " />
              <ViewCard type="data" text={course.subject7} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject7MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject7PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-8 " />
              <ViewCard type="data" text={course.subject8} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject8MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject8PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-9 " />
              <ViewCard type="data" text={course.subject9} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject9MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject9PassMark} />

              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Subject-10 " />
              <ViewCard type="data" text={course.subject10} />
              <ViewCard type="title" text="Max Marks " />
              <ViewCard type="data" text={course.subject10MaxMark} />
              <ViewCard type="title" text="Pass Marks " />
              <ViewCard type="data" text={course.subject10PassMark} />

              <div className="flex space-x-3 mb-5" />
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/dashboard/courses`)}
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
