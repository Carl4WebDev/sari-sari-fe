import { useState } from "react";
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

  const createReminder = async (payload) => {
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
  };

  const fetchDashboardReminders = async () => {
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
  };

  const fetchBorrowerReminders = async (borrowerId) => {
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
  };

  const updateReminderStatus = async (reminderId, status) => {
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
  };

  const deleteReminder = async (reminderId) => {
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
  };

  return (
    <CollectionReminderContext.Provider
      value={{
        dashboardReminders,
        borrowerReminders,
        loading,
        error,

        createReminder,
        fetchDashboardReminders,
        fetchBorrowerReminders,
        updateReminderStatus,
        deleteReminder,
      }}
    >
      {children}
    </CollectionReminderContext.Provider>
  );
};