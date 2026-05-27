import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/users/useUser";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export default function RegisterPage() {
  const { register, loading, error } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e) => {
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

    const store_name = storeName

    const res = await register({
      email,
      store_name,
      password,
    });

    if (res?.ok) {
      // registration success
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-8 text-center text-2xl font-semibold text-[#1E3A8A]">
          {t("register.title")}
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("register.email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("register.store_name")}
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              placeholder="store name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("register.password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("register.confirm_password")}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              placeholder="••••••••"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-xs leading-5 text-gray-600">
  <p>
    {t("register.terms_notice")}
  </p>

  <label className="mt-3 flex items-start gap-2">
    <input
      type="checkbox"
      checked={acceptedTerms}
      onChange={(e) => setAcceptedTerms(e.target.checked)}
      className="mt-1"
    />

    <span>
      {t("register.terms_checkbox")}
    </span>
  </label>
</div>

          {(localError || error) && (
            <p className="text-sm text-red-600 text-center">
              {localError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1E3A8A] py-2 text-sm font-medium text-white transition hover:bg-[#172E6B] disabled:opacity-60"
          >
            {loading ? t("register.creating") : t("register.create_account")}
          </button>

          <Link to="/login">
            <div className="text-center text-sm text-[#1E3A8A] hover:underline">
              {t("register.back_to_login")}
            </div>
          </Link>
        </form>
      </div>
    </div>
  );
}