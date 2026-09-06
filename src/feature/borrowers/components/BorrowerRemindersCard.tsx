import { useTranslation } from "../../../shared/i18n/useTranslation";
import { sendNativeSMS, buildReminderSMS, canSendSMS } from "../../../shared/utils/sendSMS";

interface CollectionReminder {
  reminder_id: number;
  amount_expected: number;
  status: string;
  due_date: string;
  note?: string;
}

interface BorrowerRemindersCardProps {
  reminders: CollectionReminder[];
  borrower: {
    borrower_id: number;
    first_name: string;
    contact_number?: string;
  };
  isOnline: boolean;
}

export default function BorrowerRemindersCard({
  reminders,
  borrower,
  isOnline,
}: BorrowerRemindersCardProps) {
  const { t } = useTranslation();

  return (
    <div className="border-t border-slate-200/80 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-base font-black text-slate-950 tracking-tight">
            {t("details.collection_reminders")}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 text-slate-600 text-xs font-black px-2.5 py-0.5">
          {(reminders || []).length}
        </span>
      </div>

      {(reminders || []).length === 0 && (
        <div className="rounded-3xl bg-slate-50/60 border border-slate-200/80 p-8 text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs font-black text-slate-900">
            {t("details.no_reminders_yet")}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">
            Set collection reminders to keep track of promised due dates.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {(reminders || []).map((reminder) => (
          <div
            key={reminder.reminder_id}
            className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Expected Amount
                </span>
                <p className="font-black text-slate-950 text-base sm:text-lg mt-0.5">
                  ₱{Number(reminder.amount_expected || 0).toLocaleString()}
                </p>
              </div>

              <span className="rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-black text-amber-700">
                {reminder.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {t("details.due")} {new Date(reminder.due_date).toLocaleDateString()}
              </span>
            </div>

            {reminder.note && (
              <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {reminder.note}
              </p>
            )}

            {borrower.contact_number && isOnline && (
              <div className="pt-1 flex gap-2">
                {canSendSMS() ? (
                  <button
                    type="button"
                    onClick={() => {
                      const msg = buildReminderSMS({
                        firstName: borrower.first_name,
                        storeName: JSON.parse(localStorage.getItem("user") || "{}").store_name || "Store",
                        amount: reminder.amount_expected || 0,
                        dueDate: new Date(reminder.due_date).toLocaleDateString(),
                      });
                      sendNativeSMS(borrower.contact_number!, msg);
                    }}
                    className="rounded-2xl border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{t("sms.send")}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                    {t("sms.mobile_only")}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
