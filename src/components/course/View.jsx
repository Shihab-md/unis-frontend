import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaWindowClose
} from "react-icons/fa";

const View = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const responnse = await axios.get(
          `https://unis-server.vercel.app/api/course/${id}`,
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
          alert(error.response.data.error);
        }
      }
    };

    fetchCourse();
  }, []);
  return (
    <>
      {course ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="grid items-center justify-end px-1 py-1">
            <Link to="/admin-dashboard/courses" >
              <FaWindowClose className="text-xl bg-red-700 text-white rounded shadow-md" />
            </Link>
          </div>
          <div className="grid grid-cols-1 mt-2 bg-teal-700 text-white font-bold py-2 px-4 rounded">
            <div><h2 className="grid text-xl font-semibold items-center justify-center">Course Detail</h2></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
                <p className="font-medium">Remarks:</p>
                <p className="font-normal">{course.remarks}</p>
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
          <button
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
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
