import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClick, getSpinner, checkAuth } from '../../utils/CommonHelper';
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const { id } = useParams();
  const [institute, setInstitute] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("instituteView") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const fetchInstitute = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `institute/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setInstitute(responnse.data.institute);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');;
        }
      }
    };

    fetchInstitute();
  }, []);
  return (
    <>
      {institute ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Institute Details</h2>
            <Link to="/dashboard/institutes" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Code" />
              <ViewCard type="data" text={institute.iCode} />

              <ViewCard type="title" text="Name" />
              <ViewCard type="data" text={institute.name} />

              <ViewCard type="title" text="Education Type" />
              <ViewCard type="data" text={institute.type} />

              <ViewCard type="title" text="Email" />
              <ViewCard type="data" text={institute.email} />

              <ViewCard type="title" text="Contact Number" />
              <ViewCard type="data" text={institute.contactNumber} />

              <ViewCard type="title" text="Address" />
              <ViewCard type="data" text={institute.address} />

              <ViewCard type="title" text="District" />
              <ViewCard type="data" text={institute.district} />

              <ViewCard type="title" text="Incharge-1 Name" />
              <ViewCard type="data" text={institute.incharge1} />

              <ViewCard type="title" text="Incharge-1 Number" />
              <ViewCard type="data" text={institute.incharge1Number} />

              <ViewCard type="title" text="Incharge-2 Name" />
              <ViewCard type="data" text={institute.incharge2} />

              <ViewCard type="title" text="Incharge-2 Number" />
              <ViewCard type="data" text={institute.incharge2Number} />

              <div className="flex space-x-3 mb-5" />
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/dashboard/institutes`)}
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
