import { useState, useCallback, useMemo } from "react";
import { DashboardContext } from "./DashboardContext";
import {
  getDashboardApi,
  getCalendarDataApi,
  getCollectionStatsApi,
  getCollectionTrendApi,
} from "./dashboardApi";

export const DashboardProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [calendarData, setCalendarData] = useState([]);
  const [collectionStats, setCollectionStats] = useState(null);
  const [collectionTrend, setCollectionTrend] = useState([]);

  const clearError = useCallback(() => setError(null), []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await getDashboardApi();

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch dashboard");
      setLoading(false);
      return res;
    }

    setDashboard(res.data);
    setLoading(false);
    return res;
  }, []);

  const fetchCalendarData = useCallback(async (year, month) => {
    const res = await getCalendarDataApi(year, month);

    if (res?.ok) {
      setCalendarData(res.data);
    }

    return res;
  }, []);

  const fetchCollectionStats = useCallback(async (period = "week") => {
    const res = await getCollectionStatsApi(period);

    if (res?.ok) {
      setCollectionStats(res.data);
    }

    return res;
  }, []);

  const fetchCollectionTrend = useCallback(async () => {
    const res = await getCollectionTrendApi();

    if (res?.ok) {
      setCollectionTrend(res.data);
    }

    return res;
  }, []);

  const value = useMemo(
    () => ({
      dashboard,
      loading,
      error,
      clearError,
      fetchDashboard,
      calendarData,
      collectionStats,
      collectionTrend,
      fetchCalendarData,
      fetchCollectionStats,
      fetchCollectionTrend,
    }),
    [
      dashboard,
      loading,
      error,
      clearError,
      fetchDashboard,
      calendarData,
      collectionStats,
      collectionTrend,
      fetchCalendarData,
      fetchCollectionStats,
      fetchCollectionTrend,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
