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
  const [email, setEmail] = useState("");

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
      setEmail(borrower.email || "");
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
      email: email.trim() || null,
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
        className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
        onClick={isClose}
      >
        <div
          className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950 tracking-tight">
                  {t("details.edit_profile")}
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Update customer details and avatar
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={isClose}
              className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center pb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingProfileImage}
                className="group relative cursor-pointer active:scale-95 transition"
              >
                <div className="h-24 w-24 rounded-3xl overflow-hidden shadow-md">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-2xl font-black text-white border-2 border-slate-800">
                      {borrower?.first_name?.[0]}
                      {borrower?.last_name?.[0]}
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-md border-2 border-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />

              <p className="mt-2 text-xs font-bold text-slate-500">
                {selectedImage ? (
                  <span className="text-emerald-600 font-black">✓ {selectedImage.name}</span>
                ) : (
                  <span>Click to change photo</span>
                )}
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t("borrower_modal.first_name")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Juan"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t("borrower_modal.middle_name")} <span className="text-slate-400 font-semibold">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Santos"
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t("borrower_modal.last_name")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cruz"
                  value={lName}
                  onChange={(e) => setLName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t("details.dob")}
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t("borrower_modal.contact")}
                </label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t("borrower_modal.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={isClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 py-3.5 text-xs sm:text-sm font-black text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer text-center"
            >
              {t("borrower_modal.cancel")}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || uploadingProfileImage}
              className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 text-xs sm:text-sm font-black text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading || uploadingProfileImage ? (
                <span>{t("borrower_modal.saving")}</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t("common.save")}</span>
                </>
              )}
            </button>
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
