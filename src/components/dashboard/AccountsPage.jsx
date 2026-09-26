import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import CommonHeader from "./CommonHeader";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { PERMISSIONS } from '../../auth/permissions'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, LinkIcon, showSwalAlert } from '../../utils/CommonHelper'
import { FaCalculator, FaRegMoneyBillAlt, FaCheck, FaRegClock, FaRegListAlt, FaPlayCircle } from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const AccountsPage = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const [summary, setSummary] = useState(null)
  const navigate = useNavigate()
  const { user, can } = useAuth()

  const role = String(user?.role || "").toLowerCase();
  const canOpenAccounts = can(PERMISSIONS.ACCOUNTS_VIEW);

  if (!canOpenAccounts) {
    return (
      <div className="p-7 pt-3">
        <CommonHeader userName={user?.name || ""} title="Accounts" />
        <div className="mx-auto mt-8 max-w-xl rounded-md border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
          Accounts are not available for this role.
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 pt-3 items-center justify-center rounded-lg h-9/10">
      <CommonHeader userName={user?.name || ""} title="Accounts" />
      <div className="content-center rounded-lg grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-10 lg:gap-14 mt-7 lg:mt-16 flex rounded-lg">

        {role === "admin" && can(PERMISSIONS.ACCOUNTS_SCHOOL_INVOICES_VIEW) ?
          <Link to="/dashboard/fees" >
            <SummaryCard
              icon={<FaRegMoneyBillAlt />}
              text="Invoice Payments"
              number="*"
              color="bg-purple-500"
            />
          </Link> : null}

        {(role === "superadmin" || role === "hquser") && can(PERMISSIONS.ACCOUNTS_HQ_REVIEW_VIEW) ?
          <Link to="/dashboard/hq/fees" >
            <SummaryCard
              icon={<FaCheck />}
              text="For Approval"
              number="*"
              color="bg-blue-500"
            />
          </Link> : null}

        {(role === "superadmin" || role === "hquser" || role === "admin") && can(PERMISSIONS.ACCOUNTS_BATCH_HISTORY_VIEW) ?
          <Link to="/dashboard/fees/sent-to-hq" >
            <SummaryCard
              icon={<FaRegListAlt />}
              text={role === "superadmin" || role === "hquser" ? "Received Batches" : "Sent Batches"}
              number="*"
              color="bg-teal-500"
            />
          </Link> : null}

        {(role === "superadmin" || role === "hquser") && can(PERMISSIONS.ACCOUNTS_HQ_PENDING_INVOICES_VIEW) ?
          <Link to="/dashboard/hq/pending-invoices" >
            <SummaryCard
              icon={<FaRegClock />}
              text="Pending Invoices"
              number="*"
              color="bg-pink-500"
            />
          </Link> : null}

        {role === "superadmin" || role === "hquser" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaCalculator />}
              text="Payroll"
              number="*"
              color="bg-cyan-500"
            />
          </Link> : null}
        {/*
        {(role === "superadmin" || role === "hquser") && can(PERMISSIONS.ACCOUNTS_HQ_MIGRATION_RUN) ?
          <Link to="/dashboard/hq/fees/migration" >
            <SummaryCard
              icon={<FaPlayCircle />}
              text="Migration Paid"
              number="*"
              color="bg-emerald-500"
            />
          </Link> : null}
*/}
      </div>
    </div>
  );
};

export default AccountsPage;
