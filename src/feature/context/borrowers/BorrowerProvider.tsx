import { useState, useCallback, useMemo, useEffect } from "react";
import { BorrowerContext } from "./BorrowerContext";

import {
  getBorrowersApi,
  createBorrowerApi,
  updateBorrowerApi,
  getBorrowerTransactionsApi,
  uploadBorrowerProfileImageApi,
  archiveBorrowerApi,
  getArchivedBorrowersApi,
  reactivateBorrowerApi,
  getBorrowerNotesApi,
  createBorrowerNoteApi,
  updateBorrowerNoteApi,
  deleteBorrowerNoteApi,
  voidTransactionApi,
} from "./borrowerApi";

export const BorrowerProvider = ({ children }) => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [error, setError] = useState(null);
  const [borrowerNotes, setBorrowerNotes] = useState([]);
  const [archivedBorrowers, setArchivedBorrowers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const clearError = useCallback(() => setError(null), []);

  const fetchBorrowerNotes = useCallback(async (borrowerId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBorrowerNotesApi(borrowerId);
      if (!res?.ok) {
        setError(res?.message || "Failed to fetch notes");
        return res;
      }
      setBorrowerNotes(res.data);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, []);

  const createBorrowerNote = useCallback(async (borrowerId, noteText) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createBorrowerNoteApi(borrowerId, {
        note_text: noteText,
      });
      if (!res?.ok) {
        setError(res?.message || "Failed to create note");
        return res;
      }
      await fetchBorrowerNotes(borrowerId);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowerNotes]);

  const updateBorrowerNote = useCallback(async (borrowerId, noteId, noteText) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateBorrowerNoteApi(borrowerId, noteId, {
        note_text: noteText,
      });
      if (!res?.ok) {
        setError(res?.message || "Failed to update note");
        return res;
      }
      await fetchBorrowerNotes(borrowerId);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowerNotes]);

  const deleteBorrowerNote = useCallback(async (borrowerId, noteId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteBorrowerNoteApi(borrowerId, noteId);
      if (!res?.ok) {
        setError(res?.message || "Failed to delete note");
        return res;
      }
      await fetchBorrowerNotes(borrowerId);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowerNotes]);

  const fetchArchivedBorrowers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getArchivedBorrowersApi();
      if (!res?.ok) {
        setError(res?.message || "Failed to fetch archived borrowers");
        return res;
      }
      setArchivedBorrowers(Array.isArray(res.data) ? res.data : []);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateBorrower = useCallback(async (borrowerId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await reactivateBorrowerApi(borrowerId);
      if (!res?.ok) {
        setError(res?.message || "Failed to reactivate borrower");
        return res;
      }
      await fetchBorrowers();
      await fetchArchivedBorrowers();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowers, fetchArchivedBorrowers]);

  const archiveBorrower = useCallback(async (borrowerId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await archiveBorrowerApi(borrowerId);
      if (!res?.ok) {
        setError(res?.message || "Failed to archive borrower");
        return res;
      }
      await fetchBorrowers();
      await fetchArchivedBorrowers();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowers, fetchArchivedBorrowers]);

  const fetchBorrowers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBorrowersApi();
      if (!res?.ok) {
        setError(res?.message || "Failed to fetch borrowers");
        return res;
      }
      setBorrowers((prev) => {
        const fresh = Array.isArray(res.data) ? res.data : [];
        const pending = prev.filter((b) => b._pending);
        const freshIds = new Set(fresh.map((b) => b.borrower_id));
        const remaining = pending.filter((b) => !freshIds.has(b.borrower_id));
        return [...remaining, ...fresh];
      });
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("user_token")) {
      fetchBorrowers();
    }
  }, [fetchBorrowers]);

  const createBorrower = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createBorrowerApi(payload);
      if (!res?.ok) {
        setError(res?.message || "Failed to create borrower");
        return res;
      }
      if (res.queued) {
        const tempBorrower = {
          ...payload,
          borrower_id: Date.now(),
          _pending: true,
          _queuedItemId: res.queuedItem?.id,
          created_at: new Date().toISOString(),
        };
        setBorrowers((prev) => [tempBorrower, ...prev]);
      } else {
        await fetchBorrowers();
      }
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowers]);

  const updateBorrower = useCallback(async (borrowerId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateBorrowerApi(borrowerId, payload)
      if (!res?.ok) {
        setError(res?.message || "Failed to update borrower");
        return res;
      }
      await fetchBorrowers();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowers]);

  const fetchBorrowerTransactions = useCallback(async (borrowerId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBorrowerTransactionsApi(borrowerId);
      if (!res?.ok) {
        setError(res?.message || "Failed to fetch transactions");
        return res;
      }
      const formatted = res.data.map((t) => ({
        id: t.transaction_id,
        type: t.type,
        date: t.transaction_date?.split("T")[0],
        amount: Number(t.total_amount),
        payment_method: t.payment_method,
        payment_note: t.payment_note,
        voided: t.voided || false,
        voided_at: t.voided_at || null,
        void_reason: t.void_reason || null,
        items: t.items?.map((i) => ({
          product: i.product_name,
          quantity: Number(i.quantity),
          price: Number(i.price),
        })) || [],
      }));
      setTransactions(formatted);
      return formatted;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadBorrowerProfileImage = useCallback(async (borrowerId, file) => {
    setUploadingProfileImage(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("profile_image", file);
      const res = await uploadBorrowerProfileImageApi(borrowerId, formData);
      if (!res?.ok) {
        setError(res?.message || "Failed to upload profile image");
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
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setUploadingProfileImage(false);
    }
  }, []);

  const updatePublicLoanAccess = useCallback(async (borrowerId, enabled) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updatePublicLoanAccessApi(borrowerId, enabled);
      if (!res?.ok) {
        setError(res?.message || "Failed to update public access");
        return res;
      }
      await fetchBorrowers();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowers]);

  const voidTransaction = useCallback(async (borrowerId, transactionId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const res = await voidTransactionApi(borrowerId, transactionId, reason);
      if (!res?.ok) {
        setError(res?.message || "Failed to void transaction");
        return res;
      }
      await fetchBorrowerTransactions(borrowerId);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowerTransactions]);

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
    updateBorrower,
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
    voidTransaction,
  }), [
    borrowers, transactions, loading, uploadingProfileImage, error,
    archivedBorrowers, borrowerNotes,
    clearError, fetchBorrowers, createBorrower, updateBorrower, fetchBorrowerTransactions,
    uploadBorrowerProfileImage, updatePublicLoanAccess, archiveBorrower,
    fetchArchivedBorrowers, reactivateBorrower, fetchBorrowerNotes,
    createBorrowerNote, updateBorrowerNote, deleteBorrowerNote, voidTransaction,
  ]);

  return (
    <BorrowerContext.Provider value={value}>
      {children}
    </BorrowerContext.Provider>
  );
};