import { useState } from "react";
import axios from "axios";
import { getBaseUrl, showSwalAlert } from "../../utils/CommonHelper";

const ResetPassword = () => {
    const [loginId, setLoginId] = useState("");
    const [matchedUser, setMatchedUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const getApiUrl = async (path) => {
        const baseUrl = String(await getBaseUrl()).replace(/\/+$/, "");
        return `${baseUrl}/${path.replace(/^\/+/, "")}`;
    };

    const handleSearchUser = async (e) => {
        e.preventDefault();

        const trimmedLoginId = String(loginId || "").trim();
        if (!trimmedLoginId) {
            showSwalAlert("Warning!", "Please enter User ID.", "warning");
            return;
        }

        try {
            setSearchLoading(true);
            setMatchedUser(null);

            const token = localStorage.getItem("token");
            const url = await getApiUrl("resetPass/reset-password/find-user");

            const res = await axios.post(
                url,
                { loginId: trimmedLoginId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res?.data?.success && res?.data?.user) {
                setMatchedUser(res.data.user);
                showSwalAlert("Success!", "User found.", "success");
            } else {
                setMatchedUser(null);
                showSwalAlert("Warning!", res?.data?.error || "User not found.", "warning");
            }
        } catch (error) {
            console.log(error);
            setMatchedUser(null);
            showSwalAlert(
                "Warning!",
                error?.response?.data?.error || "User not found.",
                "warning"
            );
        } finally {
            setSearchLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const trimmedLoginId = String(loginId || "").trim();

        if (!trimmedLoginId) {
            showSwalAlert("Warning!", "Please enter User ID.", "warning");
            return;
        }

        if (!matchedUser) {
            showSwalAlert("Warning!", "Please search and select a valid user first.", "warning");
            return;
        }

        if (!newPassword || !confirmPassword) {
            showSwalAlert("Warning!", "Please enter password and confirm password.", "warning");
            return;
        }

        if (newPassword !== confirmPassword) {
            showSwalAlert("Warning!", "Password and confirm password do not match.", "warning");
            return;
        }

        if (newPassword.length < 6) {
            showSwalAlert("Warning!", "Password must be at least 6 characters.", "warning");
            return;
        }

        try {
            setSubmitLoading(true);

            const token = localStorage.getItem("token");
            const url = await getApiUrl("resetPass/reset-password/submit");

            const res = await axios.post(
                url,
                {
                    loginId: trimmedLoginId,
                    newPassword,
                    confirmPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res?.data?.success) {
                showSwalAlert("Success!", res?.data?.message || "Password reset successful.", "success");
                setLoginId("");
                setMatchedUser(null);
                setNewPassword("");
                setConfirmPassword("");
            } else {
                showSwalAlert("Warning!", res?.data?.error || "Password reset failed.", "warning");
            }
        } catch (error) {
            console.log(error);
            showSwalAlert(
                "Warning!",
                error?.response?.data?.error || "Password reset failed.",
                "warning"
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="p-3 sm:p-4">
            <div className="mx-auto max-w-3xl mt-5 rounded-md border border-slate-200 bg-white shadow-lg transition-all duration-200
            bg-[url('/c-6.jpg')] bg-center bg-no-repeat hover:-translate-y-0.5 hover:shadow-xl"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255, 254, 254, 0.80), rgba(255, 255, 255, 0.90)), url('/c-6.jpg')",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                }}>

                <div className="rounded-t-md bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-3 shadow-lg">
                    <h1 className="text-xs sm:text-base font-semibold text-white">Reset Password</h1>
                    <p className="text-xs sm:text-sm text-sky-50 mt-1">
                        Search by Login UserId.
                    </p>
                </div>

                <div className="p-4 space-y-4">
                    <form onSubmit={handleSearchUser} className="space-y-3">
                        <div>
                            <label className="block text-sm font-base text-slate-600">
                                Login User ID <span className="text-red-700">*</span>
                            </label>
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                //placeholder="Enter Login UserId"
                                className="mt-2 p-1.5 block w-full text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={searchLoading}
                                className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
                            >
                                {searchLoading ? "Searching..." : "Search User"}
                            </button>
                        </div>
                    </form>

                    {matchedUser && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h2 className="text-sm font-semibold text-slate-700 mb-3">Matched User</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-slate-500">Name:</span>
                                    <div className="font-medium text-slate-800">{matchedUser.name || "-"}</div>
                                </div>

                                <div>
                                    <span className="text-slate-500">Role:</span>
                                    <div className="font-medium text-slate-800">{matchedUser.role || "-"}</div>
                                </div>

                                <div>
                                    <span className="text-slate-500">User ID:</span>
                                    <div className="font-medium text-slate-800">{matchedUser.loginId || "-"}</div>
                                </div>

                                <div>
                                    <span className="text-slate-500">Login Email:</span>
                                    <div className="font-medium text-slate-800">{matchedUser.email || "-"}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-3">
                        <div>
                            <label className="block text-sm font-base text-slate-600">
                                New Password <span className="text-red-700">*</span>
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-2 p-1.5 block w-full border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-base text-slate-600">
                                Confirm Password <span className="text-red-700">*</span>
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-2 p-1.5 block w-full border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
                            >
                                {submitLoading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;