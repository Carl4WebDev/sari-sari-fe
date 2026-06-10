import { calculateAge } from "../../components/utility/calculateAge";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface Props {
  borrower: any;
  totalBalance: number;
  isOnline: boolean;
  onEditProfile: () => void;
}

export default function ProfileCard({
  borrower,
  totalBalance,
  isOnline,
  onEditProfile,
}: Props) {
  const { t } = useTranslation();

  const profileImageUrl = resolveImageUrl(borrower.profile_image_url);
  const balance = Number(totalBalance || 0);
  const paymentStatus =
    balance <= 0 ? t("details.fully_paid") : t("details.with_balance");
  const paymentStatusColor =
    balance <= 0
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  const activityStatus = borrower.is_active
    ? t("details.active")
    : t("details.archived");
  const activityStatusColor = borrower.is_active
    ? "bg-blue-100 text-blue-700"
    : "bg-gray-200 text-gray-700";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-6 shadow-sm">
      <div className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Borrower profile"
            className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full border-4 border-[#1E3A8A] object-cover shadow-xl"
          />
        ) : (
          <div className="flex h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 items-center justify-center rounded-full border-4 border-[#1E3A8A] bg-blue-50 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E3A8A] shadow-xl">
            {borrower.first_name?.[0]}
            {borrower.last_name?.[0]}
          </div>
        )}
      </div>

      {!profileImageUrl && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {t("details.no_profile_uploaded")}
        </p>
      )}

      <h1 className="mt-4 text-center text-2xl font-semibold text-[#1E3A8A]">
        {borrower.first_name} {borrower.middle_name ?? ""}{" "}
        {borrower.last_name}
      </h1>

      <p className="mt-1 text-center text-sm text-gray-500">
        📞 {borrower.contact_number || t("borrowers.no_contact")}
      </p>

      {borrower.email && (
        <p className="text-center text-sm text-gray-500">
          ✉️ {borrower.email}
        </p>
      )}

      <p className="text-center text-sm text-gray-500">
        {t("details.age")} {calculateAge(borrower.dob)}
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusColor}`}
        >
          {paymentStatus}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${activityStatusColor}`}
        >
          {activityStatus}
        </span>
      </div>

      {isOnline && (
        <button
          onClick={onEditProfile}
          className="mt-4 w-full rounded-xl border border-[#1E3A8A] py-2.5 text-sm font-medium text-[#1E3A8A] transition hover:bg-blue-50"
          aria-label={t("details.edit_profile")}
        >
          {t("details.edit_profile")}
        </button>
      )}
    </div>
  );
}
