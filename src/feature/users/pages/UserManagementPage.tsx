import { useEffect, useState } from "react";
import { useUser } from "../../context/users/useUser";
import { useSubscription } from "../../subscription/context/useSubscription";
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
  const { subscription, fetchSubscription } = useSubscription();

  const [storeName, setStoreName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const activePlan = (subscription?.plan || localStorage.getItem("user_subscription_plan") || "FREE").toUpperCase();

  useEffect(() => {
    fetchProfile();
    fetchSubscription();
  }, [fetchProfile, fetchSubscription]);

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

  const storeInitial = (profile?.store_name || storeName || "S").charAt(0).toUpperCase();

  return (
    <div className="space-y-6 pb-24 relative min-h-full">
      {/* Header Banner */}
      <div className="rounded-[2rem] bg-slate-900 p-6 sm:p-7 text-white shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-600/30 shrink-0 border border-blue-400/30">
              {storeInitial}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {profile?.store_name || storeName || t("user.profile")}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Account
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-semibold truncate flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{profile?.email || "owner@listahub.ph"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-blue-400 text-xs font-black flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Verified Store</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Store Information Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {t("user.store_info")}
                </h2>
                <p className="text-xs font-semibold text-slate-400">Manage your sari-sari store name</p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("user.store_name")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Enter store name"
                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition text-slate-900 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveStoreName}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 py-3.5 px-4 text-xs sm:text-sm font-black text-white shadow-md shadow-blue-600/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{t("borrower_modal.saving")}...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t("user.save_store_name")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center shadow-2xs shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {t("user.change_password")}
                </h2>
                <p className="text-xs font-semibold text-slate-400">Update your account security</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("user.current_password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-11 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition text-slate-900 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("user.new_password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-11 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition text-slate-900 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("user.confirm_password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-11 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition text-slate-900 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 px-4 text-xs sm:text-sm font-black text-white shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{t("borrower_modal.saving")}...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>{t("user.change_password")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Subscription Plan Overview Card */}
        <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 text-white p-6 sm:p-7 shadow-xl space-y-5 md:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-tight">ListaHub {activePlan} Tier</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    activePlan === "FREE"
                      ? "bg-slate-700 text-slate-300 border border-slate-600"
                      : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                  }`}>
                    {subscription?.status === "active" ? "Active Status" : subscription?.status || "Active"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Plan: <span className="font-extrabold text-amber-400">{activePlan}</span> • Cycle: <span className="font-semibold text-slate-300 uppercase">{subscription?.billing_cycle || "monthly"}</span>
                  {subscription?.end_date && (
                    <span className="text-slate-400"> • Valid until {new Date(subscription.end_date).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>{activePlan === "FREE" ? "Upgrade to VIP" : "Manage / Switch Plan"}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Plan Limits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10 border-t border-slate-800/80">
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Max Borrowers</p>
              <p className="text-base font-black text-amber-300 mt-0.5">
                {subscription?.limits?.maxBorrowers && subscription.limits.maxBorrowers >= 99999
                  ? "Unlimited"
                  : `${subscription?.limits?.maxBorrowers ?? 15} Borrowers`}
              </p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SMS Reminders</p>
              <p className="text-base font-black text-slate-200 mt-0.5">
                {subscription?.limits?.allowSms ? "✅ Automated" : "❌ Not Included"}
              </p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Export PDF/CSV</p>
              <p className="text-base font-black text-slate-200 mt-0.5">
                {subscription?.limits?.allowCsvExport ? "✅ Custom" : "Basic PDF"}
              </p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cloud Sync</p>
              <p className="text-base font-black text-emerald-400 mt-0.5">
                {subscription?.limits?.allowCloudSync ? "✅ Real-time" : "Local"}
              </p>
            </div>
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
