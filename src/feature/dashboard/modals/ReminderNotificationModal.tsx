import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { sendNativeSMS, buildReminderSMS, canSendSMS } from "../../../shared/utils/sendSMS";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  reminders: {
    todays_collections?: any[];
    overdue?: any[];
    upcoming?: any[];
  };
  storeName?: string;
  onMarkDone: (reminderId: number) => Promise<void>;
  onRemindAgain?: (reminderId: number) => Promise<void>;
  onSendEmail?: (reminderId: number) => Promise<void>;
}

export default function ReminderNotificationModal({
  isOpen,
  isClose,
  reminders,
  storeName,
  onMarkDone,
  onRemindAgain,
  onSendEmail,
}: Props) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const todays = reminders?.todays_collections || [];
  const overdue = reminders?.overdue || [];
  const upcoming = reminders?.upcoming || [];
  const totalCount = todays.length + overdue.length + upcoming.length;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] my-auto animate-modal-pop"
      >
        {/* Modern Rich Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden border-b border-slate-800">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 shrink-0 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Collection Reminders
                </h2>
                {totalCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
                    {totalCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Track today, overdue, and upcoming collections
              </p>
            </div>
          </div>

          <button
            onClick={isClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer relative z-10"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          <ReminderSection
            title="Today's Collections"
            type="today"
            items={todays}
            emptyText="No collections scheduled for today."
            badgeClass="bg-blue-600 text-white"
            storeName={storeName}
            onMarkDone={onMarkDone}
            onSendEmail={onSendEmail}
          />

          <ReminderSection
            title="Overdue Borrowers"
            type="overdue"
            items={overdue}
            emptyText="Great news! No overdue collection reminders."
            badgeClass="bg-rose-600 text-white"
            storeName={storeName}
            onMarkDone={onMarkDone}
            onRemindAgain={onRemindAgain}
            onSendEmail={onSendEmail}
          />

          <ReminderSection
            title="Upcoming Reminders"
            type="upcoming"
            items={upcoming}
            emptyText="No upcoming collection reminders scheduled."
            badgeClass="bg-emerald-600 text-white"
            storeName={storeName}
            onMarkDone={onMarkDone}
            onSendEmail={onSendEmail}
          />
        </div>
      </div>
    </div>
  );
}

function ReminderSection({
  title,
  type,
  items,
  emptyText,
  badgeClass,
  storeName,
  onMarkDone,
  onRemindAgain,
  onSendEmail,
}: {
  title: string;
  type: "today" | "overdue" | "upcoming";
  items: any[];
  emptyText: string;
  badgeClass: string;
  storeName?: string;
  onMarkDone: (reminderId: number) => Promise<void>;
  onRemindAgain?: (reminderId: number) => Promise<void>;
  onSendEmail?: (reminderId: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sectionConfig = {
    today: {
      icon: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      emptyBg: "bg-blue-50/70 border-blue-100 text-blue-800",
      emptyIcon: (
        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    overdue: {
      icon: (
        <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      emptyBg: "bg-emerald-50/70 border-emerald-100 text-emerald-800",
      emptyIcon: (
        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    upcoming: {
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      emptyBg: "bg-slate-100/80 border-slate-200/80 text-slate-600",
      emptyIcon: (
        <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }[type];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          {sectionConfig.icon}
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            {title}
          </h3>
        </div>

        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${badgeClass} shadow-2xs`}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className={`rounded-2xl border ${sectionConfig.emptyBg} p-3.5 text-xs font-semibold flex items-center gap-3 shadow-2xs`}>
          {sectionConfig.emptyIcon}
          <span>{emptyText}</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item: any) => (
            <div
              key={item.reminder_id}
              className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <Link
                    to={`/borrowers/${item.borrower_id}`}
                    className="text-sm font-extrabold text-slate-900 hover:text-blue-600 transition"
                  >
                    {item.first_name} {item.last_name}
                  </Link>

                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <span>Due:</span>
                    <span className="font-bold text-slate-700">{new Date(item.due_date).toLocaleDateString()}</span>
                  </p>

                  {item.note && (
                    <p className="text-xs text-slate-600 mt-1 italic bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      "{item.note}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 uppercase font-extrabold block text-[10px]">Expected</span>
                  <p className="text-sm font-black text-slate-900">
                    ₱{Number(item.amount_expected || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                <button
                  onClick={async () => {
                    await onMarkDone(item.reminder_id);
                    navigate(`/borrowers/${item.borrower_id}`, {
                      state: { openPayment: true },
                    });
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-97"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mark Done</span>
                </button>

                {onRemindAgain && (
                  <button
                    onClick={async () => {
                      await onRemindAgain(item.reminder_id);
                    }}
                    className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-97"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Snooze</span>
                  </button>
                )}

                {onSendEmail && (
                  <button
                    onClick={async () => {
                      await onSendEmail(item.reminder_id);
                    }}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-97"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email</span>
                  </button>
                )}

                {item.contact_number && (
                  canSendSMS() ? (
                    <button
                      onClick={() => {
                        const msg = buildReminderSMS({
                          firstName: item.first_name,
                          storeName: storeName || "Store",
                          amount: item.amount_expected || 0,
                          dueDate: new Date(item.due_date).toLocaleDateString(),
                        });
                        sendNativeSMS(item.contact_number, msg);
                      }}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-97"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{t("sms.send")}</span>
                    </button>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-2 py-1 text-[10px] text-slate-500 font-medium self-center">
                      {t("sms.mobile_only")}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}