import { useState, useCallback, useMemo, useEffect } from "react";
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

  const clearError = useCallback(() => setError(null), []);

  const createReminder = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    const res = await createReminderApi(payload);

    if (!res?.ok) {
      setError(res?.message || "Failed to create reminder");
      setLoading(false);
      return res;
    }

    setLoading(false);
    return res;
  }, []);

  const fetchDashboardReminders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await getDashboardRemindersApi();

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch reminders");
      setLoading(false);
      return res;
    }

    setDashboardReminders(
      res.data || {
        todays_collections: [],
        overdue: [],
        upcoming: [],
      }
    );

    setLoading(false);
    return res;
  }, []);

  // Fetch dashboard reminders on mount so they're cached for offline use
  useEffect(() => {
    if (localStorage.getItem("user_token")) {
      fetchDashboardReminders();
    }
  }, []);

  const fetchBorrowerReminders = useCallback(async (borrowerId) => {
    setLoading(true);
    setError(null);

    const res = await getBorrowerRemindersApi(borrowerId);

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch borrower reminders");
      setLoading(false);
      return res;
    }

    setBorrowerReminders(res.data || []);
    setLoading(false);
    return res;
  }, []);

  const updateReminderStatus = useCallback(async (reminderId, status) => {
    setLoading(true);
    setError(null);

    const res = await updateReminderStatusApi(reminderId, status);

    if (!res?.ok) {
      setError(res?.message || "Failed to update reminder");
      setLoading(false);
      return res;
    }

    setLoading(false);
    return res;
  }, []);

  const deleteReminder = useCallback(async (reminderId) => {
    setLoading(true);
    setError(null);

    const res = await deleteReminderApi(reminderId);

    if (!res?.ok) {
      setError(res?.message || "Failed to delete reminder");
      setLoading(false);
      return res;
    }

    setLoading(false);
    return res;
  }, []);

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