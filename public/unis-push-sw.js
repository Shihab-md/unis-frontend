self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  const title = String(data.title || "UNIS Academy");
  const body = String(data.body || "You have a new UNIS notification.");
  const webPath = typeof data.webPath === "string" && data.webPath.startsWith("/dashboard") && !data.webPath.startsWith("//")
    ? data.webPath
    : "/dashboard/notifications";
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/UNIS_logo_3D.png",
    badge: "/UNIS_logo_3D.png",
    tag: data.notificationId ? `unis-${data.notificationId}` : undefined,
    data: { webPath },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawPath = event.notification?.data?.webPath;
  const path = typeof rawPath === "string" && rawPath.startsWith("/dashboard") && !rawPath.startsWith("//")
    ? rawPath
    : "/dashboard/notifications";
  const targetUrl = new URL(path, self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin) {
        await client.focus();
        if ("navigate" in client) await client.navigate(targetUrl);
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});
