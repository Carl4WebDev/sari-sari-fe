import { useTranslation } from "../../../shared/i18n/useTranslation";
import { calculateAge } from "../../components/utility/calculateAge";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";

interface BorrowerProfileHeaderProps {
  borrower: {
    borrower_id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    contact_number?: string;
    dob?: string;
    email?: string;
    profile_image_url?: string;
    is_active?: boolean;
  };
  totalBalance: number;
  isOnline: boolean;
  onEditProfile: () => void;
}

export default function BorrowerProfileHeader({
  borrower,
  totalBalance,
  isOnline,
  onEditProfile,
}: BorrowerProfileHeaderProps) {
  const { t } = useTranslation();
  const profileImageUrl = resolveImageUrl(borrower.profile_image_url);

  const balance = Number(totalBalance || 0);
  const paymentStatus = balance <= 0 ? t("details.fully_paid") : t("details.with_balance");
  const activityStatus = borrower.is_active ? t("details.active") : t("details.archived");

  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200/90 bg-white p-6 md:p-8 shadow-2xs space-y-4">
      <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Borrower profile"
            className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border-2 border-white object-cover shadow-md"
          />
        ) : (
          <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-2xl sm:text-3xl font-black text-white shadow-md border-2 border-slate-800">
            {borrower.first_name?.[0]}
            {borrower.last_name?.[0]}
          </div>
        )}
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          {borrower.first_name} {borrower.middle_name ? `${borrower.middle_name} ` : ""}{borrower.last_name}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-xs font-bold text-slate-700">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{borrower.contact_number || t("borrowers.no_contact")}</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100/80 text-xs font-bold text-slate-700">
            <span>{t("details.age")}</span>
            <span>{calculateAge(borrower.dob)}</span>
          </div>
        </div>

        {borrower.email && (
          <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5 pt-1">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{borrower.email}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <span
          className={`rounded-xl px-3 py-1 text-xs font-black shadow-2xs ${
            balance <= 0
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {paymentStatus}
        </span>

        <span
          className={`rounded-xl px-3 py-1 text-xs font-black shadow-2xs ${
            borrower.is_active
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          {activityStatus}
        </span>
      </div>

      {isOnline && (
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs sm:text-sm font-black text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>{t("details.edit_profile")}</span>
        </button>
      )}
    </div>
  );
}
