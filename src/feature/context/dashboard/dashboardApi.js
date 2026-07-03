import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const getDashboardApi = () =>
  apiRequest("/api/dashboard", {
    method: "GET",
  });

export const getCalendarDataApi = (year, month) =>
  apiRequest(`/api/dashboard/calendar?year=${year}&month=${month}`, {
    method: "GET",
  });

export const getCollectionStatsApi = (period = "week") =>
  apiRequest(`/api/dashboard/stats?period=${period}`, {
    method: "GET",
  });

export const getCollectionTrendApi = () =>
  apiRequest("/api/dashboard/trend", {
    method: "GET",
  });

export const getIncomeSummaryApi = (period = "month") =>
  apiRequest(`/api/dashboard/income?period=${period}`, {
    method: "GET",
  });

export const getTodayApi = () =>
  apiRequest("/api/dashboard/today", {
    method: "GET",
  });
