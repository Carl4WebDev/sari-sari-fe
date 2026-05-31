import { useState, useEffect } from "react";
import { getQueueSize } from "../utils/offlineQueue";
import { useTranslation } from "../i18n/useTranslation";

export default function ConnectionStatus() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getQueueSize());
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncDetail, setSyncDetail] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleServerWaking = () => {
      setSyncStatus("waking");
    };

    const handleSyncStart = (e: Event) => {
      setSyncStatus("syncing");
      setSyncDetail({ count: (e as CustomEvent).detail?.count || 0 });
    };

    const handleSyncComplete = (e: Event) => {
      setSyncStatus("synced");
      setSyncDetail((e as CustomEvent).detail);
      setPendingCount(getQueueSize());
      setTimeout(() => {
        setSyncStatus(null);
        setSyncDetail(null);
      }, 4000);
    };

    const handleSyncError = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.reason === "server_unreachable") {
        setSyncStatus("server_unreachable");
      } else {
        setSyncStatus("error");
      }
      setSyncDetail(detail);
      setPendingCount(getQueueSize());
      setTimeout(() => {
        setSyncStatus(null);
        setSyncDetail(null);
      }, 6000);
    };

    const handleSyncRefresh = () => {
      setPendingCount(getQueueSize());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sw-server-waking", handleServerWaking);
    window.addEventListener("sw-sync-start", handleSyncStart);
    window.addEventListener("sw-sync-complete", handleSyncComplete);
    window.addEventListener("sw-sync-error", handleSyncError);
    window.addEventListener("sw-sync-refresh", handleSyncRefresh);

    // Poll pending count
    const interval = setInterval(() => {
      setPendingCount(getQueueSize());
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sw-server-waking", handleServerWaking);
      window.removeEventListener("sw-sync-start", handleSyncStart);
      window.removeEventListener("sw-sync-complete", handleSyncComplete);
      window.removeEventListener("sw-sync-error", handleSyncError);
      window.removeEventListener("sw-sync-refresh", handleSyncRefresh);
      clearInterval(interval);
    };
  }, []);

  // Server waking banner
  if (syncStatus === "waking") {
    return (
      <div className="bg-blue-600 text-white text-sm text-center py-2 px-4">
        <span className="inline-block animate-spin mr-2">↻</span>
        {t("connection.waking") || "Server is waking up"}...
      </div>
    );
  }

  // Syncing banner
  if (syncStatus === "syncing") {
    return (
      <div className="bg-blue-500 text-white text-sm text-center py-2 px-4">
        <span className="inline-block animate-spin mr-2">↻</span>
        {t("connection.syncing") || "Syncing"} {syncDetail?.count || 0} {t("connection.items") || "item(s)"}...
      </div>
    );
  }

  // Synced banner
  if (syncStatus === "synced") {
    return (
      <div className="bg-green-500 text-white text-sm text-center py-2 px-4">
        {t("connection.synced") || "Synced successfully!"}
        {syncDetail?.synced ? ` (${syncDetail.synced} ${t("connection.items") || "item(s)"})` : ""}
      </div>
    );
  }

  // Server unreachable banner
  if (syncStatus === "server_unreachable") {
    return (
      <div className="bg-red-500 text-white text-sm text-center py-2 px-4">
        {t("connection.server_unreachable") || "Server unreachable"} — {t("connection.will_retry") || "will retry when available"}
      </div>
    );
  }

  // Sync error banner
  if (syncStatus === "error") {
    return (
      <div className="bg-red-500 text-white text-sm text-center py-2 px-4">
        {t("connection.sync_error") || "Sync failed"} — {syncDetail?.failed || "?"} {t("connection.items") || "item(s)"} {t("connection.remaining") || "remaining"}
      </div>
    );
  }

  // Offline banner
  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white text-sm text-center py-2 px-4">
        {t("connection.offline") || "You are offline"}
        {pendingCount > 0 && (
          <span className="ml-2 bg-white text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {pendingCount} {t("connection.pending") || "pending"}
          </span>
        )}
      </div>
    );
  }

  // Online with pending items
  if (pendingCount > 0) {
    return (
      <div className="bg-amber-100 text-amber-800 text-sm text-center py-2 px-4">
        {pendingCount} {t("connection.pending") || "pending"} {t("connection.items_will_sync") || "item(s) will sync shortly"}
      </div>
    );
  }

  return null;
}
