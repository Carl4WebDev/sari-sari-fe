import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/users/useUser.js";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialMode = "login", onClose }: AuthModalProps) {
  const { login, register, loading, error } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isClosing, setIsClosing] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLocalError("");
      setIsClosing(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [initialMode, isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const res = await login(email, password);
    if (res?.ok) {
      handleClose();
      navigate("/dashboard");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setLocalError("You must accept the Terms and Privacy Agreement");
      return;
    }

    const res = await register({
      email,
      store_name: storeName,
      password,
    });

    if (res?.ok) {
      handleClose();
      navigate("/dashboard");
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto ${
        isClosing ? "opacity-0 transition-opacity duration-200" : "animate-backdrop-fade"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-950/30 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto ${
          isClosing ? "scale-95 opacity-0 translate-y-3 transition-all duration-200" : "animate-modal-pop"
        }`}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-100/90 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30 relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-950 text-base leading-tight tracking-tight">
                  ListaHub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/70">
                  Store Access
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {mode === "login" ? "Sign in to manage your store" : "Create a new store account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 border border-slate-200/60"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-5 pt-4 pb-2 bg-white">
          <div className="grid grid-cols-2 gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => { setMode("login"); setLocalError(""); }}
              className={`py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white text-slate-950 shadow-xs scale-100 font-black"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50 font-bold"
              }`}
            >
              <span>{t("auth.login")}</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setLocalError(""); }}
              className={`py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-white text-slate-950 shadow-xs scale-100 font-black"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50 font-bold"
              }`}
            >
              <span>{t("landing.create_account")}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div key={mode} className="p-5 overflow-y-auto space-y-4 flex-1 animate-tab-fade">
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200/90 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200/90 pl-10 pr-11 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
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

              {(localError || error) && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-black animate-fadeIn">
                  <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{localError || error}</span>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 text-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>{t("auth.logging_in")}...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("auth.login")}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{t("auth.info_notice")}</span>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("register.email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/90 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("register.store_name")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/90 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    placeholder="e.g. Aling Nena Sari-Sari Store"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("register.password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/90 pl-10 pr-11 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
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
                  {t("register.confirm_password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/90 pl-10 pr-11 py-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    placeholder="••••••••"
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

              <div className="rounded-2xl bg-slate-50/80 p-3 text-[11px] leading-relaxed text-slate-600 space-y-1.5 border border-slate-200/80 shadow-2xs">
                <p className="font-medium text-slate-500">{t("register.terms_notice")}</p>
                <label className="flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer pt-0.5 select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4 cursor-pointer"
                  />
                  <span>{t("register.terms_checkbox")}</span>
                </label>
              </div>

              {(localError || error) && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-black animate-fadeIn">
                  <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{localError || error}</span>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 text-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>{t("register.creating")}...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("register.create_account")}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
