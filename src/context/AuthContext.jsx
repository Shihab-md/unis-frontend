import axios from "axios";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getBaseUrl,
  showSwalAlert,
  showConfirmationSwalAlert,
  removeLocalStorage,
} from "../utils/CommonHelper";
import { disableBrowserPush } from "../utils/browserPush";
import {
  clearAuthSession,
  getActiveWindowMs,
  getJwtExpiryDelay,
  getSafeTimeoutDelay,
  isJwtExpired,
  isJwtNearExpiry,
  persistAuthSession,
  redirectToLogin,
} from "../utils/sessionAuth";

const userContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const expiryTimerRef = useRef(null);
  const refreshCheckTimerRef = useRef(null);
  const redirectingRef = useRef(false);
  const refreshPromiseRef = useRef(null);
  const lastActivityAtRef = useRef(0);
  const lastActivityEventAtRef = useRef(0);

  const clearSessionTimers = useCallback(() => {
    if (expiryTimerRef.current) {
      window.clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }

    if (refreshCheckTimerRef.current) {
      window.clearInterval(refreshCheckTimerRef.current);
      refreshCheckTimerRef.current = null;
    }
  }, []);

  const expireCurrentSession = useCallback(
    (reason = "session-expired") => {
      if (redirectingRef.current) return;
      redirectingRef.current = true;

      clearSessionTimers();
      setUser(null);
      setLoading(false);
      clearAuthSession();

      window.setTimeout(() => {
        redirectToLogin(reason);
      }, 0);
    },
    [clearSessionTimers]
  );

  const wasRecentlyActive = useCallback(() => {
    const activeWindowMs = getActiveWindowMs();
    return Date.now() - Number(lastActivityAtRef.current || 0) <= activeWindowMs;
  }, []);

  const scheduleSessionTimers = useCallback(
    (tokenArg) => {
      clearSessionTimers();

      const token = tokenArg || localStorage.getItem("token");
      if (!token) return;

      const delayMs = getJwtExpiryDelay(token);
      if (delayMs === null) return;

      if (delayMs <= 0) {
        expireCurrentSession("session-expired");
        return;
      }

      expiryTimerRef.current = window.setTimeout(() => {
        expireCurrentSession("session-expired");
      }, getSafeTimeoutDelay(delayMs));

      refreshCheckTimerRef.current = window.setInterval(() => {
        const currentToken = localStorage.getItem("token");
        if (!currentToken) return;

        if (isJwtExpired(currentToken, 1000)) {
          expireCurrentSession("session-expired");
          return;
        }

        if (isJwtNearExpiry(currentToken) && wasRecentlyActive()) {
          window.dispatchEvent(new Event("unis:silent-refresh"));
        }
      }, 15000);
    },
    [clearSessionTimers, expireCurrentSession, wasRecentlyActive]
  );

  const refreshSessionToken = useCallback(
    async ({ force = false } = {}) => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return null;
      }

      if (isJwtExpired(token, 1000)) {
        expireCurrentSession("session-expired");
        return null;
      }

      if (!force && !isJwtNearExpiry(token)) {
        scheduleSessionTimers(token);
        return null;
      }

      if (!force && !wasRecentlyActive()) {
        scheduleSessionTimers(token);
        return null;
      }

      if (refreshPromiseRef.current) return refreshPromiseRef.current;

      refreshPromiseRef.current = (async () => {
        try {
          const response = await axios.post(
            (await getBaseUrl()).toString() + "auth/refresh",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const newToken = response?.data?.token;
          const refreshedUser = response?.data?.user;

          if (!newToken || !refreshedUser) {
            scheduleSessionTimers(token);
            return null;
          }

          redirectingRef.current = false;
          persistAuthSession({ token: newToken, user: refreshedUser });
          setUser(refreshedUser);
          scheduleSessionTimers(newToken);

          return { token: newToken, user: refreshedUser };
        } catch (error) {
          const status = Number(error?.response?.status || 0);

          if (status === 401 || error?.__UNIS_SESSION_REDIRECT__) {
            expireCurrentSession("session-expired");
            return null;
          }

          // Network/server refresh failure should not immediately logout while current token is still valid.
          scheduleSessionTimers(token);
          return null;
        } finally {
          refreshPromiseRef.current = null;
        }
      })();

      return refreshPromiseRef.current;
    },
    [expireCurrentSession, scheduleSessionTimers, wasRecentlyActive]
  );

  const recordActivity = useCallback(() => {
    const now = Date.now();

    if (now - Number(lastActivityEventAtRef.current || 0) < 5000) return;

    lastActivityEventAtRef.current = now;
    lastActivityAtRef.current = now;

    const token = localStorage.getItem("token");
    if (token && isJwtNearExpiry(token)) {
      refreshSessionToken({ force: false }).catch(() => null);
    }
  }, [refreshSessionToken]);

  const checkCurrentTokenExpiryOrRefresh = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (isJwtExpired(token, 1000)) {
      expireCurrentSession("session-expired");
      return;
    }

    if (isJwtNearExpiry(token) && wasRecentlyActive()) {
      refreshSessionToken({ force: false }).catch(() => null);
      return;
    }

    scheduleSessionTimers(token);
  }, [expireCurrentSession, refreshSessionToken, scheduleSessionTimers, wasRecentlyActive]);

  useEffect(() => {
    const onSilentRefresh = () => {
      refreshSessionToken({ force: false }).catch(() => null);
    };

    window.addEventListener("unis:silent-refresh", onSilentRefresh);
    return () => window.removeEventListener("unis:silent-refresh", onSilentRefresh);
  }, [refreshSessionToken]);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          return;
        }

        if (isJwtExpired(token, 1000)) {
          expireCurrentSession("session-expired");
          return;
        }

        const response = await axios.get(
          (await getBaseUrl()).toString() + "auth/verify",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setUser(response.data.user);
          scheduleSessionTimers(token);
          refreshSessionToken({ force: false }).catch(() => null);
        } else {
          setUser(null);
        }
      } catch (error) {
        const status = Number(error?.response?.status || 0);

        if (status === 401 || error?.__UNIS_SESSION_REDIRECT__) {
          expireCurrentSession("session-expired");
          return;
        }

        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [expireCurrentSession, refreshSessionToken, scheduleSessionTimers]);

  useEffect(() => {
    const activityEvents = ["click", "keydown", "mousemove", "touchstart", "scroll"];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
    };
  }, [recordActivity]);

  useEffect(() => {
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === "hidden") return;

      lastActivityAtRef.current = Date.now();
      checkCurrentTokenExpiryOrRefresh();
    };

    window.addEventListener("focus", handleFocusOrVisibility);
    document.addEventListener("visibilitychange", handleFocusOrVisibility);

    return () => {
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
    };
  }, [checkCurrentTokenExpiryOrRefresh]);

  useEffect(() => {
    if (!user) return undefined;

    scheduleSessionTimers();

    return clearSessionTimers;
  }, [user, scheduleSessionTimers, clearSessionTimers]);

  const login = (loggedInUser) => {
    redirectingRef.current = false;
    lastActivityAtRef.current = Date.now();
    setUser(loggedInUser);
    scheduleSessionTimers();
  };

  const logout = async () => {
    const result = await showConfirmationSwalAlert(
      "Are you sure to Logout?",
      "",
      "warning"
    );

    if (result.isConfirmed) {
      showSwalAlert("Success!", "Successfully Logged out!", "success");

      await disableBrowserPush({ notifyServer: true }).catch(() => null);

      clearSessionTimers();
      setUser(null);
      clearAuthSession();
      removeLocalStorage();
    }
  };

  return (
    <userContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </userContext.Provider>
  );
};

export const useAuth = () => (userContext ? useContext(userContext) : null);
export default AuthContext;
