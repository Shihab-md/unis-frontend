import React, { useCallback, useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/notificationApi";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const data = await notificationApi.unreadCount();
      setUnread(Number(data?.unreadCount || 0));
    } catch {
      // keep navbar working even if notification count fails
    }
  }, []);

  useEffect(() => {
    loadCount();

    const timer = window.setInterval(loadCount, 45000);
    const onFocus = () => loadCount();

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadCount]);

  return (
    <div className="relative z-[70]">
      <button
        type="button"
        onClick={() => navigate("/dashboard/notifications")}
        className="relative z-10 rounded-xl p-1 hover:-translate-y-0.5"
        aria-label="UNIS notifications"
      >
        <FaBell className="text-2xl lg:text-3xl text-amber-300 drop-shadow-lg" />

        {unread > 0 ? (
          <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
    </div>
  );
}