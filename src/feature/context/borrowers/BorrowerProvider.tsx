import { useState } from "react";
import { BorrowerContext } from "./BorrowerContext";

import {
  getBorrowersApi,
  createBorrowerApi,
  getBorrowerTransactionsApi,
} from "./borrowerApi";

export const BorrowerProvider = ({ children }) => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [transactions, setTransactions] = useState([]);


  // -------------------------
  // FETCH BORROWERS
  // -------------------------
  const fetchBorrowers = async () => {
    setLoading(true);
    setError(null);

    const res = await getBorrowersApi();

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch borrowers");
      setLoading(false);
      return res;
    }

    setBorrowers(res.data);
    setLoading(false);

    return res;
  };

  // -------------------------
  // CREATE BORROWER
  // -------------------------
  const createBorrower = async (payload) => {
    setLoading(true);
    setError(null);

    const res = await createBorrowerApi(payload);

    if (!res?.ok) {
      setError(res?.message || "Failed to create borrower");
      setLoading(false);
      return res;
    }

    await fetchBorrowers();

    setLoading(false);
    return res;
  };

  // -------------------------
  // FETCH BORROWER TRANSACTIONS
  // -------------------------
  const fetchBorrowerTransactions = async (borrowerId) => {
    setLoading(true);
    setError(null);

    const res = await getBorrowerTransactionsApi(borrowerId);

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch transactions");
      setLoading(false);
      return res;
    }

    // normalize backend response to FE structure
    const formatted = res.data.map((t) => ({
      id: t.transaction_id,
      type: t.type,
      date: t.transaction_date?.split("T")[0],
      amount: Number(t.total_amount),
      items:
        t.items?.map((i) => ({
          product: i.product_name,
          quantity: i.quantity,
          price: Number(i.price),
        })) || [],
    }));

    console.log(formatted)
    setTransactions(formatted);

    setLoading(false);

    return formatted;
  };

  return (
    <BorrowerContext.Provider
      value={{
        borrowers,
        transactions,
        loading,
        error,

        fetchBorrowers,
        createBorrower,
        fetchBorrowerTransactions,
      }}
    >
      {children}
    </BorrowerContext.Provider>
  );
};