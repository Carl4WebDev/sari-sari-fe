import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import ConnectionStatus from "../../../shared/components/ConnectionStatus";
import QuickActionFab from "../../../shared/components/QuickActionFab";
import AddLoanModal from "../../dashboard/modals/AddLoanModal";
import QuickAddPaymentModal from "../../dashboard/modals/QuickAddPaymentModal";
import SuccessToast from "../../../shared/components/SuccessToast";
import { useDashboard } from "../../context/dashboard/useDashboard";
import { useBorrower } from "../../context/borrowers/useBorrower";

export default function ProtectedLayout() {
  const token = localStorage.getItem("user_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <ProtectedLayoutInner />;
}

function ProtectedLayoutInner() {
  const { fetchDashboard, fetchToday } = useDashboard();
  const { fetchBorrowers } = useBorrower();

  const [isQuickLoanOpen, setIsQuickLoanOpen] = useState(false);
  const [isQuickPaymentOpen, setIsQuickPaymentOpen] = useState(false);
  const [toastData, setToastData] = useState<{
    isOpen: boolean;
    amount: number;
    borrowerName: string;
    newBalance: number;
  }>({ isOpen: false, amount: 0, borrowerName: "", newBalance: 0 });

  const isAnyModalOpen = isQuickLoanOpen || isQuickPaymentOpen;

  const handleRefresh = async () => {
    await fetchDashboard();
    await fetchToday();
    await fetchBorrowers();
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:p-6 lg:p-8 bg-white">
        <ConnectionStatus />
        <div className="p-4 md:p-0">
          <Outlet />
        </div>
      </main>

      <QuickActionFab
        onQuickLoan={() => setIsQuickLoanOpen(true)}
        onQuickPayment={() => setIsQuickPaymentOpen(true)}
        isAnyModalOpen={isAnyModalOpen}
      />

      <AddLoanModal
        isOpen={isQuickLoanOpen}
        isClose={() => setIsQuickLoanOpen(false)}
        mode="quick"
        onLoanCreated={handleRefresh}
        onQuickLoanSaved={(amount, borrowerName, newBalance) => {
          setToastData({ isOpen: true, amount, borrowerName, newBalance });
        }}
      />

      <QuickAddPaymentModal
        isOpen={isQuickPaymentOpen}
        isClose={() => setIsQuickPaymentOpen(false)}
        mode="direct"
        onPaymentCreated={handleRefresh}
      />

      <SuccessToast
        isOpen={toastData.isOpen}
        amount={toastData.amount}
        borrowerName={toastData.borrowerName}
        newBalance={toastData.newBalance}
        onClose={() => setToastData((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
