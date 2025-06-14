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
  const [supervisor, setSupervisor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("supervisorView") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const fetchSupervisor = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setSupervisor(responnse.data.supervisor);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard/supervisors/");
        }
      }
    };

    fetchSupervisor();
  }, []);
  return (
    <>
      {supervisor ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 rounded-md shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Supervisor Details</h2>
            <Link to="/dashboard/supervisors" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-4 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">

              <div className="flex mt-4 space-x-3 mb-3 items-center justify-center" >
                <img className='size-40 border items-center justify-center rounded-lg shadow-lg'
                  src={supervisor.userId.profileImage && supervisor.userId.profileImage != "" ? "data:image/jpeg;base64," + supervisor.userId.profileImage : "/avatar.png"}
                />
              </div>
              <div>
                <div className="flex mt-1 space-x-3 mb-5" />

                <ViewCard type="title" text="Name" />
                <ViewCard type="data" text={supervisor.userId.name} />

                <ViewCard type="title" text="Email" />
                <ViewCard type="data" text={supervisor.userId.email} />

                <ViewCard type="title" text="Supervisor ID" />
                <ViewCard type="data" text={supervisor.supervisorId} />

                <ViewCard type="title" text="Contact Number" />
                <ViewCard type="data" text={supervisor.contactNumber} />

                <ViewCard type="title" text="Address" />
                <ViewCard type="data" text={supervisor.address} />

                <ViewCard type="title" text="Route" />
                <ViewCard type="data" text={supervisor.routeName} />

                <ViewCard type="title" text="Qualification" />
                <ViewCard type="data" text={supervisor.qualification} />

                <ViewCard type="title" text="Date of Birth" />
                <ViewCard type="data" text={getFormattedDate(supervisor.dob)} />

                <ViewCard type="title" text="Gender" />
                <ViewCard type="data" text={supervisor.gender} />

                <ViewCard type="title" text="Marital Status" />
                <ViewCard type="data" text={supervisor.maritalStatus} />

                <ViewCard type="title" text="Job Type" />
                <ViewCard type="data" text={supervisor.jobType} />

                <ViewCard type="title" text="Date of Joining" />
                <ViewCard type="data" text={getFormattedDate(supervisor.doj)} />

                <ViewCard type="title" text="Salary" />
                <ViewCard type="data" text={supervisor.salary} />

              </div>
            </div>
            <button
              className="w-full mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
              data-ripple-light="true"
              onClick={() => navigate(`/dashboard/supervisors`)}
            >  Back
            </button>
          </div>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;
