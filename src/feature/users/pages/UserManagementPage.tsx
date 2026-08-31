import { useEffect, useState } from "react";
import { useUser } from "../../context/users/useUser";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import GlobalModal from "../../../shared/components/GlobalModal";
import SubscriptionModal from "../../subscription/components/SubscriptionModal";

export default function UserManagementPage() {
  const { t } = useTranslation();
  const {
    profile,
    loading,
    error,
    clearError,
    fetchProfile,
    updateStoreName,
    changePassword,
  } = useUser();

  const [storeName, setStoreName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.store_name) {
      setStoreName(profile.store_name);
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      setGlobalModal({ isOpen: true, title: "Error", message: error, type: "error" });
      clearError();
    }
  }, [error, clearError]);

  const handleSaveStoreName = async () => {
    if (!storeName.trim()) {
      setGlobalModal({
        isOpen: true,
        title: "Missing",
        message: t("user.store_name") + " is required",
        type: "warning",
      });
      return;
    }

    const res = await updateStoreName(storeName.trim());

    if (res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: "Success",
        message: t("user.profile_updated"),
        type: "success",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setGlobalModal({
        isOpen: true,
        title: "Missing",
        message: t("user.current_password") + " is required",
        type: "warning",
      });
      return;
    }

    if (!newPassword) {
      setGlobalModal({
        isOpen: true,
        title: "Missing",
        message: t("user.new_password") + " is required",
        type: "warning",
      });
      return;
    }

    if (newPassword.length < 8) {
      setGlobalModal({
        isOpen: true,
        title: "Invalid",
        message: t("user.password_hint"),
        type: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setGlobalModal({
        isOpen: true,
        title: "Mismatch",
        message: t("user.password_mismatch"),
        type: "warning",
      });
      return;
    }

    const res = await changePassword(currentPassword, newPassword);

    if (res?.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setGlobalModal({
        isOpen: true,
        title: "Success",
        message: t("user.password_changed"),
        type: "success",
      });
    }
  };

  return (
    <div className="space-y-6 pb-24 relative min-h-full">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-md border border-slate-800 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t("user.profile")}</h1>
            <p className="mt-1 text-xs md:text-sm text-blue-400 font-extrabold truncate">
              {profile?.email || "demo@listahub.ph"}
            </p>
          </div>
          <span className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/40 text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Information Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              {t("user.store_info")}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                {t("user.store_name")}
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white outline-none transition"
              />
            </div>

            <button
              onClick={handleSaveStoreName}
              disabled={loading}
              className="w-full rounded-2xl bg-blue-900 hover:bg-blue-950 py-3.5 px-4 text-xs sm:text-sm font-extrabold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? t("borrower_modal.saving") : t("user.save_store_name")}
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              {t("user.change_password")}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                {t("user.current_password")}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                {t("user.new_password")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                {t("user.confirm_password")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white outline-none transition"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-950 py-3.5 px-4 text-xs sm:text-sm font-extrabold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? t("borrower_modal.saving") : t("user.change_password")}
            </button>
          </div>
        </div>

        {/* Subscription Plan Overview Card */}
        <div className="rounded-3xl border border-amber-300/60 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-slate-900 text-white p-6 shadow-md space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Listahub Subscription Tier</h2>
                <p className="text-xs text-amber-200/80">Active Plan: <span className="font-bold text-amber-400">PREMIUM VIP</span></p>
              </div>
            </div>
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
            >
              Manage / Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <GlobalModal
        isOpen={globalModal.isOpen}
        onClose={() => setGlobalModal((prev) => ({ ...prev, isOpen: false }))}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
      />
    </div>
  );
}
