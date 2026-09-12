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
import { AutoText, useLanguage } from "../../i18n/LanguageContext";

const ChangePassword = () => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tr, direction, fontFamily } = useLanguage();

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
      const msg = tr(validatePassword(value));
      setErrors((prev) => ({ ...prev, newPassword: msg, form: "" }));

      // If confirm already typed, re-check match
      if (setting.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            value !== setting.confirmPassword ? tr("New Password and Confirm Password are not matched") : "",
        }));
      }
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== setting.newPassword ? tr("New Password and Confirm Password are not matched") : "",
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
      setErrors((prev) => ({ ...prev, oldPassword: tr("Old Password is required") }));
      return;
    }

    // Validate new password strength
    const newErr = tr(validatePassword(setting.newPassword));
    if (newErr) {
      setErrors((prev) => ({ ...prev, newPassword: newErr }));
      return;
    }

    // Validate confirm match
    if (setting.newPassword !== setting.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: tr("New Password and Confirm Password are not matched"),
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
        error?.response?.data?.error || tr("Server error while changing password");
      setErrors((prev) => ({ ...prev, form: msg }));
      showSwalAlert("Error!", msg, "error");
    }
  };

  if (processing) return getPrcessing();

  return (
    <div dir={direction} style={{ fontFamily }} className="max-w-3xl mx-auto mt-10 p-7 rounded-md shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <AutoText as="h2" text={tr("Change Password")} variant="heading" className="font-semibold items-center justify-center" />
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
              {tr("Old Password")} <span className="text-red-700">*</span>
            </label>
            <input
              type="password"
              name="oldPassword"
              placeholder={tr("Old Password")}
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
              {tr("New Password")} <span className="text-red-700">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder={tr("New Password")}
              value={setting.newPassword}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
              pattern={PASSWORD_REGEX.source}
              title={tr("Password requirements")}
            />
            {errors.newPassword ? (
              <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
            ) : (
              <p className="text-slate-500 text-xs mt-1">
                {tr("Password requirements")}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mt-5 mb-5">
            <label className="text-sm mt-5 mb-5 font-medium text-slate-500">
              {tr("Confirm Password")} <span className="text-red-700">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder={tr("Confirm Password")}
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
          <AutoText as="span" text={tr("Change Password")} variant="button" />
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
