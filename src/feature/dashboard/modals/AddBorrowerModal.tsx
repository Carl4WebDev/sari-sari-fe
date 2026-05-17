import { useEffect, useState } from "react";
import { useBorrower } from "../../context/borrowers/useBorrower";

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

  const { createBorrower } = useBorrower();

  const [form, setForm] = useState({
    fName: "",
    mName: "",
    lName: "",
    date: "",
    contact: "",
  });

  const [loading, setLoading] = useState(false);

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
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
  if (!form.fName || !form.lName) return;

  setLoading(true);

  const payload = {
    first_name: form.fName,
    middle_name: form.mName,
    last_name: form.lName,
    dob: form.date,
    contact_number: form.contact,
  };

  const res = await createBorrower(payload);

  if (res?.ok) {
    const borrower = res.data;

    // store borrower id for loan flow
    localStorage.setItem(
      "active_borrower_id",
      borrower.borrower_id
    );

    onBorrowerCreated(borrower);

    setForm({
      fName: "",
      mName: "",
      lName: "",
      date: "",
      contact: "",
    });

    isClose();
  }

  setLoading(false);
};

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={isClose}
    >
      {/* Sliding Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 left-0 w-full bg-white
          rounded-b-2xl shadow-xl
          transform transition-transform duration-300 ease-out
          ${animate ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="p-6 space-y-4">

          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Add Borrower
          </h2>

          <div className="space-y-3">

            <input
              name="fName"
              placeholder="First Name"
              value={form.fName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />

            <input
              name="mName"
              placeholder="Middle Name"
              value={form.mName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />

            <input
              name="lName"
              placeholder="Last Name"
              value={form.lName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />

            <input
              name="contact"
              placeholder="Contact Number"
              value={form.contact}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />

          </div>

          <div className="flex gap-3 pt-2">

            <button
              onClick={isClose}
              className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Add Loan"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}