const ENVIRONMENTS = new Set(["production", "staging", "development"]);

const STAGING_FRONTEND_HOST = "staging.unis.org.in";
const PRODUCTION_FRONTEND_HOSTS = new Set(["unis.org.in", "www.unis.org.in"]);
const STAGING_API_BASE_URL = "https://staging-api.unis.org.in/api/";
const PRODUCTION_API_FALLBACK = "https://unis-server.vercel.app/api/";
const DEVELOPMENT_API_FALLBACK = "http://localhost:5001/api/";

const getHostname = () => {
  if (typeof window === "undefined" || !window.location?.hostname) return "";
  return String(window.location.hostname).trim().toLowerCase();
};

const inferEnvironmentFromHostname = () => {
  const hostname = getHostname();

  if (hostname === STAGING_FRONTEND_HOST) return "staging";
  if (hostname === "localhost" || hostname === "127.0.0.1") return "development";
  return "production";
};

export const getAppEnvironment = () => {
  const configured = String(import.meta.env.VITE_APP_ENV || "")
    .trim()
    .toLowerCase();

  const environment = configured || inferEnvironmentFromHostname();

  if (!ENVIRONMENTS.has(environment)) {
    throw new Error(
      `Invalid VITE_APP_ENV '${configured}'. Expected production, staging, or development.`
    );
  }

  const hostname = getHostname();

  if (hostname === STAGING_FRONTEND_HOST && environment !== "staging") {
    throw new Error(
      "UNIS environment safety block: staging.unis.org.in must run with VITE_APP_ENV=staging."
    );
  }

  if (PRODUCTION_FRONTEND_HOSTS.has(hostname) && environment === "staging") {
    throw new Error(
      "UNIS environment safety block: the production frontend domain cannot run with VITE_APP_ENV=staging."
    );
  }

  return environment;
};

const normalizeApiBaseUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("VITE_API_BASE_URL must be a valid absolute http(s) URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL must use http or https.");
  }

  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = `${parsed.pathname.replace(/\/+$/, "")}/`;

  return parsed.toString();
};

const isLocalApiHost = (hostname) => {
  const host = String(hostname || "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

const assertSafeApiForEnvironment = (environment, apiBaseUrl) => {
  const parsed = new URL(apiBaseUrl);

  if (environment === "staging") {
    if (apiBaseUrl !== STAGING_API_BASE_URL) {
      throw new Error(
        `UNIS environment safety block: staging must use ${STAGING_API_BASE_URL}`
      );
    }
    return;
  }

  if (environment === "production") {
    if (parsed.protocol !== "https:") {
      throw new Error("UNIS environment safety block: production API must use HTTPS.");
    }

    if (parsed.hostname === "staging-api.unis.org.in" || isLocalApiHost(parsed.hostname)) {
      throw new Error(
        "UNIS environment safety block: production cannot use the staging or local API."
      );
    }
  }
};

export const getApiBaseUrl = () => {
  const environment = getAppEnvironment();
  const configured = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

  let apiBaseUrl = configured;

  if (!apiBaseUrl) {
    if (environment === "staging") {
      throw new Error(
        "UNIS environment safety block: VITE_API_BASE_URL is required for staging."
      );
    }

    apiBaseUrl =
      environment === "development"
        ? DEVELOPMENT_API_FALLBACK
        : PRODUCTION_API_FALLBACK;
  }

  assertSafeApiForEnvironment(environment, apiBaseUrl);
  return apiBaseUrl;
};

export const isStagingEnvironment = () => getAppEnvironment() === "staging";

export const FRONTEND_ENVIRONMENT = Object.freeze({
  stagingFrontendHost: STAGING_FRONTEND_HOST,
  stagingApiBaseUrl: STAGING_API_BASE_URL,
  productionApiFallback: PRODUCTION_API_FALLBACK,
  developmentApiFallback: DEVELOPMENT_API_FALLBACK,
});
