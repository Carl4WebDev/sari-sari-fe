import { getAdminDemoData, recordAdminDemoPayment } from '../admin/demoData';

export type Customer = { user_id: number; store_name: string; email: string; created_at: string; plan: string | null; status: string; start_date: string | null; end_date: string | null; days_remaining: number | null };
export type Payment = { payment_id: number; user_id: number; store_name: string; plan: string; amount: string; payment_method: string; reference_number: string; payment_date: string; duration: number; verifier: string; notes: string };
export type Plan = { id: string; name: string; monthly: number; annualMonthly: number };
export type AdminData = { customers: Customer[]; payments: Payment[]; plans: Plan[]; today: string };
export async function subscriptionRequest<T>(path: string, body?: unknown): Promise<T> {
  if (path.startsWith('/admin') && sessionStorage.getItem('listahub_admin_session') === 'admin_demo_session') {
    if (path === '/admin') {
      return getAdminDemoData() as unknown as T;
    }
    if (path === '/admin/payments' && body) {
      return recordAdminDemoPayment(body as any) as unknown as T;
    }
    return getAdminDemoData() as unknown as T;
  }

  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '').replace(/\/api$/, '');
  const response = await fetch(`${base}/api/subscriptions${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(path.startsWith('/admin') ? sessionStorage.getItem('listahub_admin_session') : localStorage.getItem('user_token')) || ''}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await response.json();
  if(response.status===401 && path.startsWith('/admin')) { sessionStorage.removeItem('listahub_admin_session');window.location.assign('/login'); }
  if (!response.ok) throw new Error(json.message || json.error || 'Unable to load subscriptions.');
  return json.data;
}
export const money = (value: number | string) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(Number(value));
