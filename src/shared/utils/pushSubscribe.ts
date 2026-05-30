const API_BASE = import.meta.env.VITE_API_BASE;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestPushPermission(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  // Don't re-ask if already denied
  if (Notification.permission === "denied") {
    return false;
  }

  // Already granted — just subscribe
  if (Notification.permission === "granted") {
    await subscribeToPush();
    return true;
  }

  // Ask permission
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await subscribeToPush();
    return true;
  }

  return false;
}

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  // Check if already subscribed
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await saveSubscription(existing);
    return;
  }

  // Get VAPID key from backend
  const keyRes = await fetch(`${API_BASE}/api/push/vapid-key`, {
    credentials: "include",
  });
  const keyData = await keyRes.json();
  const vapidKey = keyData?.data?.vapidPublicKey;

  if (!vapidKey) {
    console.warn("VAPID public key not configured on server");
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  await saveSubscription(subscription);
}

async function saveSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON();
  await fetch(`${API_BASE}/api/push/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
    }),
  });
}
