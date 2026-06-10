import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DashboardContext } from "./DashboardContext";
import {
  getDashboardApi,
  getCalendarDataApi,
  getCollectionStatsApi,
  getCollectionTrendApi,
  getIncomeSummaryApi,
} from "./dashboardApi";
import {
  createExpenseApi,
  getExpensesApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "./expenseApi";

export const DashboardProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [calendarData, setCalendarData] = useState([]);
  const [collectionStats, setCollectionStats] = useState(null);
  const [collectionTrend, setCollectionTrend] = useState([]);

  const [incomeSummary, setIncomeSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);

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

  const fetchDashboard = useCallback(async (signal) => {
    startLoading();
    setError(null);

    const res = await getDashboardApi({ signal });

    if (signal?.aborted) return res;
    if (!res?.ok) {
      setError(res?.message || "Failed to fetch dashboard");
      stopLoading();
      return res;
    }

    setDashboard(res.data);
    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  // Fetch dashboard on mount with AbortController
  // Staggered by 1.5s so borrowers/products load first on cold Render
  useEffect(() => {
    if (!localStorage.getItem("user_token")) return;
    const controller = new AbortController();
    const timer = setTimeout(() => fetchDashboard(controller.signal), 1500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const fetchCalendarData = useCallback(async (year, month) => {
    const res = await getCalendarDataApi(year, month);
    if (res?.ok) setCalendarData(res.data);
    return res;
  }, []);

  const fetchCollectionStats = useCallback(async (period = "week") => {
    const res = await getCollectionStatsApi(period);
    if (res?.ok) setCollectionStats(res.data);
    return res;
  }, []);

  const fetchCollectionTrend = useCallback(async () => {
    const res = await getCollectionTrendApi();
    if (res?.ok) setCollectionTrend(res.data);
    return res;
  }, []);

  const fetchIncomeSummary = useCallback(async (period = "month") => {
    const res = await getIncomeSummaryApi(period);
    if (res?.ok) setIncomeSummary(res.data);
    return res;
  }, []);

  const fetchExpenses = useCallback(async (month, year) => {
    const res = await getExpensesApi(month, year);
    if (res?.ok) setExpenses(res.data || []);
    return res;
  }, []);

  const createExpense = useCallback(async (payload) => {
    const res = await createExpenseApi(payload);
    if (res?.ok) setExpenses((prev) => [res.data, ...prev]);
    return res;
  }, []);

  const updateExpense = useCallback(async (id, payload) => {
    const res = await updateExpenseApi(id, payload);
    if (res?.ok) {
      setExpenses((prev) =>
        prev.map((e) => (e.expense_id === id ? res.data : e)),
      );
    }
    return res;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    const res = await deleteExpenseApi(id);
    if (res?.ok) setExpenses((prev) => prev.filter((e) => e.expense_id !== id));
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
      incomeSummary,
      expenses,
      fetchIncomeSummary,
      fetchExpenses,
      createExpense,
      updateExpense,
      deleteExpense,
    }),
    [
      dashboard, loading, error, clearError, fetchDashboard,
      calendarData, collectionStats, collectionTrend,
      fetchCalendarData, fetchCollectionStats, fetchCollectionTrend,
      incomeSummary, expenses, fetchIncomeSummary, fetchExpenses,
      createExpense, updateExpense, deleteExpense,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
