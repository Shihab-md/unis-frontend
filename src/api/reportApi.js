import { getBaseUrl } from "../utils/CommonHelper";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" });
const aborted = (signal) => { if (signal?.aborted) throw new DOMException("Request cancelled", "AbortError"); };
export async function fetchReport(path, { signal } = {}) {
  const base = await getBaseUrl();
  aborted(signal);
  const response = await fetch(`${base}${path}`, { headers: headers(), signal });
  const data = await response.json();
  aborted(signal);
  if (!response.ok || data?.success === false) throw new Error(data?.error || `Request failed (${response.status})`);
  if (!data || typeof data !== "object") throw new Error("Invalid report response");
  return data;
}

export async function downloadReport(path, filename, { signal } = {}) {
  const base = await getBaseUrl();
  aborted(signal);
  const response = await fetch(`${base}${path}`, { headers: headers(), signal });
  if (!response.ok || String(response.headers.get("content-type") || "").includes("application/json")) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Download failed (${response.status})`);
  }
  const blob = await response.blob();
  aborted(signal);
  if (!blob.size) throw new Error("The report download was empty. Please try again.");
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  try {
    anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }
}
