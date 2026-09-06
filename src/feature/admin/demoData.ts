import type { AdminProfileData, ManagedCustomer } from './api';
import type { AdminData, Customer, Payment, Plan } from '../subscription/api';

const DEMO_STORAGE_KEY = 'listahub_admin_demo_state';

interface DemoStoreState {
  profile: AdminProfileData;
  managedCustomers: ManagedCustomer[];
  customers: Customer[];
  payments: Payment[];
  plans: Plan[];
}

function getDefaultState(): DemoStoreState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    profile: {
      user_id: 1,
      store_name: "ListaHub HQ Admin",
      email: "admin@listahub.ph",
      created_at: "2025-01-01T00:00:00.000Z",
    },
    plans: [
      { id: 'basic', name: 'Basic', monthly: 99, annualMonthly: 79 },
      { id: 'plus', name: 'Plus', monthly: 199, annualMonthly: 159 },
      { id: 'pro', name: 'Pro', monthly: 299, annualMonthly: 239 },
    ],
    managedCustomers: [
      { user_id: 101, store_name: "Aling Nena Sari-Sari Store", email: "nena@sarisari.ph", created_at: "2025-01-10T08:30:00.000Z", deleted_at: null },
      { user_id: 102, store_name: "Mang Jose General Merchandise", email: "jose.store@gmail.com", created_at: "2025-02-14T09:15:00.000Z", deleted_at: null },
      { user_id: 103, store_name: "Tindahan ni Ate Joy", email: "atejoy@yahoo.com", created_at: "2025-03-01T11:00:00.000Z", deleted_at: null },
      { user_id: 104, store_name: "Kuya Ben Mini Mart", email: "kuyaben@mart.ph", created_at: "2025-03-15T14:20:00.000Z", deleted_at: null },
      { user_id: 105, store_name: "Nanay Rosa Variety Store", email: "rosastore@gmail.com", created_at: "2025-04-02T10:45:00.000Z", deleted_at: null },
      { user_id: 106, store_name: "Kanto Corner Convenience", email: "kantocorner@outlook.com", created_at: "2025-04-20T16:10:00.000Z", deleted_at: null },
    ],
    customers: [
      {
        user_id: 101,
        store_name: "Aling Nena Sari-Sari Store",
        email: "nena@sarisari.ph",
        created_at: "2025-01-10",
        plan: "pro",
        status: "Active",
        start_date: "2025-01-10",
        end_date: "2027-01-10",
        days_remaining: 320,
      },
      {
        user_id: 102,
        store_name: "Mang Jose General Merchandise",
        email: "jose.store@gmail.com",
        created_at: "2025-02-14",
        plan: "plus",
        status: "Expiring soon",
        start_date: "2025-08-14",
        end_date: "2026-09-12",
        days_remaining: 5,
      },
      {
        user_id: 103,
        store_name: "Tindahan ni Ate Joy",
        email: "atejoy@yahoo.com",
        created_at: "2025-03-01",
        plan: "basic",
        status: "Expired",
        start_date: "2025-03-01",
        end_date: "2026-08-30",
        days_remaining: 0,
      },
      {
        user_id: 104,
        store_name: "Kuya Ben Mini Mart",
        email: "kuyaben@mart.ph",
        created_at: "2025-03-15",
        plan: null,
        status: "No subscription",
        start_date: null,
        end_date: null,
        days_remaining: null,
      },
      {
        user_id: 105,
        store_name: "Nanay Rosa Variety Store",
        email: "rosastore@gmail.com",
        created_at: "2025-04-02",
        plan: "pro",
        status: "Active",
        start_date: "2025-04-02",
        end_date: "2026-12-31",
        days_remaining: 115,
      },
      {
        user_id: 106,
        store_name: "Kanto Corner Convenience",
        email: "kantocorner@outlook.com",
        created_at: "2025-04-20",
        plan: "basic",
        status: "Expiring soon",
        start_date: "2026-06-10",
        end_date: "2026-09-09",
        days_remaining: 2,
      },
    ],
    payments: [
      {
        payment_id: 501,
        user_id: 101,
        store_name: "Aling Nena Sari-Sari Store",
        plan: "pro",
        amount: "2868",
        payment_method: "GCash",
        reference_number: "GC-9821039821",
        payment_date: today,
        duration: 12,
        verifier: "ListaHub HQ Admin",
        notes: "Annual upfront payment",
      },
      {
        payment_id: 502,
        user_id: 102,
        store_name: "Mang Jose General Merchandise",
        plan: "plus",
        amount: "597",
        payment_method: "GCash",
        reference_number: "GC-7712903841",
        payment_date: today,
        duration: 3,
        verifier: "ListaHub HQ Admin",
        notes: "3 months renewal",
      },
      {
        payment_id: 503,
        user_id: 105,
        store_name: "Nanay Rosa Variety Store",
        plan: "pro",
        amount: "1794",
        payment_method: "Bank Transfer",
        reference_number: "BDO-11928374",
        payment_date: "2026-07-02",
        duration: 6,
        verifier: "ListaHub HQ Admin",
        notes: "6 months semi-annual",
      },
      {
        payment_id: 504,
        user_id: 106,
        store_name: "Kanto Corner Convenience",
        plan: "basic",
        amount: "99",
        payment_method: "GCash",
        reference_number: "GC-4481029481",
        payment_date: "2026-08-10",
        duration: 1,
        verifier: "ListaHub HQ Admin",
        notes: "Monthly renewal",
      },
    ],
  };
}

function loadState(): DemoStoreState {
  try {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  const initial = getDefaultState();
  saveState(initial);
  return initial;
}

function saveState(state: DemoStoreState) {
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function isDemoAdminSession(): boolean {
  return sessionStorage.getItem('listahub_admin_session') === 'admin_demo_session';
}

export function getAdminDemoProfile(): AdminProfileData {
  return loadState().profile;
}

export function updateAdminDemoProfile(data: { store_name: string; email: string }): AdminProfileData {
  const state = loadState();
  state.profile = {
    ...state.profile,
    store_name: data.store_name,
    email: data.email,
  };
  saveState(state);
  return state.profile;
}

export function getAdminDemoData(): AdminData {
  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  return {
    today,
    plans: state.plans,
    customers: state.customers,
    payments: state.payments,
  };
}

export function getAdminDemoManagedCustomers(): ManagedCustomer[] {
  return loadState().managedCustomers;
}

export function createAdminDemoCustomer(data: { store_name: string; email: string }): ManagedCustomer {
  const state = loadState();
  const nextId = Math.max(100, ...state.managedCustomers.map((c) => c.user_id)) + 1;
  const newCustomer: ManagedCustomer = {
    user_id: nextId,
    store_name: data.store_name,
    email: data.email,
    created_at: new Date().toISOString(),
    deleted_at: null,
  };
  state.managedCustomers.push(newCustomer);
  state.customers.push({
    user_id: nextId,
    store_name: data.store_name,
    email: data.email,
    created_at: new Date().toISOString().slice(0, 10),
    plan: null,
    status: 'No subscription',
    start_date: null,
    end_date: null,
    days_remaining: null,
  });
  saveState(state);
  return newCustomer;
}

export function updateAdminDemoCustomer(id: number, data: { store_name: string; email: string }): ManagedCustomer {
  const state = loadState();
  const index = state.managedCustomers.findIndex((c) => c.user_id === id);
  if (index !== -1) {
    state.managedCustomers[index] = {
      ...state.managedCustomers[index],
      store_name: data.store_name,
      email: data.email,
    };
  }
  const custIndex = state.customers.findIndex((c) => c.user_id === id);
  if (custIndex !== -1) {
    state.customers[custIndex] = {
      ...state.customers[custIndex],
      store_name: data.store_name,
      email: data.email,
    };
  }
  saveState(state);
  return state.managedCustomers[index] || { user_id: id, store_name: data.store_name, email: data.email, deleted_at: null };
}

export function deleteAdminDemoCustomer(id: number): void {
  const state = loadState();
  const index = state.managedCustomers.findIndex((c) => c.user_id === id);
  if (index !== -1) {
    state.managedCustomers[index].deleted_at = new Date().toISOString();
  }
  saveState(state);
}

export function restoreAdminDemoCustomer(id: number): void {
  const state = loadState();
  const index = state.managedCustomers.findIndex((c) => c.user_id === id);
  if (index !== -1) {
    state.managedCustomers[index].deleted_at = null;
  }
  saveState(state);
}

export function resetAdminDemoCustomerPassword(id: number, _password: string): void {
  const state = loadState();
  const customer = state.managedCustomers.find((c) => c.user_id === id);
  if (customer) {
    saveState(state);
  }
}

export function recordAdminDemoPayment(payload: {
  user_id: number;
  plan: string;
  duration: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  amount: number;
  notes?: string;
}): { end_date: string } {
  const state = loadState();
  const customer = state.customers.find((c) => c.user_id === payload.user_id);
  const store_name = customer?.store_name || "Customer Store";

  const durationMonths = Number(payload.duration) || 1;
  const baseDateStr = (customer && ['Active', 'Expiring soon'].includes(customer.status) && customer.end_date)
    ? customer.end_date
    : payload.payment_date;

  const preview = new Date(`${baseDateStr}T00:00:00Z`);
  const day = preview.getUTCDate();
  preview.setUTCDate(1);
  preview.setUTCMonth(preview.getUTCMonth() + durationMonths);
  preview.setUTCDate(Math.min(day, new Date(Date.UTC(preview.getUTCFullYear(), preview.getUTCMonth() + 1, 0)).getUTCDate()));
  const expiry = Number.isFinite(preview.getTime()) ? preview.toISOString().slice(0, 10) : payload.payment_date;

  const newPayment: Payment = {
    payment_id: Math.max(500, ...state.payments.map((p) => p.payment_id)) + 1,
    user_id: payload.user_id,
    store_name,
    plan: payload.plan,
    amount: String(payload.amount),
    payment_method: payload.payment_method,
    reference_number: payload.reference_number,
    payment_date: payload.payment_date,
    duration: durationMonths,
    verifier: "ListaHub HQ Admin",
    notes: payload.notes || "",
  };

  state.payments.unshift(newPayment);

  if (customer) {
    customer.plan = payload.plan;
    customer.status = "Active";
    customer.start_date = customer.start_date || payload.payment_date;
    customer.end_date = expiry;
    const diffDays = Math.ceil((preview.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    customer.days_remaining = Math.max(0, diffDays);
  }

  saveState(state);
  return { end_date: expiry };
}
