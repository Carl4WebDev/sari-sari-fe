import { useContext } from "react";
import { DashboardContext } from "./DashboardContext";

export const useDashboard = (): any => {
  const ctx = useContext(DashboardContext);

  if (!ctx) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }

  return ctx;
};

export default useDashboard;
