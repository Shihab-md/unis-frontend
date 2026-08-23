const AUTH_STORAGE_KEYS = [
  "token",
  "role",
  "user",
  "userId",
  "schoolId",
  "schoolName",
  "schoolIds",
  "schools",
];

const MAX_BROWSER_TIMEOUT_MS = 2147483000;
const DEFAULT_REFRESH_BEFORE_EXPIRY_MS = 30 * 60 * 1000;
const DEFAULT_ACTIVE_WINDOW_MS = 60 * 1000;

const getEnvNumber = (key, fallback) => {
  try {
    const value = Number(import.meta?.env?.[key]);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  } catch {
    return fallback;
  }
};

const base64UrlDecode = (value = "") => {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  return atob(padded);
};

export const getJwtPayload = (token) => {
  try {
    const payloadPart = String(token || "").split(".")[1];
    if (!payloadPart) return null;

    return JSON.parse(base64UrlDecode(payloadPart));
  } catch {
    return null;
  }
};

export const getJwtExpiryTime = (token) => {
  const payload = getJwtPayload(token);
  const exp = Number(payload?.exp || 0);

  return exp > 0 ? exp * 1000 : null;
};

export const getJwtIssuedAtTime = (token) => {
  const payload = getJwtPayload(token);
  const iat = Number(payload?.iat || 0);

  return iat > 0 ? iat * 1000 : null;
};

export const getJwtLifetimeMs = (token) => {
  const issuedAt = getJwtIssuedAtTime(token);
  const expiryTime = getJwtExpiryTime(token);

  if (!issuedAt || !expiryTime || expiryTime <= issuedAt) return null;
  return expiryTime - issuedAt;
};

export const isJwtExpired = (token, graceMs = 0) => {
  const expiryTime = getJwtExpiryTime(token);
  if (!expiryTime) return false;

  return Date.now() + Number(graceMs || 0) >= expiryTime;
};

export const getJwtExpiryDelay = (token) => {
  const expiryTime = getJwtExpiryTime(token);
  if (!expiryTime) return null;

  return expiryTime - Date.now();
};

export const getSafeTimeoutDelay = (delayMs) => {
  const delay = Number(delayMs || 0);
  if (!Number.isFinite(delay) || delay <= 0) return 0;

  return Math.min(delay, MAX_BROWSER_TIMEOUT_MS);
};

export const getSessionRefreshWindowMs = (token) => {
  const configured = getEnvNumber(
    "VITE_SESSION_REFRESH_BEFORE_EXPIRY_MS",
    DEFAULT_REFRESH_BEFORE_EXPIRY_MS
  );
  const lifetime = getJwtLifetimeMs(token);

  if (!lifetime) return configured;

  // For local 2-minute testing, this makes refresh happen near the end instead of immediately.
  return Math.max(15 * 1000, Math.min(configured, Math.floor(lifetime * 0.4)));
};

export const getActiveWindowMs = () =>
  getEnvNumber("VITE_SESSION_ACTIVE_WINDOW_MS", DEFAULT_ACTIVE_WINDOW_MS);

export const isJwtNearExpiry = (token) => {
  const remaining = getJwtExpiryDelay(token);
  if (remaining === null) return false;

  return remaining <= getSessionRefreshWindowMs(token);
};

export const clearAuthSession = () => {
  try {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
  } catch {
    // Storage cleanup should never block redirect.
  }
};

export const persistAuthSession = ({ token, user }) => {
  try {
    if (token) localStorage.setItem("token", token);

    if (user?._id) localStorage.setItem("userId", user._id);
    if (user?.role) localStorage.setItem("role", user.role);

    if (user?.schoolId) {
      localStorage.setItem("schoolId", user.schoolId);
    } else {
      localStorage.removeItem("schoolId");
    }

    if (user?.schoolName) {
      localStorage.setItem("schoolName", user.schoolName);
    } else {
      localStorage.removeItem("schoolName");
    }

    if (String(user?.role || "").toLowerCase() === "supervisor") {
      localStorage.setItem("schoolIds", JSON.stringify(user?.schoolIds || []));
      localStorage.setItem("schools", JSON.stringify(user?.schools || []));
    } else {
      localStorage.removeItem("schoolIds");
      localStorage.removeItem("schools");
    }
  } catch {
    // Storage write failure should not crash the app.
  }
};

export const isLoginPage = () => {
  try {
    return window.location.pathname === "/login";
  } catch {
    return false;
  }
};

export const redirectToLogin = (reason = "session-expired") => {
  try {
    if (reason === "session-expired") {
      sessionStorage.setItem(
        "UNIS_LOGIN_MESSAGE",
        "Session expired. Please login again."
      );
    }

    const suffix = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    const target = `${window.location.origin}/login${suffix}`;

    window.location.replace(target);

    window.setTimeout(() => {
      if (window.location.pathname !== "/login") {
        window.location.href = target;
      }
    }, 100);
  } catch {
    window.location.href = "/login";
  }
};

export const expireAndRedirectToLogin = (reason = "session-expired") => {
  clearAuthSession();

  if (!isLoginPage()) {
    redirectToLogin(reason);
  }
};
