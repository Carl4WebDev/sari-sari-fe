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

async function syncQueue() {
  if (_isSyncing) return;
  if (getQueueSize() === 0) return;

  _isSyncing = true;
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
  } catch {
    if (_onSyncError) _onSyncError({ synced: 0, failed: getQueueSize() });
  } finally {
    _isSyncing = false;
  }
}

function handleOnline() {
  // Small delay to let connection stabilize
  setTimeout(syncQueue, 1000);
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
