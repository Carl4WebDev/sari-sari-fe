const EMAILJS_SERVICE_ID = "service_d4wyl2e";
const EMAILJS_TEMPLATE_ID = "template_ra5y0ek";
const EMAILJS_PUBLIC_KEY = "ZHn8_FBOZfQ8daVBK";

export async function sendCollectionReminderEmail({
  borrowerEmail,
  borrowerName,
  amount,
  dueDate,
  storeName,
}: {
  borrowerEmail: string;
  borrowerName: string;
  amount: number;
  dueDate: string;
  storeName: string;
}): Promise<boolean> {
  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            user_email: borrowerEmail,
            user_name: borrowerName,
            subject: `Payment Reminder — ${storeName}`,
            message: `Dear ${borrowerName},\n\nThis is a friendly reminder that your balance of P${amount.toLocaleString()} at ${storeName} is due on ${formattedDate}.\n\nPlease settle your payment at your earliest convenience.\n\nThank you,\n${storeName}`,
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("EmailJS Error:", error);
    return false;
  }
}
