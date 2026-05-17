import { useParams } from "react-router-dom";
import { useMemo } from "react";

interface LoanItem {
  product: string;
  quantity: number;
  price: number;
}

interface Transaction {
  id: number;
  type: "LOAN" | "PAYMENT";
  date: string;
  items?: LoanItem[];
  amount: number;
}

export default function PublicStatusPage() {
  const { token } = useParams();

  // 🔥 HARDCODED FOR NOW
  const storeName = "ABC Sari-Sari Store";

  const borrower = {
    name: "Juan Dela Cruz",
  };

    const transactions: Transaction[] = [
    {
      id: 1,
      type: "LOAN",
      date: "2025-01-01",
      items: [
        { product: "Sardines", quantity: 3, price: 20 },
        { product: "Rice", quantity: 1, price: 50 },
      ],
      amount: 110,
    },
    {
      id: 2,
      type: "PAYMENT",
      date: "2025-01-02",
      amount: 50,
    },
    {
      id: 3,
      type: "LOAN",
      date: "2025-01-03",
      items: [{ product: "Coffee", quantity: 2, price: 15 }],
      amount: 30,
    },
  ];
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === "LOAN"
        ? acc + t.amount
        : acc - t.amount;
    }, 0);
  }, [transactions]);

  const lastPayment = transactions
    .filter((t) => t.type === "PAYMENT")
    .slice(-1)[0];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">

      {/* Store Header */}
      <div className="text-center space-y-1">
        <h1 className="text-lg font-semibold text-[#1E3A8A]">
          {storeName}
        </h1>
        <p className="text-xs text-gray-500">
          Loan Status Page
        </p>
      </div>

      {/* Borrower Info */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-2">
        <p className="text-sm text-gray-500">
          Borrower
        </p>
        <p className="text-lg font-semibold text-gray-800">
          {borrower.name}
        </p>
      </div>

      {/* Total Balance */}
      <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center">
        <p className="text-sm text-blue-100">
          Current Total Balance
        </p>
        <p className="text-3xl font-bold mt-2">
          ₱{totalBalance.toLocaleString()}
        </p>
      </div>

      {/* Last Payment */}
      {lastPayment && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">
            Last Payment
          </p>
          <p className="text-sm font-medium text-[#16A34A]">
            ₱{lastPayment.amount.toLocaleString()} on {lastPayment.date}
          </p>
        </div>
      )}

      {/* Transaction History */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Transaction History
        </h2>

        {transactions.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl p-4 shadow-sm space-y-2"
          >
            <div className="flex justify-between">
              <span
                className={`text-xs font-semibold ${
                  t.type === "LOAN"
                    ? "text-[#1E3A8A]"
                    : "text-[#16A34A]"
                }`}
              >
                {t.type}
              </span>
              <span className="text-xs text-gray-400">
                {t.date}
              </span>
            </div>

            {t.type === "LOAN" && t.items && (
              <div className="text-sm text-gray-600 space-y-1">
                {t.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between"
                  >
                    <span>
                      {item.quantity} × {item.product}
                    </span>
                    <span>
                      ₱
                      {(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <span
                className={`text-sm font-bold ${
                  t.type === "LOAN"
                    ? "text-[#1E3A8A]"
                    : "text-[#16A34A]"
                }`}
              >
                {t.type === "LOAN" ? "+" : "-"}₱
                {t.amount.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Notice */}
      <div className="text-center text-xs text-gray-500 pt-6">
        This page is read-only.  
        For corrections or concerns, please contact the store directly.
      </div>

    </div>
  );
}