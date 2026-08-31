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
  const [storeName, setStoreName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLocalError("");
      setIsClosing(false);
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
      className={`fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 selection:bg-blue-900 selection:text-white transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "animate-backdrop-fade"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0 translate-y-4" : "animate-modal-pop"
        }`}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md border border-blue-800 transition hover:scale-105">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm leading-tight">Listahub</h3>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Store Access Portal</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-2 bg-slate-100/80 border-b border-slate-200/60">
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-2xl relative">
            <button
              onClick={() => { setMode("login"); setLocalError(""); }}
              className={`py-2 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white text-blue-900 shadow-sm scale-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
              }`}
            >
              <span>{t("auth.login")}</span>
            </button>
            <button
              onClick={() => { setMode("register"); setLocalError(""); }}
              className={`py-2 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-white text-blue-900 shadow-sm scale-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
              }`}
            >
              <span>{t("landing.create_account")}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div key={mode} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 animate-tab-fade">
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition bg-slate-50/50 focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {t("auth.password")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition bg-slate-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              {(localError || error) && (
                <p className="text-xs text-rose-600 text-center font-extrabold bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {localError || error}
                </p>
              )}

              <p className="text-center text-[11px] leading-relaxed text-slate-400 font-semibold">
                {t("auth.info_notice")}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95 flex items-center justify-center text-center"
              >
                {loading ? t("auth.logging_in") : t("auth.login")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {t("register.email")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition bg-slate-50/50 focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {t("register.store_name")}
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition bg-slate-50/50 focus:bg-white"
                  placeholder="Store Name"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {t("register.password")}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition bg-slate-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {t("register.confirm_password")}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition bg-slate-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-600 space-y-1.5 border border-slate-200/80">
                <p className="font-medium">{t("register.terms_notice")}</p>
                <label className="flex items-start gap-2 font-black text-slate-800 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900 h-3.5 w-3.5"
                  />
                  <span>{t("register.terms_checkbox")}</span>
                </label>
              </div>

              {(localError || error) && (
                <p className="text-xs text-rose-600 text-center font-extrabold bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {localError || error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95 flex items-center justify-center text-center"
              >
                {loading ? t("register.creating") : t("register.create_account")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
