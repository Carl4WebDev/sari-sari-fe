import { useState } from "react";
import { BorrowerContext } from "./BorrowerContext";

import {
  getBorrowersApi,
  createBorrowerApi,
  getBorrowerTransactionsApi,
  uploadBorrowerProfileImageApi,
  // updateBorrowerPublicAccessApi,
  updatePublicLoanAccessApi
} from "./borrowerApi";

export const BorrowerProvider = ({ children }) => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
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

    setBorrowers(res.data || []);
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

    setTransactions(formatted);
    setLoading(false);

    return formatted;
  };

  // -------------------------
  // UPLOAD BORROWER PROFILE IMAGE
  // -------------------------
const uploadBorrowerProfileImage = async (borrowerId, file) => {
  setUploadingProfileImage(true);
  setError(null);

  const formData = new FormData();
  formData.append("profile_image", file);

  const res = await uploadBorrowerProfileImageApi(borrowerId, formData);

  if (!res?.ok) {
    setError(res?.message || "Failed to upload profile image");
    setUploadingProfileImage(false);
    return res;
  }

  const updatedBorrower = res.data.borrower || res.data;

  setBorrowers((prev) =>
    prev.map((borrower) =>
      borrower.borrower_id === updatedBorrower.borrower_id
        ? updatedBorrower
        : borrower
    )
  );

  setUploadingProfileImage(false);
  return res;
};


// const updatePublicAccess = async (borrowerId, enabled) => {
//   setLoading(true);
//   setError(null);

//   const res = await updateBorrowerPublicAccessApi(
//     borrowerId,
//     enabled
//   );

//   if (!res?.ok) {
//     setError(res?.message || "Failed to update public access");
//     setLoading(false);
//     return res;
//   }

//   await fetchBorrowers();

//   setLoading(false);
//   return res;
// };

const updatePublicLoanAccess = async (
  borrowerId,
  enabled
) => {
  setLoading(true);
  setError(null);

  const res = await updatePublicLoanAccessApi(
    borrowerId,
    enabled
  );

  if (!res?.ok) {
    setError(
      res?.message ||
        "Failed to update public access"
    );

    setLoading(false);
    return res;
  }

  await fetchBorrowers();

  setLoading(false);

  return res;
};
  return (
    <BorrowerContext.Provider
      value={{
        borrowers,
        transactions,
        loading,
        uploadingProfileImage,
        error,

        fetchBorrowers,
        createBorrower,
        fetchBorrowerTransactions,
        uploadBorrowerProfileImage,
        updatePublicLoanAccess
      }}
    >
      {children}
    </BorrowerContext.Provider>
  );
};