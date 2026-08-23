import React, { useCallback, useEffect, useState } from "react";
import { FaComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { helpDeskApi } from "../../api/helpDeskApi";

export default function HelpDeskIcon() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const data = await helpDeskApi.unreadCount();
      setUnread(Number(data?.unreadCount || 0));
    } catch {
      // keep navbar working even if Help Desk count fails
    }
  }, []);

  useEffect(() => {
    loadCount();

    const timer = window.setInterval(loadCount, 45000);
    const onFocus = () => loadCount();
    const onRefresh = () => loadCount();

    window.addEventListener("focus", onFocus);
    window.addEventListener("unis:helpdesk-count-refresh", onRefresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("unis:helpdesk-count-refresh", onRefresh);
    };
  }, [loadCount]);

  return (
    <div className="relative z-[70]">
      <button
        type="button"
        onClick={() => navigate("/dashboard/help-desk")}
        className="relative z-10 rounded-xl p-1 hover:-translate-y-0.5"
        aria-label="UNIS Help Desk"
        title="Help Desk"
      >
        <FaComments className="text-2xl lg:text-3xl text-sky-200 drop-shadow-lg" />

        {unread > 0 ? (
          <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
    </div>
  );
}
