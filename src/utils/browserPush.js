import { notificationApi } from "../api/notificationApi";

const serviceWorkerPath = "/unis-push-sw.js";

export const isBrowserPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function getBrowserPushRegistration() {
  if (!isBrowserPushSupported()) return null;
  return navigator.serviceWorker.register(serviceWorkerPath, { scope: "/" });
}

export async function getBrowserPushStatus() {
  if (!isBrowserPushSupported()) return { supported: false, permission: "unsupported", subscribed: false, configured: false };
  const keyInfo = await notificationApi.webPublicKey().catch(() => ({ configured: false }));
  const registration = await getBrowserPushRegistration();
  const subscription = registration ? await registration.pushManager.getSubscription() : null;
  return {
    supported: true,
    permission: Notification.permission,
    subscribed: Boolean(subscription),
    configured: Boolean(keyInfo?.configured && keyInfo?.publicKey),
  };
}

export async function enableBrowserPush() {
  if (!isBrowserPushSupported()) throw new Error("Browser push notifications are not supported in this browser.");
  const keyInfo = await notificationApi.webPublicKey();
  if (!keyInfo?.configured || !keyInfo?.publicKey) {
    throw new Error("Browser push is not configured on the UNIS server yet. In-app notifications are still available.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Browser notification permission was not granted.");

  const registration = await getBrowserPushRegistration();
  if (!registration) throw new Error("Unable to register the UNIS notification service worker.");
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyInfo.publicKey),
    });
  }
  await notificationApi.webSubscribe(subscription.toJSON());
  return subscription;
}

export async function disableBrowserPush({ notifyServer = true } = {}) {
  if (!isBrowserPushSupported()) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration(serviceWorkerPath) || await navigator.serviceWorker.getRegistration();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;
    if (!subscription) return;
    if (notifyServer && localStorage.getItem("token")) {
      await notificationApi.webUnsubscribe(subscription.endpoint).catch(() => null);
    }
    await subscription.unsubscribe().catch(() => null);
  } catch (error) {
    console.warn("UNIS browser push cleanup failed.", error);
  }
}
