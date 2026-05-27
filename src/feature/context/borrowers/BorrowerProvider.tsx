import { useState, useCallback, useMemo } from "react";
import { BorrowerContext } from "./BorrowerContext";

import {
  getBorrowersApi,
  createBorrowerApi,
  getBorrowerTransactionsApi,
  uploadBorrowerProfileImageApi,
  // updateBorrowerPublicAccessApi,
  updatePublicLoanAccessApi,
    archiveBorrowerApi,
      getArchivedBorrowersApi,
  reactivateBorrowerApi,
    getBorrowerNotesApi,
  createBorrowerNoteApi,
  updateBorrowerNoteApi,
deleteBorrowerNoteApi,
} from "./borrowerApi";

export const BorrowerProvider = ({ children }) => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);
  const [borrowerNotes, setBorrowerNotes] = useState([]);

  const [archivedBorrowers, setArchivedBorrowers] = useState([]);

  const [transactions, setTransactions] = useState([]);


  const updateBorrowerNote = useCallback(async (
  borrowerId,
  noteId,
  noteText
) => {
  setLoading(true);
  setError(null);

  const res = await updateBorrowerNoteApi(
    borrowerId,
    noteId,
    { note_text: noteText }
  );

  if (!res?.ok) {
    setError(res?.message || "Failed to update note");
    setLoading(false);
    return res;
  }

  await fetchBorrowerNotes(borrowerId);

  setLoading(false);
  return res;
}, []);

const deleteBorrowerNote = useCallback(async (
  borrowerId,
  noteId
) => {
  setLoading(true);
  setError(null);

  const res = await deleteBorrowerNoteApi(
    borrowerId,
    noteId
  );

  if (!res?.ok) {
    setError(res?.message || "Failed to delete note");
    setLoading(false);
    return res;
  }

  await fetchBorrowerNotes(borrowerId);

  setLoading(false);
  return res;
}, []);

  const fetchBorrowerNotes = useCallback(async (borrowerId) => {
  setLoading(true);
  setError(null);

  const res = await getBorrowerNotesApi(borrowerId);

  if (!res?.ok) {
    setError(res?.message || "Failed to fetch notes");
    setLoading(false);
    return res;
  }

  setBorrowerNotes(res.data);
  setLoading(false);
  return res;
}, []);

const createBorrowerNote = useCallback(async (borrowerId, noteText) => {
  setLoading(true);
  setError(null);

  const res = await createBorrowerNoteApi(borrowerId, {
    note_text: noteText,
  });

  if (!res?.ok) {
    setError(res?.message || "Failed to create note");
    setLoading(false);
    return res;
  }

  await fetchBorrowerNotes(borrowerId);

  setLoading(false);
  return res;
}, []);

const fetchArchivedBorrowers = useCallback(async () => {
  setLoading(true);
  setError(null);

  const res = await getArchivedBorrowersApi();

  if (!res?.ok) {
    setError(res?.message || "Failed to fetch archived borrowers");
    setLoading(false);
    return res;
  }

  setArchivedBorrowers(res.data); // ✅ THIS IS THE IMPORTANT LINE

  setLoading(false);
  return res;
}, []);

const reactivateBorrower = useCallback(async (borrowerId) => {
  setLoading(true);
  setError(null);

  const res = await reactivateBorrowerApi(borrowerId);

  if (!res?.ok) {
    setError(res?.message || "Failed to reactivate borrower");
    setLoading(false);
    return res;
  }

  await fetchBorrowers();
  await fetchArchivedBorrowers();

  setLoading(false);
  return res;
}, []);

  const archiveBorrower = useCallback(async (borrowerId) => {
  setLoading(true);
  setError(null);

  const res = await archiveBorrowerApi(borrowerId);

  if (!res?.ok) {
    setError(res?.message || "Failed to archive borrower");
    setLoading(false);
    return res;
  }

  await fetchBorrowers();

  setLoading(false);
  return res;
}, []);

  // -------------------------
  // FETCH BORROWERS
  // -------------------------
  const fetchBorrowers = useCallback(async () => {
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
  }, []);

  // -------------------------
  // CREATE BORROWER
  // -------------------------
  const createBorrower = useCallback(async (payload) => {
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
  }, []);

  // -------------------------
  // FETCH BORROWER TRANSACTIONS
  // -------------------------
  const fetchBorrowerTransactions = useCallback(async (borrowerId) => {
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

  payment_method: t.payment_method,
  payment_note: t.payment_note,

  items:
    t.items?.map((i) => ({
      product: i.product_name,
      quantity: Number(i.quantity),
      price: Number(i.price),
    })) || [],
}));

    setTransactions(formatted);
    setLoading(false);

    return formatted;
  }, []);

  // -------------------------
  // UPLOAD BORROWER PROFILE IMAGE
  // -------------------------
const uploadBorrowerProfileImage = useCallback(async (borrowerId, file) => {
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
}, []);


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

const updatePublicLoanAccess = useCallback(async (
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
}, []);

  const value = useMemo(() => ({
    borrowers,
    transactions,
    loading,
    uploadingProfileImage,
    error,
    clearError,
    archivedBorrowers,
    borrowerNotes,
    fetchBorrowers,
    createBorrower,
    fetchBorrowerTransactions,
    uploadBorrowerProfileImage,
    updatePublicLoanAccess,
    archiveBorrower,
    fetchArchivedBorrowers,
    reactivateBorrower,
    fetchBorrowerNotes,
    createBorrowerNote,
    updateBorrowerNote,
    deleteBorrowerNote,
  }), [
    borrowers, transactions, loading, uploadingProfileImage, error,
    archivedBorrowers, borrowerNotes,
    clearError, fetchBorrowers, createBorrower, fetchBorrowerTransactions,
    uploadBorrowerProfileImage, updatePublicLoanAccess, archiveBorrower,
    fetchArchivedBorrowers, reactivateBorrower, fetchBorrowerNotes,
    createBorrowerNote, updateBorrowerNote, deleteBorrowerNote,
  ]);

  return (
    <BorrowerContext.Provider value={value}>
      {children}
    </BorrowerContext.Provider>
  );
};