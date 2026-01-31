import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, getPrcessing, showSwalAlert } from "../../utils/CommonHelper";
import {
    FaUserCircle,
    FaLock,
    FaIdBadge,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaBirthdayCake,
    FaVenusMars,
    FaUserTie,
    FaGraduationCap,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaEnvelope,
    FaShieldAlt,
} from "react-icons/fa";

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString();
};

const roleLabel = (role) => {
    const r = String(role || "").toLowerCase();
    const map = {
        superadmin: "SuperAdmin",
        hquser: "HQUser",
        supervisor: "Supervisor",
        admin: "Admin",
        student: "Student",
        employee: "Employee",
        teacher: "Teacher",
        usthadh: "Usthadh",
        parent: "Parent",
        warden: "Warden",
        staff: "Staff",
    };
    return map[r] ?? (r ? r.charAt(0).toUpperCase() + r.slice(1) : "-");
};

const strengthScore = (pwd) => {
    const s = String(pwd || "");
    let score = 0;
    if (s.length >= 8) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[a-z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    return Math.min(score, 5);
};

const Field = ({ label, value, icon: Icon, accent = "teal" }) => {
    const badge =
        accent === "indigo"
            ? "from-indigo-500 to-violet-500"
            : accent === "rose"
                ? "from-rose-500 to-pink-500"
                : accent === "amber"
                    ? "from-amber-500 to-orange-500"
                    : "from-teal-500 to-emerald-500";

    return (
        <div className="w-full group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-4 shadow-sm transition-all sm:hover:-translate-y-0.5 sm:hover:shadow-lg">
            {/* glow */}
            <div className="pointer-events-none absolute -inset-24 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-60 bg-gradient-to-r from-teal-300/30 via-indigo-300/30 to-rose-300/30" />

            <div className="relative min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className={`shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-r ${badge} text-white shadow`}
                    >
                        {Icon ? <Icon className="text-sm" /> : null}
                    </div>
                    <div className="text-xs font-bold text-slate-700 truncate">{label}</div>
                </div>

                <div className="mt-3 text-base sm:text-md font-xl text-slate-900 break-words">
                    {value ?? "-"}
                </div>

                <div className="mt-4 h-1.5 w-full rounded-full bg-gradient-to-r from-white/60 via-white/30 to-white/60 opacity-70" />
            </div>
        </div>
    );
};

export default function ProfilePage() {
    const [tab, setTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false)

    const [data, setData] = useState({ user: null, employee: null });

    const navigate = useNavigate();

    const [pass, setPass] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        let alive = true;

        const load = async () => {
            try {
                const res = await axios.get((await getBaseUrl()).toString() + "profile", {
                    headers: authHeaders(),
                });

                if (!res.data?.success) {
                    showSwalAlert("Error", res.data?.error || "Unable to load profile", "error");
                    return;
                }

                if (!alive) return;
                setData({ user: res.data.user, employee: res.data.employee });
            } catch (err) {
                const msg =
                    err?.response?.data?.error ||
                    (err?.response ? `Server error (${err.response.status})` : "Network/CORS error");
                showSwalAlert("Error", msg, "error");
            } finally {
                if (alive) setLoading(false);
            }
        };

        load();
        return () => {
            alive = false;
        };
    }, []);

    const pwdScore = useMemo(() => strengthScore(pass.newPassword), [pass.newPassword]);
    const pwdMatch = useMemo(
        () => pass.newPassword && pass.confirmPassword && pass.newPassword === pass.confirmPassword,
        [pass.newPassword, pass.confirmPassword]
    );

    const handlePasswordSave = async (e1) => {
        e1.preventDefault();

        if (pass.newPassword !== pass.confirmPassword) {
            showSwalAlert("Error", "New password and Confirm password must match", "error");
            return;
        }

        try {
            setProcessing(true);
            const res = await axios.put((await getBaseUrl()).toString() + "profile/updatePassword",
                { oldPassword: pass.oldPassword, newPassword: pass.newPassword },
                { headers: authHeaders() }
            );

            if (res.data.success) {
                showSwalAlert("Success!", "Password changed Successfully...!", "success");
                window.location.reload();
                navigate("/dashboard/profile");
            } else {
                const msg = res.data.error || "Password change failed";
                setErrors((prev) => ({ ...prev, form: msg }));
                showSwalAlert("Error!", msg, "error");
            }
            setProcessing(false);
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                (err?.response ? `Server error (${err.response.status})` : "Network/CORS error");
            showSwalAlert("Error", msg, "error");
        }
    };

    if (processing) {
        return getPrcessing();
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="rounded-3xl border bg-white p-7 shadow">
                    <div className="h-4 w-56 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="mt-4 h-3 w-80 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="h-20 rounded-xl bg-slate-200 animate-pulse" />
                        <div className="h-20 rounded-xl bg-slate-200 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const u = data.user || {};
    const e = data.employee || {};
    const isActive = String(e.active || "").toLowerCase() === "active";

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="relative p-3 sm:p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="relative overflow-hidden rounded-[16px] border border-white/40 bg-white/55 backdrop-blur-2xl">
                        <div className="relative p-4 sm:p-7">
                            {/* Background overlay */}
                            <div className="pointer-events-none absolute inset-0 opacity-40 blur-2xl bg-[radial-gradient(circle_at_top,_#60a5fa_0%,_transparent_55%)]" />

                            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                        My Profile
                                    </div>
                                </div>

                                <div className="flex w-full sm:w-auto gap-2">
                                    <button
                                        className={`flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${tab === "profile"
                                            ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg ring-2 ring-teal-300/60"
                                            : "bg-white/70 border text-slate-800 hover:bg-white/90"
                                            }`}
                                        onClick={() => setTab("profile")}
                                        type="button"
                                    >
                                        <FaUserCircle />
                                        Profile
                                    </button>

                                    <button
                                        className={`flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${tab === "password"
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg ring-2 ring-indigo-300/60"
                                            : "bg-white/70 border text-slate-800 hover:bg-white/90"
                                            }`}
                                        onClick={() => setTab("password")}
                                        type="button"
                                    >
                                        <FaLock />
                                        Password
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10 mt-3 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

                            <div className="relative z-10">
                                {tab === "profile" ? (
                                    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                                        {/* Left profile card */}
                                        <div className="w-full">
                                            <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl p-6 shadow-sm">
                                                <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
                                                <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

                                                {/* BIG centered avatar */}
                                                <div className="relative flex flex-col items-center text-center">
                                                    <div className="relative">
                                                        <div className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500 blur opacity-60" />
                                                        <div className="relative h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-full border-4 border-white/70 bg-slate-100 shadow-xl">
                                                            {u.profileImage ? (
                                                                <img
                                                                    src={u.profileImage}
                                                                    alt="profile"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm font-extrabold">
                                                                    NO IMG
                                                                </div>
                                                            )}
                                                        </div>

                                                        <span
                                                            className={`absolute bottom-2 right-3 h-5 w-5 rounded-full border-2 border-white ${isActive ? "bg-emerald-500" : "bg-rose-500"
                                                                }`}
                                                        />
                                                        {isActive ? (
                                                            <span className="absolute bottom-2 right-3 h-5 w-5 rounded-full bg-emerald-400/40 animate-ping" />
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-4 text-lg font-semibold text-slate-900">
                                                        {u.name || "-"}
                                                    </div>
                                                    <div className="mt-1 text-xs font-semibold text-slate-700 break-all">
                                                        {u.email || "-"}
                                                    </div>

                                                    <div className="mt-3 inline-flex items-center rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow">
                                                        {roleLabel(u.role)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right fields */}
                                        <div className="w-full lg:col-span-2">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                {/* Icons fixed here */}
                                                <Field label="Employee ID" value={e.employeeId || "-"} icon={FaIdBadge} accent="teal" />
                                                <Field label="Contact Number" value={e.contactNumber || "-"} icon={FaPhoneAlt} accent="indigo" />

                                                <Field label="Gender" value={e.gender || "-"} icon={FaVenusMars} accent="rose" />
                                                <Field label="Marital Status" value={e.maritalStatus || "-"} icon={FaUserTie} accent="amber" />

                                                <Field label="Date of Birth" value={fmtDate(e.dob)} icon={FaBirthdayCake} accent="indigo" />
                                                <Field label="Date of Joining" value={fmtDate(e.doj)} icon={FaCalendarAlt} accent="rose" />

                                                <Field label="Qualification" value={e.qualification || "-"} icon={FaGraduationCap} accent="teal" />
                                                <Field label="Status" value={e.active || "-"} icon={FaShieldAlt} accent="amber" />

                                                <div className="sm:col-span-2 w-full">
                                                    <Field label="Address" value={e.address || "-"} icon={FaMapMarkerAlt} accent="indigo" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePasswordSave} className="mt-6">
                                        <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 shadow-sm">
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div>
                                                    <div className="text-lg font-semibold text-slate-900">Update Password</div>
                                                    <div className="text-xs text-slate-700">
                                                        Tip: use 8+ characters with uppercase, number & special.
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto flex items-center gap-2 rounded-full border bg-white/70 px-3 py-2">
                                                    <div className="text-[11px] font-extrabold text-slate-700">Strength</div>
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <span
                                                                key={i}
                                                                className={`h-2.5 w-6 rounded-full ${i < pwdScore ? "bg-gradient-to-r from-green-200 to-teal-700" : "bg-slate-200"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                <div className="sm:col-span-1">
                                                    <label className="text-xs font-semibold text-slate-700">Current Password</label>
                                                    <input
                                                        type="password"
                                                        value={pass.oldPassword}
                                                        onChange={(e2) => setPass((p) => ({ ...p, oldPassword: e2.target.value }))}
                                                        className="mt-2 w-full rounded-2xl border bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                        required
                                                    />
                                                </div>

                                                <div className="sm:col-span-1">
                                                    <label className="text-xs font-semibold text-slate-700">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={pass.newPassword}
                                                        onChange={(e2) => setPass((p) => ({ ...p, newPassword: e2.target.value }))}
                                                        className="mt-2 w-full rounded-2xl border bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                        required
                                                    />
                                                </div>

                                                <div className="sm:col-span-1">
                                                    <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                                                    <input
                                                        type="password"
                                                        value={pass.confirmPassword}
                                                        onChange={(e2) => setPass((p) => ({ ...p, confirmPassword: e2.target.value }))}
                                                        className="mt-2 w-full rounded-2xl border bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                        required
                                                    />

                                                    {pass.confirmPassword ? (
                                                        <div className="mt-2 text-xs font-bold flex items-center gap-2">
                                                            {pwdMatch ? (
                                                                <>
                                                                    <FaCheckCircle className="text-emerald-600" />
                                                                    <span className="text-emerald-700">Passwords match</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaTimesCircle className="text-rose-600" />
                                                                    <span className="text-rose-700">Passwords do not match</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-300 via-violet-300 to-rose-300 px-4 py-3 text-sm font-bold text-blue-700 shadow-lg hover:opacity-95"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="px-6 pb-6 text-center text-xs font-semibold text-slate-700">
                            If any profile detail is wrong, please contact HQ/Admin to update data.
                        </div>
                    </div>

                    <div className="mt-4 text-center text-xs font-extrabold text-slate-600">
                        UNIS ACADEMY
                    </div>
                </div>
            </div>
        </div>
    );
}
