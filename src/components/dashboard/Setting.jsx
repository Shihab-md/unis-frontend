import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  getPrcessing,
  showSwalAlert,
  validatePassword,
  PASSWORD_REGEX,
  isPasswordStrong,
} from "../../utils/CommonHelper";
import { FaRegTimesCircle } from "react-icons/fa";

const Setting = () => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [setting, setSetting] = useState({
    userId: user?._id,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    form: "",
  });

  // Run once (don’t execute on every render)
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  // In case user is loaded after first render
  useEffect(() => {
    if (user?._id) {
      setSetting((prev) => ({ ...prev, userId: user._id }));
    }
  }, [user?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSetting((prev) => ({ ...prev, [name]: value }));

    // Live validation
    if (name === "newPassword") {
      const msg = validatePassword(value);
      setErrors((prev) => ({ ...prev, newPassword: msg, form: "" }));

      // If confirm already typed, re-check match
      if (setting.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            value !== setting.confirmPassword ? "New Password and Confirm Password are not matched" : "",
        }));
      }
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== setting.newPassword ? "New Password and Confirm Password are not matched" : "",
        form: "",
      }));
    }

    if (name === "oldPassword") {
      // Just clear old password error once user types
      setErrors((prev) => ({ ...prev, oldPassword: "", form: "" }));
    }
  };

  const canSubmit = useMemo(() => {
    const oldOk = !!setting.oldPassword?.trim();
    const newOk = isPasswordStrong(setting.newPassword);
    const confirmOk =
      !!setting.confirmPassword?.trim() && setting.newPassword === setting.confirmPassword;

    return oldOk && newOk && confirmOk && !processing;
  }, [setting.oldPassword, setting.newPassword, setting.confirmPassword, processing]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset form-level error
    setErrors((prev) => ({ ...prev, form: "" }));

    // Validate old password presence
    if (!setting.oldPassword?.trim()) {
      setErrors((prev) => ({ ...prev, oldPassword: "Old Password is required" }));
      return;
    }

    // Validate new password strength
    const newErr = validatePassword(setting.newPassword);
    if (newErr) {
      setErrors((prev) => ({ ...prev, newPassword: newErr }));
      return;
    }

    // Validate confirm match
    if (setting.newPassword !== setting.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "New Password and Confirm Password are not matched",
      }));
      return;
    }

    setProcessing(true);

    try {
      // Send only what backend needs (don’t send confirmPassword)
      const payload = {
        //userId: setting.userId,
        oldPassword: setting.oldPassword,
        newPassword: setting.newPassword,
      };

      const response = await axios.put(
        (await getBaseUrl()).toString() + "setting/change-password",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Password changed Successfully...!", "success");
        navigate("/dashboard");
      } else {
        setProcessing(false);
        const msg = response.data.error || "Password change failed";
        setErrors((prev) => ({ ...prev, form: msg }));
        showSwalAlert("Error!", msg, "error");
      }
    } catch (error) {
      setProcessing(false);
      const msg =
        error?.response?.data?.error || "Server error while changing password";
      setErrors((prev) => ({ ...prev, form: msg }));
      showSwalAlert("Error!", msg, "error");
    }
  };

  if (processing) return getPrcessing();

  return (
    <div className="max-w-3xl mx-auto mt-10 p-7 rounded-md shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">
          Change Password
        </h2>
        <Link to="/dashboard">
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>

      {errors.form ? (
        <p className="text-red-600 text-sm mt-3">{errors.form}</p>
      ) : null}

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
          {/* Old Password */}
          <div className="mt-5">
            <label className="text-sm font-medium text-slate-500">
              Old Password <span className="text-red-700">*</span>
            </label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Old Password"
              value={setting.oldPassword}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {errors.oldPassword ? (
              <p className="text-red-600 text-sm mt-1">{errors.oldPassword}</p>
            ) : null}
          </div>

          {/* New Password */}
          <div className="mt-5">
            <label className="text-sm mt-5 font-medium text-slate-500">
              New Password <span className="text-red-700">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={setting.newPassword}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
              pattern={PASSWORD_REGEX.source}
              title="8-64 chars, 1 uppercase, 1 lowercase, 1 number, 1 special, no spaces"
            />
            {errors.newPassword ? (
              <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
            ) : (
              <p className="text-slate-500 text-xs mt-1">
                Must be 8–64 chars, include uppercase, lowercase, number, and special character.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mt-5 mb-5">
            <label className="text-sm mt-5 mb-5 font-medium text-slate-500">
              Confirm Password <span className="text-red-700">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={setting.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {errors.confirmPassword ? (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:opacity-50"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default Setting;
