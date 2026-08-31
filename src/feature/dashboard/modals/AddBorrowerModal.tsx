import { useEffect, useState } from "react";
import { useBorrower } from "../../context/borrowers/useBorrower";
import GlobalModal from "../../../shared/components/GlobalModal";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  onBorrowerCreated: (borrower: any) => void;
}

export default function AddBorrowerModal({
  isOpen,
  isClose,
  onBorrowerCreated,
}: Props) {
  const { t } = useTranslation();
  const { createBorrower, clearError: clearBorrowerError } = useBorrower();

  const [form, setForm] = useState({
    fName: "",
    mName: "",
    lName: "",
    date: "",
    contact: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (isOpen) {
      clearBorrowerError();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.fName || !form.lName) {
      setGlobalModal({
        isOpen: true,
        title: "Required Fields",
        message: "First Name and Last Name are required.",
        type: "warning",
      });
      return;
    }

    setLoading(true);

    const payload = {
      first_name: form.fName,
      middle_name: form.mName,
      last_name: form.lName,
      dob: form.date,
      contact_number: form.contact,
      email: form.email,
    };

    const res = await createBorrower(payload);

    if (!res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: "Error",
        message: res?.message || "Something went wrong",
        type: "error",
      });
      setLoading(false);
      return;
    }

    const borrower = res.data || {
      ...payload,
      borrower_id: Date.now(),
      _pending: true,
      _queuedItemId: res.queuedItem?.id,
    };

    localStorage.setItem("active_borrower_id", String(borrower.borrower_id));
    onBorrowerCreated(borrower);

    setForm({
      fName: "",
      mName: "",
      lName: "",
      date: "",
      contact: "",
      email: "",
    });

    setLoading(false);
    isClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                Add Borrower
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Create a new customer profile</p>
            </div>
          </div>

          <button
            onClick={isClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <input
            name="fName"
            placeholder="First Name *"
            required
            value={form.fName}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
          />

          <input
            name="lName"
            placeholder="Last Name *"
            required
            value={form.lName}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
          />

          {/* Optional Details */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-900">Optional Details</p>
              <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[10px] font-black text-blue-700">
                OPTIONAL
              </span>
            </div>

            <input
              name="mName"
              placeholder="Middle Name"
              value={form.mName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition"
            />

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 transition"
            />

            <input
              name="contact"
              type="tel"
              placeholder="Contact Number"
              value={form.contact}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white">
          <button
            onClick={isClose}
            className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-black text-white shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Save & Add Loan"}
          </button>
        </div>
      </div>

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() => {
          setGlobalModal({ ...globalModal, isOpen: false });
          clearBorrowerError();
        }}
      />
    </div>
  );
}