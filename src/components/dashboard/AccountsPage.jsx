import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import CommonHeader from "./CommonHeader";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, LinkIcon, showSwalAlert } from '../../utils/CommonHelper'
import { FaCalculator, FaRegMoneyBillAlt, FaCheck, FaRegClock, FaRegListAlt } from "react-icons/fa";
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

  return (
    <div className="p-7 pt-3 items-center justify-center rounded-lg h-9/10">
      <CommonHeader userName={user?.name || ""} title="Accounts" />
      <div className="content-center rounded-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10 mt-16 flex rounded-lg">

        {user.role === "admin" ?
          <Link to="/dashboard/fees" >
            <SummaryCard
              icon={<FaRegMoneyBillAlt />}
              text="Invoice Payments"
              number="*"
              color="bg-purple-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/hq/fees" >
            <SummaryCard
              icon={<FaCheck />}
              text="For Approval"
              number="*"
              color="bg-blue-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
          <Link to="/dashboard/fees/sent-to-hq" >
            <SummaryCard
              icon={<FaRegListAlt />}
              text={user.role === "superadmin" || user.role === "hquser" ? "Received Batches" : "Sent Batches"}
              number="*"
              color="bg-teal-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/hq/pending-invoices" >
            <SummaryCard
              icon={<FaRegClock />}
              text="Pending Invoices"
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
