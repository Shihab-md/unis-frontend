export async function downloadFile(url, filename) {
  const token = localStorage.getItem("token");
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) {
    const j = await resp.json().catch(() => ({}));
    throw new Error(j?.error || "Download failed");
  }
  const blob = await resp.blob();
  const a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(a.href);
}