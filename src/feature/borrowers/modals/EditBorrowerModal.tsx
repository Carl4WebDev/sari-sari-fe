import { useState, useEffect, useRef } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";
import GlobalModal from "../../../shared/components/GlobalModal";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrower: any;
  onBorrowerUpdated: () => void;
}

export default function EditBorrowerModal({
  isOpen,
  isClose,
  borrower,
  onBorrowerUpdated,
}: Props) {
  const { t } = useTranslation();
  const {
    updateBorrower,
    uploadBorrowerProfileImage,
    loading,
    uploadingProfileImage,
    error,
    clearError,
  } = useBorrower();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [animate, setAnimate] = useState(false);

  const [fName, setFName] = useState("");
  const [mName, setMName] = useState("");
  const [lName, setLName] = useState("");
  const [dob, setDob] = useState("");
  const [contact, setContact] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Pre-fill form when borrower changes
  useEffect(() => {
    if (borrower && isOpen) {
      setFName(borrower.first_name || "");
      setMName(borrower.middle_name || "");
      setLName(borrower.last_name || "");
      setDob(borrower.dob ? borrower.dob.split("T")[0] : "");
      setContact(borrower.contact_number || "");
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [borrower, isOpen]);

  // Animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  // Show backend errors
  useEffect(() => {
    if (error) {
      setGlobalModal({
        isOpen: true,
        title: "Error",
        message: error,
        type: "error",
      });
      clearError();
    }
  }, [error, clearError]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!fName.trim() || !lName.trim()) {
      setGlobalModal({
        isOpen: true,
        title: "Missing",
        message: t("borrower_modal.required_message"),
        type: "warning",
      });
      return;
    }

    // Update text fields
    const res = await updateBorrower(borrower.borrower_id, {
      first_name: fName.trim(),
      middle_name: mName.trim() || null,
      last_name: lName.trim(),
      dob: dob || null,
      contact_number: contact.trim() || null,
    });

    if (!res?.ok) return;

    // Upload image if selected
    if (selectedImage) {
      await uploadBorrowerProfileImage(borrower.borrower_id, selectedImage);
    }

    onBorrowerUpdated();
    isClose();
  };

  if (!isOpen) return null;

  const profileImageUrl = imagePreview || resolveImageUrl(borrower?.profile_image_url);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          animate ? "opacity-100" : "opacity-0"
        }`}
        onClick={isClose}
      >
        <div
          className={`
            fixed bottom-0 left-0 right-0 z-50
            max-h-[90vh] overflow-y-auto
            rounded-t-2xl bg-white
            transform transition-transform duration-300 ease-out
            ${animate ? "translate-y-0" : "translate-y-full"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pb-8">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1E3A8A]">
                {t("details.edit_profile")}
              </h2>
              <button
                onClick={isClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Profile Image */}
            <div className="mb-5 flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingProfileImage}
                className="relative h-24 w-24 rounded-full"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-4 border-[#1E3A8A] object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#1E3A8A] bg-blue-50 text-3xl font-bold text-[#1E3A8A] shadow-xl">
                    {borrower?.first_name?.[0]}
                    {borrower?.last_name?.[0]}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 rounded-full bg-[#1E3A8A] px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  {uploadingProfileImage ? "..." : t("details.change_image")}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              {selectedImage && (
                <p className="mt-2 text-xs text-green-600">
                  {selectedImage.name}
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("borrower_modal.first_name")} *
                </label>
                <input
                  type="text"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("borrower_modal.middle_name")}
                </label>
                <input
                  type="text"
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("borrower_modal.last_name")} *
                </label>
                <input
                  type="text"
                  value={lName}
                  onChange={(e) => setLName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("details.dob")}
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("borrower_modal.contact")}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={isClose}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
              >
                {t("borrower_modal.cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || uploadingProfileImage}
                className="flex-1 rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading || uploadingProfileImage
                  ? t("borrower_modal.saving")
                  : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() => setGlobalModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
