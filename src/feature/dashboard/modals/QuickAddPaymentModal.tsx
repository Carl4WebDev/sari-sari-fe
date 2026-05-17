import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBorrower } from "../../context/borrowers/useBorrower";

interface Props {
  isOpen: boolean;
  isClose: () => void;
}

export default function QuickAddPaymentModal({
  isOpen,
  isClose,
}: Props) {
  const navigate = useNavigate();

  const { borrowers, fetchBorrowers } = useBorrower();

  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState("");

  // -----------------------------
  // Load borrowers
  // -----------------------------

  useEffect(() => {
    if (!isOpen) return;

    fetchBorrowers();
  }, [isOpen]);

  // -----------------------------
  // Modal animation
  // -----------------------------

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // -----------------------------
  // Borrowers with utang only
  // -----------------------------

  const borrowersWithUtang = borrowers.filter(
    (b: any) => Number(b.total_loan) > 0
  );

  const filtered = borrowersWithUtang.filter((b: any) =>
    `${b.first_name} ${b.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      onClick={isClose}
    >
      <div
        className={`fixed top-0 left-0 w-full bg-white rounded-b-2xl shadow-xl
        transform transition-transform duration-300
        ${animate ? "translate-y-0" : "-translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Quick Add Payment
          </h2>

          <input
            placeholder="Search borrower..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm"
          />

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filtered.map((b: any) => (
              <div
                key={b.borrower_id}
                onClick={() => {
                  navigate(`/borrowers/${b.borrower_id}`, {
                    state: { openPayment: true },
                  });

                  isClose();
                }}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between"
              >
                <span>
                  {b.first_name} {b.last_name}
                </span>

                <span className="text-[#1E3A8A] font-semibold">
                  ₱{Number(b.total_loan).toLocaleString()}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No borrower found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}