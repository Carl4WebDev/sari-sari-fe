import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const createReminderApi = (payload) =>
  apiRequest("/api/collection-reminders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getDashboardRemindersApi = () =>
  apiRequest("/api/collection-reminders/dashboard", {
    method: "GET",
  });

export const getBorrowerRemindersApi = (borrowerId) =>
  apiRequest(`/api/collection-reminders/borrower/${borrowerId}`, {
    method: "GET",
  });

export const updateReminderStatusApi = (reminderId, status) =>
  apiRequest(`/api/collection-reminders/${reminderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteReminderApi = (reminderId) =>
  apiRequest(`/api/collection-reminders/${reminderId}`, {
    method: "DELETE",
  });
