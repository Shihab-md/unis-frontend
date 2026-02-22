import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, LinkIcon, showSwalAlert } from '../../utils/CommonHelper'
import { FaCalculator , FaRegMoneyBillAlt, FaCheck, FaRegClock } from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const AccountsPage = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const [summary, setSummary] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // useEffect(() => {

  //   const fetchSummary = async () => {
  //     try {
  //       const summary = await axios.get((await getBaseUrl()).toString() + 'dashboard/masterSummary', {
  //         headers: {
  //           "Authorization": `Bearer ${localStorage.getItem('token')}`
  //         }
  //       })

  //       setSummary(summary.data)
  //     } catch (error) {
  //       if (error.response) {
  //         showSwalAlert("Error!", error.response.data.error, "error");
  //       }
  //       console.log(error.messsage)
  //     }
  //   }
  //   fetchSummary()
  // }, [])

  // if (!summary) {
  //   return getSpinner();
  // }
  //p-6
  return (
    <div className="p-7 pt-3 items-center justify-center rounded-lg h-9/10">
      <h5 className="p-1 text-center font-semibold lg:text-xl text-gray-600 mt-12">إيمان : تقوى : حياء : أخلاق : دعاء : دعوة</h5>
      <h5 className="p-1 mt-1 text-center text-gray-600">Welcome, {user.name}</h5>
      <h5 className="text-xl mt-2 mb-3 font-bold capitalize text-center text-green-600 text-shadow-lg">Accounts</h5>

      <div className="content-center rounded-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10 mt-16 flex rounded-lg">

        {user.role === "admin" ?
          <Link to="/dashboard/fees" >
            <SummaryCard
              icon={<FaRegMoneyBillAlt />}
              text="Payments"
              number="*"
              color="bg-purple-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/hq/fees" >
            <SummaryCard
              icon={<FaCheck />}
              text="Approvals"
              number="*"
              color="bg-blue-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
          <Link to="/dashboard/fees/sent-to-hq" >
            <SummaryCard
              icon={<FaRegClock />}
              text={user.role === "superadmin" || user.role === "hquser" ? "Received Batches" : "Sent Batches"}
              number="*"
              color="bg-pink-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaCalculator />}
              text="Payroll"
              number="*"
              color="bg-cyan-500"
            />
          </Link> : null}

      </div>
    </div>
  );
};

export default AccountsPage;
