import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";
import { getBaseUrl, handleRightClick, getSpinner } from '../../utils/CommonHelper'

const View = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const { id, page } = useParams();
  const [school, setSchool] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
          Swal.fire('Error!', error.response.data.error, 'error');;
        }
      }
    };

    fetchSchool();
  }, []);
  return (
    <>
      {school ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Niswan Details</h2>
            <Link to="/admin-dashboard/schools" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">
              <div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Code :</p>
                  <p className="font-medium">{school.code}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name in English :</p>
                  <p className="font-normal">{school.nameEnglish}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name in Arabic :</p>
                  <p className="font-normal">{school.nameArabic}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Name in Native :</p>
                  <p className="font-normal">{school.nameNative}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Address :</p>
                  <p className="font-normal">{school.address}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">District / State :</p>
                  <p className="font-normal">{school.district}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Contact Number :</p>
                  <p className="font-normal">{school.contactNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Email :</p>
                  <p className="font-normal">{school.email}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Status :</p>
                  <p className="font-normal">{school.active}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Supervisor Id :</p>
                  <p className="font-normal">{school.supervisorId}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-1 Name :</p>
                  <p className="font-normal">{school.incharge1}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-1 Number :</p>
                  <p className="font-normal">{school.incharge1Number}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-2 Name :</p>
                  <p className="font-normal">{school.incharge2}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-2 Number :</p>
                  <p className="font-normal">{school.incharge2Number}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-3 Name :</p>
                  <p className="font-normal">{school.incharge3}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-3 Number :</p>
                  <p className="font-normal">{school.incharge3Number}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-4 Name :</p>
                  <p className="font-normal">{school.incharge4}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-4 Number :</p>
                  <p className="font-normal">{school.incharge4Number}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-5 Name :</p>
                  <p className="font-normal">{school.incharge5}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-5 Number :</p>
                  <p className="font-normal">{school.incharge5Number}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-6 Name :</p>
                  <p className="font-normal">{school.incharge6}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-6 Number :</p>
                  <p className="font-normal">{school.incharge6Number}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-7 Name :</p>
                  <p className="font-normal">{school.incharge7}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Incharge-7 Number :</p>
                  <p className="font-normal">{school.incharge7Number}</p>
                </div>
                <div className="flex space-x-3 mb-5" />
              </div>
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/admin-dashboard/schools`)}
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
