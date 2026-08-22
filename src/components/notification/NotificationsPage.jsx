import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonHeader from "../dashboard/CommonHeader";
import { useAuth } from "../../context/AuthContext";
import { notificationApi } from "../../api/notificationApi";
import { disableBrowserPush, enableBrowserPush, getBrowserPushStatus } from "../../utils/browserPush";

const safePath = (path) => typeof path === "string" && path.startsWith("/dashboard") && !path.startsWith("//") ? path : "/dashboard/notifications";

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pushStatus, setPushStatus] = useState({ supported: false, permission: "default", subscribed: false, configured: false });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.list({ page: 1, limit: 50, unreadOnly });
      setItems(data?.notifications || []);
      setUnreadCount(Number(data?.unreadCount || 0));
    } catch (error) { setMessage(error?.response?.data?.error || "Unable to load notifications."); }
    finally { setLoading(false); }
  }, [unreadOnly]);

  const refreshPush = useCallback(async () => {
    try { setPushStatus(await getBrowserPushStatus()); } catch { }
  }, []);

  useEffect(() => { load(); refreshPush(); }, [load, refreshPush]);

  const openItem = async (item) => {
    if (!item.readAt) await notificationApi.markRead(item._id).catch(() => null);
    navigate(safePath(item.webPath));
  };

  const markAll = async () => {
    setBusy(true); setMessage("");
    try { await notificationApi.markAllRead(); await load(); }
    catch (error) { setMessage(error?.response?.data?.error || "Unable to mark notifications as read."); }
    finally { setBusy(false); }
  };

  const togglePush = async () => {
    setBusy(true); setMessage("");
    try {
      if (pushStatus.subscribed) { await disableBrowserPush(); setMessage("Browser push notifications disabled on this browser."); }
      else { await enableBrowserPush(); setMessage("Browser push notifications enabled for this UNIS account."); }
      await refreshPush();
    } catch (error) { setMessage(error?.message || "Unable to change browser notification settings."); }
    finally { setBusy(false); }
  };

  const sendTest = async () => {
    setBusy(true); setMessage("");
    try { await notificationApi.sendTest(); setMessage("Test notification created. If push is enabled, it should also appear through the browser notification service."); await load(); }
    catch (error) { setMessage(error?.response?.data?.error || "Unable to send test notification."); }
    finally { setBusy(false); }
  };

  return <div className="px-3 md:px-6 pb-10">
    <CommonHeader userName={user?.name || ""} title="Notifications" />
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 rounded-xl border border-teal-200 bg-white/90 p-4 shadow">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><p className="font-bold text-slate-800">UNIS Notification Center</p><p className="mt-1 text-xs text-slate-500">{unreadCount} unread • In-app notifications work without browser permission.</p></div>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy || !pushStatus.supported || (!pushStatus.configured && !pushStatus.subscribed)} onClick={togglePush} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{pushStatus.subscribed ? "Disable browser push" : "Enable browser push"}</button>
            <button disabled={busy} onClick={sendTest} className="rounded-lg border border-teal-600 px-3 py-2 text-xs font-bold text-teal-700 disabled:opacity-40">Send test</button>
          </div>
        </div>
        {!pushStatus.configured ? <p className="mt-3 text-[11px] text-amber-700">Browser push delivery is not configured on the server yet. The Web bell and notification history still work normally.</p> : null}
        {pushStatus.permission === "denied" ? <p className="mt-2 text-[11px] text-red-700">Browser notification permission is blocked in your browser settings.</p> : null}
        {message ? <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">{message}</p> : null}
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex gap-2"><button onClick={() => setUnreadOnly(false)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${!unreadOnly ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border'}`}>All</button><button onClick={() => setUnreadOnly(true)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${unreadOnly ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border'}`}>Unread</button></div>
        <button disabled={busy || unreadCount === 0} onClick={markAll} className="text-xs font-bold text-teal-700 disabled:opacity-40">Mark all read</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow">
        {loading ? <p className="p-5 text-sm text-slate-500">Loading notifications...</p> : null}
        {!loading && items.length === 0 ? <p className="p-5 text-sm text-slate-500">No notifications found.</p> : null}
        {items.map((item) => <button key={item._id} onClick={() => openItem(item)} className={`w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${item.readAt ? 'bg-white' : 'bg-teal-50/60'}`}>
          <div className="flex gap-3"><span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.readAt ? 'bg-slate-300' : 'bg-teal-600'}`} /><div className="min-w-0">
            <p className="font-bold text-sm text-slate-800">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.message}</p><p className="mt-2 text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
          </div></div>
        </button>)}
      </div>
    </div>
  </div>;
}
