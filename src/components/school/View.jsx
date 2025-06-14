import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth } from '../../utils/CommonHelper'

const View = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const { id, page } = useParams();
  const [school, setSchool] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("schoolView") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const fetchSchool = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `school/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setSchool(responnse.data.school);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard/schools/");
        }
      }
    };

    fetchSchool();
  }, []);
  return (
    <>
      {school ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 rounded-md shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Niswan Details</h2>
            <Link to="/dashboard/schools" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
              <div>
                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Code" />
                <ViewCard type="data" text={school.code} />
                <ViewCard type="title" text="Name in English" />
                <ViewCard type="data" text={school.nameEnglish} />
                <ViewCard type="title" text="Name in Arabic" />
                <ViewCard type="data" text={school.nameArabic} />
                <ViewCard type="title" text="Name in Native" />
                <ViewCard type="data" text={school.nameNative} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Address" />
                <ViewCard type="data" text={school.address} />
                <ViewCard type="title" text="District / State" />
                <ViewCard type="data" text={school.district} />
                <ViewCard type="title" text="Contact Number" />
                <ViewCard type="data" text={school.contactNumber} />
                <ViewCard type="title" text="Email" />
                <ViewCard type="data" text={school.email} />
                <ViewCard type="title" text="Status" />
                <ViewCard type="data" text={school.active} />
                <ViewCard type="title" text="Supervisor" />
                <ViewCard type="data" text={school.supervisorId.supervisorId + " : " + school.supervisorId.userId.name} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-1 Name" />
                <ViewCard type="data" text={school.incharge1} />
                <ViewCard type="title" text="Incharge-1 Number" />
                <ViewCard type="data" text={school.incharge1Number} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-2 Name" />
                <ViewCard type="data" text={school.incharge2} />
                <ViewCard type="title" text="Incharge-2 Number" />
                <ViewCard type="data" text={school.incharge2Number} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-3 Name" />
                <ViewCard type="data" text={school.incharge3} />
                <ViewCard type="title" text="Incharge-3 Number" />
                <ViewCard type="data" text={school.incharge3Number} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-4 Name" />
                <ViewCard type="data" text={school.incharge4} />
                <ViewCard type="title" text="Incharge-4 Number" />
                <ViewCard type="data" text={school.incharge4Number} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-5 Name" />
                <ViewCard type="data" text={school.incharge5} />
                <ViewCard type="title" text="Incharge-5 Number" />
                <ViewCard type="data" text={school.incharge5Number} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-6 Name" />
                <ViewCard type="data" text={school.incharge6} />
                <ViewCard type="title" text="Incharge-6 Number" />
                <ViewCard type="data" text={school.incharge6Number} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-7 Name" />
                <ViewCard type="data" text={school.incharge7} />
                <ViewCard type="title" text="Incharge-7 Number" />
                <ViewCard type="data" text={school.incharge7Number} />

                <div className="flex space-x-3 mb-5" />
              </div>
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/dashboard/schools`)}
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
