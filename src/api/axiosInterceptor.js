import axios from "axios";
import {
  clearAuthSession,
  isLoginPage,
  redirectToLogin,
} from "../utils/sessionAuth";

let interceptorReady = false;
let redirecting = false;

const SESSION_CODES = new Set([
  "SESSION_EXPIRED",
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
  "TOKEN_NOT_PROVIDED",
  "USER_NOT_FOUND",
  "UNAUTHORIZED",
]);

const isLoginRequest = (url = "") => {
  const value = String(url || "").toLowerCase();

  return (
    value.includes("auth/login") ||
    value.endsWith("/login") ||
    value.includes("/login?")
  );
};

const isSessionFailure = (error) => {
  const status = Number(error?.response?.status || 0);
  const code = String(error?.response?.data?.code || "").toUpperCase();
  const message = String(
    error?.response?.data?.error || error?.response?.data?.message || ""
  ).toLowerCase();

  return (
    status === 401 ||
    SESSION_CODES.has(code) ||
    message.includes("session expired") ||
    message.includes("login failed / expired") ||
    message.includes("token not provided") ||
    message.includes("token not valid") ||
    message.includes("invalid token")
  );
};

export const setupAxiosInterceptor = () => {
  if (interceptorReady) return;
  interceptorReady = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const requestUrl = error?.config?.url || "";

      if (!isLoginRequest(requestUrl) && isSessionFailure(error)) {
        if (!redirecting) {
          redirecting = true;
          clearAuthSession();

          if (!isLoginPage()) {
            redirectToLogin("session-expired");
          }
        }

        error.__UNIS_SESSION_REDIRECT__ = true;
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );
};
