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
      { id: 'premium', name: 'Premium', monthly: 299, annualDiscount: 0.10 },
    ],
    managedCustomers: [
      { user_id: 101, store_name: "Aling Nena Sari-Sari Store", email: "nena@sarisari.ph", created_at: "2025-01-10T08:30:00.000Z", deleted_at: null },
      { user_id: 102, store_name: "Mang Jose General Merchandise", email: "jose.store@gmail.com", created_at: "2025-02-14T09:15:00.000Z", deleted_at: null },
      { user_id: 103, store_name: "Tindahan ni Ate Joy", email: "atejoy@yahoo.com", created_at: "2025-03-01T11:00:00.000Z", deleted_at: null },
    ],
    customers: [
      {
        user_id: 101,
        store_name: "Aling Nena Sari-Sari Store",
        email: "nena@sarisari.ph",
        created_at: "2025-01-10T08:30:00.000Z",
        subscription_id: 1,
        plan: null,
        status: "No subscription",
        start_date: null,
        end_date: null,
        days_remaining: null,
      },
      {
        user_id: 102,
        store_name: "Mang Jose General Merchandise",
        email: "jose.store@gmail.com",
        created_at: "2025-02-14T09:15:00.000Z",
        subscription_id: 2,
        plan: "premium",
        status: "Active",
        start_date: "2026-09-01",
        end_date: "2026-10-01",
        days_remaining: 11,
      },
      {
        user_id: 103,
        store_name: "Tindahan ni Ate Joy",
        email: "atejoy@yahoo.com",
        created_at: "2025-03-01T11:00:00.000Z",
        subscription_id: null,
        plan: null,
        status: "No subscription",
        start_date: null,
        end_date: null,
        days_remaining: null,
      },
    ],
    payments: [
      {
        payment_id: 1,
        user_id: 102,
        store_name: "Mang Jose General Merchandise",
        plan: "premium",
        amount: "299.00",
        payment_method: "GCash",
        reference_number: "GC-20260901-001",
        payment_date: "2026-09-01",
        duration: 1,
        verifier: "admin@listahub.ph",
        notes: "First month Premium subscription",
      },
      {
        payment_id: 2,
        user_id: 102,
        store_name: "Mang Jose General Merchandise",
        plan: "premium",
        amount: "3229.20",
        payment_method: "GCash",
        reference_number: "GC-20260915-002",
        payment_date: "2026-09-15",
        duration: 12,
        verifier: "admin@listahub.ph",
        notes: "Annual Premium subscription (10% discount)",
      },
    ],
  };
}

function load(): DemoStoreState {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const fresh = getDefaultState();
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function save(state: DemoStoreState) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

export function getAdminDemoData(): AdminData {
  const state = load();
  return {
    customers: state.customers,
    payments: state.payments,
    plans: state.plans,
    today: new Date().toISOString().slice(0, 10),
  };
}

export function getAdminProfileDemo(): AdminProfileData {
  return load().profile;
}

export function getManagedCustomersDemo(): ManagedCustomer[] {
  return load().managedCustomers;
}

export function recordAdminDemoPayment(body: Record<string, unknown>) {
  const state = load();
  const payment: Payment = {
    payment_id: state.payments.length + 1,
    user_id: Number(body.user_id),
    store_name: state.customers.find(c => c.user_id === Number(body.user_id))?.store_name || 'Unknown',
    plan: 'premium',
    amount: String(body.amount),
    payment_method: String(body.payment_method),
    reference_number: String(body.reference_number),
    payment_date: String(body.payment_date),
    duration: Number(body.duration),
    verifier: state.profile.email,
    notes: String(body.notes ?? ''),
  };
  state.payments.push(payment);

  // Update customer subscription
  const idx = state.customers.findIndex(c => c.user_id === Number(body.user_id));
  if (idx >= 0) {
    state.customers[idx] = {
      ...state.customers[idx],
      plan: 'premium',
      status: 'Active',
      start_date: String(body.payment_date),
      end_date: (() => {
        const d = new Date(String(body.payment_date) + 'T00:00:00Z');
        d.setUTCMonth(d.getUTCMonth() + Number(body.duration));
        return d.toISOString().slice(0, 10);
      })(),
      days_remaining: Number(body.duration) * 30,
    };
  }

  save(state);
  return {
    data: {
      end_date: state.customers[idx >= 0 ? idx : 0]?.end_date || '',
    },
  };
}

export function updateManagedCustomerDemo(id: number, updates: Partial<ManagedCustomer>) {
  const state = load();
  state.managedCustomers = state.managedCustomers.map(c =>
    c.user_id === id ? { ...c, ...updates } : c
  );
  save(state);
}

export function addManagedCustomerDemo(customer: ManagedCustomer) {
  const state = load();
  state.managedCustomers.push(customer);
  state.customers.push({
    user_id: customer.user_id,
    store_name: customer.store_name,
    email: customer.email,
    created_at: customer.created_at,
    subscription_id: null,
    plan: null,
    status: 'No subscription',
    start_date: null,
    end_date: null,
    days_remaining: null,
  });
  save(state);
}

export function deleteManagedCustomerDemo(id: number) {
  const state = load();
  state.managedCustomers = state.managedCustomers.map(c =>
    c.user_id === id ? { ...c, deleted_at: new Date().toISOString() } : c
  );
  save(state);
}

export function resetAdminDemoData() {
  localStorage.removeItem(DEMO_STORAGE_KEY);
}

// Aliases for api.ts imports
export const getAdminDemoProfile = getAdminProfileDemo;
export const getAdminDemoManagedCustomers = getManagedCustomersDemo;
export const deleteAdminDemoCustomer = deleteManagedCustomerDemo;

export function updateAdminDemoProfile(body: { store_name?: string; email?: string }) {
  const state = load();
  if (body.store_name) state.profile.store_name = body.store_name;
  if (body.email) state.profile.email = body.email;
  save(state);
  return state.profile;
}

export function createAdminDemoCustomer(body: { store_name: string; email: string }) {
  const state = load();
  const newId = Math.max(...state.managedCustomers.map(c => c.user_id), 100) + 1;
  const customer: ManagedCustomer = {
    user_id: newId,
    store_name: body.store_name,
    email: body.email,
    created_at: new Date().toISOString(),
    deleted_at: null,
  };
  state.managedCustomers.push(customer);
  state.customers.push({
    user_id: newId,
    store_name: body.store_name,
    email: body.email,
    created_at: customer.created_at,
    subscription_id: null,
    plan: null,
    status: 'No subscription',
    start_date: null,
    end_date: null,
    days_remaining: null,
  });
  save(state);
  return customer;
}

export function updateAdminDemoCustomer(id: number, body: { store_name?: string; email?: string }) {
  const state = load();
  const idx = state.managedCustomers.findIndex(c => c.user_id === id);
  if (idx >= 0) {
    if (body.store_name) state.managedCustomers[idx].store_name = body.store_name;
    if (body.email) state.managedCustomers[idx].email = body.email;
    save(state);
    return state.managedCustomers[idx];
  }
  return null;
}

export function restoreAdminDemoCustomer(id: number) {
  const state = load();
  state.managedCustomers = state.managedCustomers.map(c =>
    c.user_id === id ? { ...c, deleted_at: null } : c
  );
  save(state);
}

export function resetAdminDemoCustomerPassword(_id: number, _password: string) {
  // No-op in demo mode
}

export function getPilotActivityDemo() {
  const state = load();
  const now = Date.now();
  const minsAgo = (m: number) => new Date(now - m * 60000).toISOString();

  const customers = state.managedCustomers
    .filter(c => !c.deleted_at)
    .map((c, i) => {
      const lastSeen = [minsAgo(2), minsAgo(45), minsAgo(60 * 26)][i] || null;
      const activityStatus = i === 0 ? 'Online now' : i === 1 ? 'Active recently' : 'Inactive';
      const sub = state.customers.find(sc => sc.user_id === c.user_id);
      return {
        user_id: c.user_id,
        store_name: c.store_name,
        email: c.email,
        created_at: c.created_at,
        last_seen: lastSeen,
        plan: sub?.plan || null,
        subscription_status: sub?.status || 'No subscription',
        end_date: sub?.end_date || null,
        activity_status: activityStatus,
      };
    });

  return {
    customers,
    recent_activity: [
      { log_id: 1, user_id: 101, store_name: 'Aling Nena Sari-Sari Store', action: 'Logged in', detail: '', created_at: minsAgo(2) },
      { log_id: 2, user_id: 102, store_name: 'Mang Jose General Merchandise', action: 'Recorded payment', detail: '₱299 GCash', created_at: minsAgo(45) },
      { log_id: 3, user_id: 101, store_name: 'Aling Nena Sari-Sari Store', action: 'Added borrower', detail: 'Juan Dela Cruz', created_at: minsAgo(120) },
      { log_id: 4, user_id: 102, store_name: 'Mang Jose General Merchandise', action: 'Created loan', detail: '₱1,500', created_at: minsAgo(180) },
    ],
    stats: {
      online_now: 1,
      active_today: 2,
      active_this_week: 2,
      inactive: 1,
      total_customers: 3,
    },
  };
}
