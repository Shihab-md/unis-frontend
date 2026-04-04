import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getBaseUrl, showSwalAlert } from "../../utils/CommonHelper";
import { FaRegTimesCircle } from "react-icons/fa";

const PASSWORD_RULE_TEXT =
  "Must be 8–64 chars, include uppercase, lowercase, number, and special character.";

const isStrongPassword = (password) => {
  const value = String(password || "");
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/.test(value);
};

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
    const trimmedNewPassword = String(newPassword || "");
    const trimmedConfirmPassword = String(confirmPassword || "");

    if (!trimmedLoginId) {
      showSwalAlert("Warning!", "Please enter User ID.", "warning");
      return;
    }

    if (!matchedUser) {
      showSwalAlert("Warning!", "Please search and select a valid user first.", "warning");
      return;
    }

    if (!trimmedNewPassword || !trimmedConfirmPassword) {
      showSwalAlert("Warning!", "Please enter password and confirm password.", "warning");
      return;
    }

    if (!isStrongPassword(trimmedNewPassword)) {
      showSwalAlert("Warning!", PASSWORD_RULE_TEXT, "warning");
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      showSwalAlert("Warning!", "Password and confirm password do not match.", "warning");
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
          newPassword: trimmedNewPassword,
          confirmPassword: trimmedConfirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res?.data?.success) {
        showSwalAlert(
          "Success!",
          res?.data?.message || "Password reset successful.",
          "success"
        );
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
      <div
        className="mx-auto max-w-lg mt-5 rounded-md border border-slate-200 bg-white shadow-lg transition-all duration-200 bg-[url('/c-6.jpg')] bg-center bg-no-repeat hover:-translate-y-0.5 hover:shadow-xl"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 254, 254, 0.80), rgba(255, 255, 255, 0.90)), url('/c-6.jpg')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="flex items-center justify-center rounded-t-md bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-3 shadow-lg">
          <h1 className="text-base font-semibold text-white">Reset Password</h1>
          <Link to="/dashboard/masters">
            <FaRegTimesCircle className="ml-4 rounded-full bg-white/90 p-1 text-2xl text-red-600 shadow-md md:ml-7" />
          </Link>
        </div>

        <div className="p-4 space-y-4">
          <form onSubmit={handleSearchUser} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-600">
                Login User ID <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
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
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 shadow-lg">
              <h2 className="text-xs font-semibold text-slate-700 mb-3">Matched User</h2>

              <div className="grid grid-cols-1 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Name:</span>
                  <div className="font-xs text-slate-800">{matchedUser.name || "-"}</div>
                </div>

                <div>
                  <span className="text-slate-500">Role:</span>
                  <div className="font-xs text-slate-800">{matchedUser.role || "-"}</div>
                </div>

                <div>
                  <span className="text-slate-500">Login Email:</span>
                  <div className="font-xs text-slate-800">{matchedUser.email || "-"}</div>
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
              <p className="mt-1 text-[11px] text-slate-500">{PASSWORD_RULE_TEXT}</p>
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