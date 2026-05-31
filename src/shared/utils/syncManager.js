import { getQueue, replayQueue, getQueueSize } from "./offlineQueue";
import { clearAllCache } from "./offlineCache";

const API_BASE = import.meta.env.VITE_API_BASE;
const getAuthToken = () => localStorage.getItem("user_token");

let _isSyncing = false;
let _onSyncStart = null;
let _onSyncComplete = null;
let _onSyncError = null;

async function sendRequest(url, method, body) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body || undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, status: res.status, message: data.message };
  }

  return { ok: true, data: data.data ?? data };
}

/**
 * Ping the server health endpoint until it responds.
 * Render free tier spins down after 15min — first request takes 30-60s.
 * @returns {Promise<boolean>} true if server is awake, false if max retries exceeded
 */
async function wakeUpServer() {
  const MAX_WAKE_RETRIES = 12; // 12 * 5s = 60s max wait
  const WAKE_INTERVAL = 5000;

  window.dispatchEvent(new CustomEvent("sw-server-waking"));

  for (let attempt = 0; attempt < MAX_WAKE_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, WAKE_INTERVAL));
  }

  return false;
}

async function syncQueue() {
  if (_isSyncing) return;
  if (getQueueSize() === 0) return;

  _isSyncing = true;

  // Wake up the server first (handles Render cold start)
  const isAwake = await wakeUpServer();
  if (!isAwake) {
    _isSyncing = false;
    if (_onSyncError) _onSyncError({ synced: 0, failed: getQueueSize(), reason: "server_unreachable" });
    return;
  }

  const count = getQueueSize();
  if (_onSyncStart) _onSyncStart(count);

  try {
    const results = await replayQueue(sendRequest);
    const failed = results.filter((r) => !r.success);

    // Clear cache so next fetch gets fresh data
    clearAllCache();

    if (failed.length > 0) {
      if (_onSyncError) _onSyncError({ synced: results.length - failed.length, failed: failed.length });
    } else {
      if (_onSyncComplete) _onSyncComplete({ synced: results.length });
    }

    // Notify UI to refetch fresh data
    window.dispatchEvent(new CustomEvent("sw-sync-refresh"));
  } catch {
    if (_onSyncError) _onSyncError({ synced: 0, failed: getQueueSize() });
  } finally {
    _isSyncing = false;
  }
}

function handleOnline() {
  // Give connection a moment to stabilize
  setTimeout(syncQueue, 2000);
}

export function initSyncManager(callbacks = {}) {
  _onSyncStart = callbacks.onSyncStart || null;
  _onSyncComplete = callbacks.onSyncComplete || null;
  _onSyncError = callbacks.onSyncError || null;

  window.addEventListener("online", handleOnline);

  // If already online and queue has items, sync now
  if (navigator.onLine && getQueueSize() > 0) {
    setTimeout(syncQueue, 2000);
  }
}

export function destroySyncManager() {
  window.removeEventListener("online", handleOnline);
  _onSyncStart = null;
  _onSyncComplete = null;
  _onSyncError = null;
}

export function triggerManualSync() {
  return syncQueue();
}
