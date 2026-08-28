import React, { useCallback, useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/notificationApi";
import { useAuth } from "../../context/AuthContext";

export const NOTIFICATION_BADGE_REFRESH_EVENT = "unis:notification-badge-refresh";

export const refreshNotificationBadge = () => {
  try {
    window.dispatchEvent(new Event(NOTIFICATION_BADGE_REFRESH_EVENT));
  } catch {
    // Badge refresh should never block user action.
  }
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = String(user?.role || "").toLowerCase();
  const isSuperAdmin = userRole === "superadmin";
  const [unread, setUnread] = useState(0);

  const loadCount = useCallback(async () => {
    if (isSuperAdmin) {
      setUnread(0);
      return;
    }

    try {
      const data = await notificationApi.unreadCount();
      setUnread(Number(data?.unreadCount || 0));
    } catch {
      // keep navbar working even if notification count fails
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    loadCount();

    const timer = window.setInterval(loadCount, 45000);
    const onFocus = () => loadCount();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadCount();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener(NOTIFICATION_BADGE_REFRESH_EVENT, onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(NOTIFICATION_BADGE_REFRESH_EVENT, onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadCount]);

  return (
    <div className="relative z-[70]">
      <button
        type="button"
        onClick={() => navigate("/dashboard/notifications")}
        className="relative z-10 rounded-xl p-1 hover:-translate-y-0.5"
        aria-label="UNIS notifications"
        title={unread > 0 ? `${unread} unread notification(s)` : "Notifications"}
      >
        <FaBell className="text-2xl lg:text-3xl text-amber-300 drop-shadow-lg" />

        {unread > 0 ? (
          <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg ring-2 ring-white/70">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
    </div>
  );
}
