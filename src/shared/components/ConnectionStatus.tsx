import { useState, useEffect } from "react";
import { getQueueSize } from "../utils/offlineQueue";
import { useTranslation } from "../i18n/useTranslation";

export default function ConnectionStatus() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getQueueSize());
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncDetail, setSyncDetail] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleSyncStart = (e) => {
      setSyncStatus("syncing");
      setSyncDetail({ count: e.detail?.count || 0 });
    };

    const handleSyncComplete = (e) => {
      setSyncStatus("synced");
      setSyncDetail(e.detail);
      setPendingCount(getQueueSize());
      setTimeout(() => {
        setSyncStatus(null);
        setSyncDetail(null);
      }, 4000);
    };

    const handleSyncError = (e) => {
      setSyncStatus("error");
      setSyncDetail(e.detail);
      setPendingCount(getQueueSize());
      setTimeout(() => {
        setSyncStatus(null);
        setSyncDetail(null);
      }, 6000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sw-sync-start", handleSyncStart);
    window.addEventListener("sw-sync-complete", handleSyncComplete);
    window.addEventListener("sw-sync-error", handleSyncError);

    // Poll pending count
    const interval = setInterval(() => {
      setPendingCount(getQueueSize());
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sw-sync-start", handleSyncStart);
      window.removeEventListener("sw-sync-complete", handleSyncComplete);
      window.removeEventListener("sw-sync-error", handleSyncError);
      clearInterval(interval);
    };
  }, []);

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
