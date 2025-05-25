import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClick } from '../../utils/CommonHelper';
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
          Swal.fire('Error!', error.response.data.error, 'error');;
        }
      }
    };

    fetchCourse();
  }, []);
  return (
    <>
      {course ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Course Details</h2>
            <Link to="/admin-dashboard/courses" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">
              <div className="flex space-x-3 mb-5" />
              <div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Code:</p>
                  <p className="font-normal">{course.code}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name:</p>
                  <p className="font-normal">{course.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Education Type:</p>
                  <p className="font-normal">{course.type}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Remarks:</p>
                  <p className="font-normal">{course.remarks}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Fees:</p>
                  <p className="font-normal">{course.fees}</p>
                </div>

                <div className="flex space-x-3 mb-5" />

                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-1 :</p>
                  <p className="font-normal">{course.subject1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject1MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject1PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-2 :</p>
                  <p className="font-normal">{course.subject2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject2MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject2PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-3 :</p>
                  <p className="font-normal">{course.subject3}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject3MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject3PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-4 :</p>
                  <p className="font-normal">{course.subject4}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject4MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject4PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-5 :</p>
                  <p className="font-normal">{course.subject5}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject5MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject5PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-6 :</p>
                  <p className="font-normal">{course.subject6}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject6MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject6PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-7 :</p>
                  <p className="font-normal">{course.subject7}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject7MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject7PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-8 :</p>
                  <p className="font-normal">{course.subject8}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject8MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject8PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-9 :</p>
                  <p className="font-normal">{course.subject9}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject9MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject9PassMark}</p>
                </div>

                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Subject-10 :</p>
                  <p className="font-normal">{course.subject10}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Max Marks :</p>
                  <p className="font-normal">{course.subject10MaxMark}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Pass Marks :</p>
                  <p className="font-normal">{course.subject10PassMark}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/admin-dashboard/courses`)}
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
