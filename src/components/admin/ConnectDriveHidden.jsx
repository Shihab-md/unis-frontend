import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import { getDriveAuthUrl, getDriveStatus, disconnectDrive } from "../../api/integrationsApi";
import { LinkIcon, showSwalAlert, getPrcessing } from "../../utils/CommonHelper";

export default function ConnectDriveHidden() {
  const role = localStorage.getItem("role");
  const isHQ = role === "superadmin" || role === "hquser";

  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [folderId, setFolderId] = useState("");
  const [connectedAt, setConnectedAt] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    try {
      const s = await getDriveStatus();
      setConnected(!!s?.connected);
      setFolderId(s?.folderId || "");
      setConnectedAt(s?.connectedAt ? new Date(s.connectedAt).toLocaleString() : "");
    } catch (e) {
      console.log(e);
      setConnected(false);
      setFolderId("");
      setConnectedAt("");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle silent redirect query params
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const status = q.get("status");
    const reason = q.get("reason");

    if (status === "ok") {
      showSwalAlert("Success", "Google Drive connected successfully", "success");
      loadStatus();
      window.history.replaceState({}, "", location.pathname);
    } else if (status === "fail") {
      showSwalAlert("Error", `Drive connect failed: ${reason || "unknown"}`, "error");
      loadStatus();
      window.history.replaceState({}, "", location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const connect = async () => {
    try {
      setLoading(true);
      const r = await getDriveAuthUrl();
      if (!r?.success || !r?.url) {
        showSwalAlert("Error", r?.error || "Failed to get auth url", "error");
        return;
      }
      window.open(r.url, "_blank");

      await Swal.fire({
        title: "Google Drive",
        text: "Complete Google consent in the new tab. After redirect, this page will auto show status.",
        icon: "info",
        confirmButtonText: "OK",
      });
    } catch (e) {
      console.log(e);
      showSwalAlert("Error", e?.message || "Failed to connect", "error");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    const ok = await Swal.fire({
      title: "Disconnect Drive?",
      text: "Uploads to Google Drive will stop until you connect again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, disconnect",
    });
    if (!ok.isConfirmed) return;

    try {
      setLoading(true);
      const r = await disconnectDrive();
      if (!r?.success) throw new Error(r?.error || "Failed to disconnect");
      showSwalAlert("Success", "Drive disconnected", "success");
      await loadStatus();
    } catch (e) {
      console.log(e);
      showSwalAlert("Error", e?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isHQ) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">{LinkIcon("/dashboard/accountsPage", "Back")}</div>
        <div className="p-4 border rounded text-sm text-red-700 bg-red-50">Forbidden: HQ only</div>
      </div>
    );
  }

  if (loading) return getPrcessing();

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div>{LinkIcon("/dashboard/accountsPage", "Back")}</div>
        <div className="flex flex-col leading-tight">
          <h2 className="text-lg font-bold">Hidden: Google Drive Connection</h2>
          <div className="text-xs text-gray-600 mt-1">
            URL: /dashboard/admin/connect-drive (keep hidden from menu)
          </div>
        </div>
      </div>

      <div className="border rounded bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${connected ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
            {connected ? "Connected" : "Not Connected"}
          </span>

          {folderId ? (
            <span className="text-xs text-gray-700">
              <span className="font-bold">FolderId:</span> {folderId}
            </span>
          ) : null}

          {connectedAt ? (
            <span className="text-xs text-gray-500">
              <span className="font-bold">Connected at:</span> {connectedAt}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-2">
          <button
            onClick={connect}
            className="rounded bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow hover:opacity-95"
          >
            Connect / Reconnect
          </button>

          <button
            onClick={loadStatus}
            className="rounded bg-gray-800 px-4 py-2 text-sm font-bold text-white shadow hover:bg-gray-900"
          >
            Refresh Status
          </button>

          <button
            onClick={disconnect}
            className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}