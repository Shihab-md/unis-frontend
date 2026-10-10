import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FaCloudUploadAlt, FaSyncAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../auth/roles";
import CommonHeader from "../dashboard/CommonHeader";
import { getDatabaseBackupStatus, createDatabaseBackup } from "../../api/databaseBackupApi";

const errorMessage = (error) => error?.response?.data?.error ||
  "The server response could not be confirmed. Refresh history before starting another backup.";
const formatTime = (value) => value && Number.isFinite(Date.parse(value))
  ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-";
const formatSize = (value) => `${(Number(value || 0) / (1024 * 1024)).toFixed(2)} MB`;

function BackupContent({ user }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const mounted = useRef(true);
  const submitting = useRef(false);

  const refresh = async (silent = false) => {
    if (!silent) { setLoading(true); setError(""); }
    try {
      const data = await getDatabaseBackupStatus();
      if (mounted.current) setStatus(data);
    } catch (failure) {
      if (mounted.current) { setStatus(null); setError(errorMessage(failure)); }
    } finally { if (mounted.current) setLoading(false); }
  };

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => { mounted.current = false; };
  }, []);

  const backupNow = async () => {
    if (submitting.current || !status?.ready || status.running) return;
    submitting.current = true;
    setBusy(true); setError(""); setMessage(""); setWarnings([]);
    try {
      const result = await createDatabaseBackup(window.crypto.randomUUID());
      if (mounted.current) { setMessage(result.message); setWarnings(result.warnings || []); }
    } catch (failure) {
      if (mounted.current) setError(errorMessage(failure));
    } finally {
      if (mounted.current) {
        await refresh(true);
        setBusy(false);
      }
      submitting.current = false;
    }
  };

  return (
    <div className="p-4 md:p-7 pt-3 max-w-6xl mx-auto">
      <CommonHeader userName={user?.name || ""} title="Database Backup" />
      <div className="mt-6 bg-white rounded-lg border shadow-lg p-5 md:p-7">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <Link to="/dashboard/masters" className="text-blue-700 underline">Back to Masters</Link>
          <button type="button" onClick={() => refresh()} disabled={busy || loading}
            className="flex items-center gap-2 border rounded px-3 py-2 disabled:opacity-50">
            <FaSyncAlt aria-hidden="true" /> Refresh status
          </button>
        </div>
        <p className="text-slate-700 mb-4">Create a database backup and upload it to Google Drive when needed. Backups run only when you select Backup Now.</p>
        {loading && <p role="status">Checking backup status...</p>}
        {status && <>
          <dl className="grid sm:grid-cols-2 gap-4 bg-slate-50 border rounded p-4 mb-5">
            <div><dt className="text-sm text-slate-500">Environment</dt><dd className="font-semibold uppercase">{status.environment}</dd></div>
            <div><dt className="text-sm text-slate-500">Database</dt><dd className="font-semibold">{status.database || "-"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-sm text-slate-500">Google Drive folder</dt><dd className="font-semibold break-words">{status.drivePath || "-"}</dd></div>
          </dl>
          <p className="text-sm text-slate-600 mb-4">After a verified backup, keep the newest backup for each of the last 10 calendar days (India time). Failed backups do not remove older verified copies.</p>
          {!status.ready && <p role="alert" className="bg-amber-50 border border-amber-200 text-amber-900 rounded p-3 mb-4">{status.setupMessage || "Complete the server backup setup first."}</p>}
          {status.running && <p role="status" className="text-amber-800 mb-4">A backup is already running. Refresh status to check its result.</p>}
          <button type="button" onClick={backupNow} disabled={busy || loading || !status.ready || status.running}
            className="flex items-center gap-2 bg-blue-700 text-white font-semibold rounded px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            <FaCloudUploadAlt aria-hidden="true" /> {busy ? "Backing up and verifying..." : "Backup Now"}
          </button>
        </>}
        {busy && <p role="status" className="text-slate-600 mt-3">Please keep this page open while the backup completes. This may take a few minutes.</p>}
        {message && <p role="status" className="bg-green-50 text-green-900 border border-green-200 rounded p-3 mt-4">{message}</p>}
        {error && <p role="alert" className="bg-red-50 text-red-800 border border-red-200 rounded p-3 mt-4">{error}</p>}
        {warnings.map((warning) => <p key={warning} role="alert" className="bg-amber-50 text-amber-900 rounded p-3 mt-4">{warning}</p>)}
        {status?.pending?.length > 0 && <p role="alert" className="bg-amber-50 text-amber-900 border rounded p-3 mt-4">{status.pending.length} uploaded backup(s) are unverified and are excluded from successful history. Review the Google Drive folder before retrying.</p>}
        {status?.folderUrl && <a href={status.folderUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-700 underline mt-4">Open backup folder in Google Drive</a>}
        <h2 className="text-lg font-semibold mt-7 mb-3">Verified backup history</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100"><tr><th className="p-3">Completed file date (India)</th><th className="p-3">Collections</th><th className="p-3">Documents</th><th className="p-3">Size</th><th className="p-3">Backup file</th></tr></thead>
            <tbody>{status?.backups?.map((backup) => <tr key={backup.id} className="border-b">
              <td className="p-3 whitespace-nowrap">{formatTime(backup.createdAt)}</td><td className="p-3">{backup.collections}</td><td className="p-3">{backup.documents}</td><td className="p-3 whitespace-nowrap">{formatSize(backup.bytes)}</td>
              <td className="p-3"><a href={backup.viewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Open encrypted backup</a></td>
            </tr>)}</tbody>
          </table>
        </div>
        {!loading && status && !status.backups?.length && <p className="text-slate-500 mt-3">No verified backups yet.</p>}
      </div>
    </div>
  );
}

export default function DatabaseBackup() {
  const { user } = useAuth();
  if (normalizeRole(user?.role) !== "superadmin") return <Navigate to="/dashboard" replace />;
  return <BackupContent user={user} />;
}
