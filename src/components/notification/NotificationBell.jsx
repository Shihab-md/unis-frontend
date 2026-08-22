import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/notificationApi";

const safePath = (path) => typeof path === "string" && path.startsWith("/dashboard") && !path.startsWith("//") ? path : "/dashboard/notifications";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);

  const loadCount = useCallback(async () => {
    try { const data = await notificationApi.unreadCount(); setUnread(Number(data?.unreadCount || 0)); } catch { }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.list({ page: 1, limit: 5 });
      setItems(data?.notifications || []);
      setUnread(Number(data?.unreadCount || 0));
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadCount();
    const timer = window.setInterval(loadCount, 45000);
    const onFocus = () => loadCount();
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [loadCount]);

  useEffect(() => {
    if (open) loadItems();
    const handler = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, loadItems]);

  const openNotification = async (item) => {
    if (!item.readAt) {
      await notificationApi.markRead(item._id).catch(() => null);
      setUnread((value) => Math.max(0, value - 1));
    }
    setOpen(false);
    navigate(safePath(item.webPath));
  };

  return <div ref={rootRef} className="relative z-[70]">
    <button type="button" onClick={() => setOpen((v) => !v)} className="relative z-10 rounded-xl p-1 hover:-translate-y-0.5" aria-label="UNIS notifications">
      <FaBell className="text-2xl lg:text-3xl text-amber-300 drop-shadow-lg" />
      {unread > 0 ? <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">{unread > 99 ? "99+" : unread}</span> : null}
    </button>
    {open ? <div className="absolute right-0 top-full mt-3 w-[320px] max-w-[86vw] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div><p className="font-bold text-sm">Notifications</p><p className="text-[11px] text-slate-500">{unread} unread</p></div>
        <button className="text-xs font-semibold text-teal-700" onClick={() => { setOpen(false); navigate('/dashboard/notifications'); }}>View all</button>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        {loading ? <p className="p-4 text-xs text-slate-500">Loading...</p> : null}
        {!loading && items.length === 0 ? <p className="p-4 text-xs text-slate-500">No notifications yet.</p> : null}
        {items.map((item) => <button key={item._id} className={`w-full text-left border-b border-slate-100 px-4 py-3 hover:bg-slate-50 ${item.readAt ? 'bg-white' : 'bg-teal-50/70'}`} onClick={() => openNotification(item)}>
          <div className="flex gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-slate-300' : 'bg-teal-600'}`} /><div>
            <p className="text-xs font-bold text-slate-800">{item.title}</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">{item.message}</p>
            <p className="mt-1 text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
          </div></div>
        </button>)}
      </div>
    </div> : null}
  </div>;
}
