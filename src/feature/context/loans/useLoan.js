import { useContext } from "react";
import { LoanContext } from "./LoanContext";

export const useLoan = () => {
  const ctx = useContext(LoanContext);

  if (!ctx) {
    throw new Error("useLoan must be used inside LoanProvider");
  }

  return ctx;
};
