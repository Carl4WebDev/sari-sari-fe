import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { CollectionReminderContext } from "./CollectionReminderContext";
import {
  createReminderApi,
  getDashboardRemindersApi,
  getBorrowerRemindersApi,
  updateReminderStatusApi,
  deleteReminderApi,
} from "./collectionReminderApi";

export const CollectionReminderProvider = ({ children }) => {
  const [dashboardReminders, setDashboardReminders] = useState({
    todays_collections: [],
    overdue: [],
    upcoming: [],
  });

  const [borrowerReminders, setBorrowerReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadingCount = useRef(0);

  const startLoading = useCallback(() => {
    loadingCount.current++;
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    loadingCount.current--;
    if (loadingCount.current <= 0) {
      loadingCount.current = 0;
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const createReminder = useCallback(async (payload) => {
    startLoading();
    setError(null);

    const res = await createReminderApi(payload);

    if (!res?.ok) {
      setError(res?.message || "Failed to create reminder");
      stopLoading();
      return res;
    }

    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const fetchDashboardReminders = useCallback(async (signal) => {
    startLoading();
    setError(null);

    const res = await getDashboardRemindersApi({ signal });

    if (signal?.aborted) return res;
    if (!res?.ok) {
      setError(res?.message || "Failed to fetch reminders");
      stopLoading();
      return res;
    }

    setDashboardReminders(
      res.data || { todays_collections: [], overdue: [], upcoming: [] }
    );
    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  // Fetch dashboard reminders on mount with AbortController
  // Staggered by 2s so borrowers/products/dashboard load first on cold Render
  useEffect(() => {
    if (!localStorage.getItem("user_token")) return;
    const controller = new AbortController();
    const timer = setTimeout(() => fetchDashboardReminders(controller.signal), 2000);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const fetchBorrowerReminders = useCallback(async (borrowerId) => {
    startLoading();
    setError(null);

    const res = await getBorrowerRemindersApi(borrowerId);

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch borrower reminders");
      stopLoading();
      return res;
    }

    setBorrowerReminders(res.data || []);
    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const updateReminderStatus = useCallback(async (reminderId, status) => {
    startLoading();
    setError(null);

    const res = await updateReminderStatusApi(reminderId, status);

    if (!res?.ok) {
      setError(res?.message || "Failed to update reminder");
      stopLoading();
      return res;
    }

    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const deleteReminder = useCallback(async (reminderId) => {
    startLoading();
    setError(null);

    const res = await deleteReminderApi(reminderId);

    if (!res?.ok) {
      setError(res?.message || "Failed to delete reminder");
      stopLoading();
      return res;
    }

    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const value = useMemo(() => ({
    dashboardReminders,
    borrowerReminders,
    loading,
    error,
    clearError,
    createReminder,
    fetchDashboardReminders,
    fetchBorrowerReminders,
    updateReminderStatus,
    deleteReminder,
  }), [
    dashboardReminders, borrowerReminders, loading, error, clearError,
    createReminder, fetchDashboardReminders, fetchBorrowerReminders,
    updateReminderStatus, deleteReminder,
  ]);

  return (
    <CollectionReminderContext.Provider value={value}>
      {children}
    </CollectionReminderContext.Provider>
  );
};
