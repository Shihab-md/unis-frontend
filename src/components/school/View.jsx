import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getFormattedDate, showSwalAlert } from '../../utils/CommonHelper'

const View = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const { id, page } = useParams();
  const [school, setSchool] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("schoolView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
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
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/schools/");
        }
      }
    };

    fetchSchool();
  }, []);
  return (
    <>
      {school ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
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
                <ViewCard type="title" text="Date of Establishment" />
                <ViewCard type="data" text={getFormattedDate(school.doe)} />
                <ViewCard type="title" text="Status" />
                <ViewCard type="data" text={school.active} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Name in English" />
                <ViewCard type="data" text={school.nameEnglish} />
                <ViewCard type="title" text="Name in Arabic" />
                <ViewCard type="data" text={school.nameArabic} />
                <ViewCard type="title" text="Name in Native" />
                <ViewCard type="data" text={school.nameNative} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Contact Number" />
                <ViewCard type="data" text={school.contactNumber} />
                <ViewCard type="title" text="Email" />
                <ViewCard type="data" text={school.email} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Door No. & Street" />
                <ViewCard type="data" text={school.address} />
                <ViewCard type="title" text="Area & Town / City" />
                <ViewCard type="data" text={school.city} />
                <ViewCard type="title" text="Landmark" />
                <ViewCard type="data" text={school.landmark} />
                <ViewCard type="title" text="Pincode" />
                <ViewCard type="data" text={school.pincode} />
                <ViewCard type="title" text="State & District" />
                <ViewCard type="data" text={school.districtStateId ? school.districtStateId?.district + ", " + school.districtStateId?.state : ""} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Supervisor" />
                <ViewCard type="data" text={school.supervisorId.supervisorId + " : " + school.supervisorId.userId.name} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-1 Name" />
                <ViewCard type="data" text={school.incharge1} />
                <ViewCard type="title" text="Mobile Number" />
                <ViewCard type="data" text={school.incharge1Number} />
                <ViewCard type="title" text="Designation" />
                <ViewCard type="data" text={school.designation1} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-2 Name" />
                <ViewCard type="data" text={school.incharge2} />
                <ViewCard type="title" text="Mobile Number" />
                <ViewCard type="data" text={school.incharge2Number} />
                <ViewCard type="title" text="Designation" />
                <ViewCard type="data" text={school.designation2} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-3 Name" />
                <ViewCard type="data" text={school.incharge3} />
                <ViewCard type="title" text="Mobile Number" />
                <ViewCard type="data" text={school.incharge3Number} />
                <ViewCard type="title" text="Designation" />
                <ViewCard type="data" text={school.designation3} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-4 Name" />
                <ViewCard type="data" text={school.incharge4} />
                <ViewCard type="title" text="Mobile Number" />
                <ViewCard type="data" text={school.incharge4Number} />
                <ViewCard type="title" text="Designation" />
                <ViewCard type="data" text={school.designation4} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-5 Name" />
                <ViewCard type="data" text={school.incharge5} />
                <ViewCard type="title" text="Mobile Number" />
                <ViewCard type="data" text={school.incharge5Number} />
                <ViewCard type="title" text="Designation" />
                <ViewCard type="data" text={school.designation5} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-6 Name" />
                <ViewCard type="data" text={school.incharge6} />
                <ViewCard type="title" text="Mobile Number" />
                <ViewCard type="data" text={school.incharge6Number} />
                <ViewCard type="title" text="Designation" />
                <ViewCard type="data" text={school.designation6} />

                <div className="flex space-x-3 mb-5" />

                <ViewCard type="title" text="Incharge-7 Name" />
                <ViewCard type="data" text={school.incharge7} />
                <ViewCard type="title" text="Mobile Number" />
                <ViewCard type="data" text={school.incharge7Number} />
                <ViewCard type="title" text="Designation" />
                <ViewCard type="data" text={school.designation7} />

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
