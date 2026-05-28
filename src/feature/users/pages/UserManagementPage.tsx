import { useEffect, useState } from "react";
import { useUser } from "../../context/users/useUser";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import GlobalModal from "../../../shared/components/GlobalModal";

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
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-5 text-white shadow-sm">
        <h1 className="text-2xl font-semibold">{t("user.profile")}</h1>
        <p className="mt-1 text-sm text-blue-100">
          {profile?.email || ""}
        </p>
      </div>

      {/* Store Information */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">
          {t("user.store_info")}
        </h2>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {t("user.store_name")}
            </span>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />
          </label>

          <button
            onClick={handleSaveStoreName}
            disabled={loading}
            className="w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white transition hover:bg-[#172E6B] disabled:opacity-50"
          >
            {loading ? t("borrower_modal.saving") : t("user.save_store_name")}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">
          {t("user.change_password")}
        </h2>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {t("user.current_password")}
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {t("user.new_password")}
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {t("user.confirm_password")}
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
            />
          </label>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white transition hover:bg-[#172E6B] disabled:opacity-50"
          >
            {loading ? t("borrower_modal.saving") : t("user.change_password")}
          </button>
        </div>
      </div>

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
