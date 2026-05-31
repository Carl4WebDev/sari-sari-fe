import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./routes";
import { initSyncManager, destroySyncManager } from "../shared/utils/syncManager";
import ErrorBoundary from "../shared/components/ErrorBoundary";
import OfflineReminderModal from "../shared/components/OfflineReminderModal";

export default function App() {
  useEffect(() => {
    initSyncManager({
      onSyncStart: (count: number) => {
        window.dispatchEvent(
          new CustomEvent("sw-sync-start", { detail: { count } })
        );
      },
      onSyncComplete: (result: unknown) => {
        window.dispatchEvent(
          new CustomEvent("sw-sync-complete", { detail: result })
        );
      },
      onSyncError: (result: unknown) => {
        window.dispatchEvent(
          new CustomEvent("sw-sync-error", { detail: result })
        );
      },
    });

    return () => destroySyncManager();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <OfflineReminderModal />
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
