import { useContext } from "react";
import { BorrowerContext } from "./BorrowerContext";

export const useBorrower = (): any => {
  const ctx = useContext(BorrowerContext);

  if (!ctx) {
    throw new Error("useBorrower must be used inside BorrowerProvider");
  }

  return ctx;
};

export default useBorrower;
