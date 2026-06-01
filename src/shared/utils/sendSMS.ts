/**
 * Check if the current device supports SMS (actual mobile phones only).
 */
export function canSendSMS(): boolean {
  const ua = navigator.userAgent || "";
  return /Android.*Mobile|iPhone|iPod/i.test(ua);
}

/**
 * Build a collection reminder SMS message.
 */
export function buildReminderSMS({
  firstName,
  storeName,
  amount,
  dueDate,
}: {
  firstName: string;
  storeName: string;
  amount: number;
  dueDate: string;
}): string {
  return `Hi ${firstName}, your balance at ${storeName} is P${Number(amount).toLocaleString()}. Please settle by ${dueDate}. Thank you!`;
}

/**
 * Normalize a Philippine phone number to +639XXXXXXXXX format.
 * Returns null if the number is not a valid PH number.
 */
export function normalizePHNumber(phoneNumber: string): string | null {
  if (!phoneNumber) return null;
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("639") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("09") && digits.length === 11) return `+63${digits.slice(1)}`;
  if (digits.startsWith("9") && digits.length === 10) return `+63${digits}`;
  return null;
}

/**
 * Open the device's native SMS app with a pre-filled message.
 *
 * ONLY works on mobile phones (Android/iPhone). On desktop or tablets,
 * does nothing and returns false — callers should show a warning.
 *
 * @returns true if SMS app was opened, false if not supported
 */
export function sendNativeSMS(phoneNumber: string, message: string): boolean {
  if (!canSendSMS()) return false;

  const normalized = normalizePHNumber(phoneNumber);
  if (!normalized) return false;

  const encoded = encodeURIComponent(message);
  window.location.href = `sms:${normalized}?body=${encoded}`;
  return true;
}
