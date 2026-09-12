import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import { FaHome, FaPowerOff } from "react-icons/fa";
import NotificationBell from '../notification/NotificationBell';
import HelpDeskIcon from '../helpdesk/HelpDeskIcon';
import { AutoText, useLanguage } from '../../i18n/LanguageContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isHQ = user?.role === "superadmin" || user?.role === "hquser" || user?.role === "supervisor";
  const roleKey = String(user?.role || "").toLowerCase();
  const roleLabel = roleKey ? t(`roles.${roleKey}`, roleKey.charAt(0).toUpperCase() + roleKey.slice(1)) : "";

  return (
    <div
      className={`relative flex items-center text-white justify-between bg-teal-600 px-5 text-shadow-lg overflow-visible z-50 
        ${isHQ ? "h-18" : "h-28"}`}
    >
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-teal-400 to-amber-400 blur-md opacity-70" />
        <Link to="/dashboard" className="relative z-10" title={t("common.dashboard")} aria-label={t("common.dashboard")}>
          <FaHome title={t("common.dashboard")} aria-label={t("common.dashboard")} className="text-3xl lg:text-4xl text-green-300 text-shadow-lg hover:-translate-y-0.5" />
        </Link>
      </div>
      <div className="relative z-10 flex flex-col items-center mt-2 min-w-0 px-2">
        <p className={`font-bold drop-shadow-4xl ${isHQ ? "text-xl lg:text-2xl" : "text-xl lg:text-3xl"}`}>
          UNIS ACADEMY
        </p>

        {user?.role && (
          <AutoText
            as="span"
            text={roleLabel}
            className={`font-semibold mb-2 mt-2 text-center ${isHQ ? "text-teal-300 drop-shadow" : "text-teal-200"}`}
          />
        )}

        {!isHQ && (
          <span className="text-center px-2 text-[9px] md:text-[12px] lg:text-sm text-teal-100 mt-1 mb-2" dir="ltr">
            {localStorage.getItem("schoolName") || "-"}
          </span>
        )}
      </div>

      <div className="relative flex items-center gap-3 lg:gap-5">
        <HelpDeskIcon />
        <NotificationBell />
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-teal-400 to-amber-400 blur-md opacity-70" />
          <FaPowerOff
            title={t("common.logout")}
            aria-label={t("common.logout")}
            className="relative z-10 text-3xl lg:text-4xl text-red-600 text-shadow-lg cursor-pointer hover:-translate-y-0.5"
            onClick={logout}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar
