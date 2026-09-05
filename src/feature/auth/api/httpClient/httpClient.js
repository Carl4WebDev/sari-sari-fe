import { setCachedData, getCachedData } from "../../../../shared/utils/offlineCache";
import { enqueue } from "../../../../shared/utils/offlineQueue";

const API_BASE = import.meta.env.VITE_API_BASE;

// In-flight request deduplication — same GET URL shares one promise
const inflightRequests = new Map();

const getAuthToken = () => localStorage.getItem("user_token");
const isDemoMode = () => localStorage.getItem("is_demo_mode") === "true" || getAuthToken() === "demo_sandbox_token";

function buildDescription(method, url, body) {
  try {
    const data = typeof body === "string" ? JSON.parse(body) : body;
    if (url.includes("/borrowers") && method === "POST") {
      return `New borrower: ${data?.first_name || ""} ${data?.last_name || ""}`.trim();
    }
    if (url.includes("/loans") && method === "POST") {
      return `Loan ₱${data?.total_amount || data?.amount || ""}`;
    }
    if (url.includes("/payments") && method === "POST") {
      return `Payment ₱${data?.amount || ""}`;
    }
    if (url.includes("/products") && method === "POST") {
      return `New product: ${data?.product_name || ""}`;
    }
    return `${method} ${url}`;
  } catch {
    return `${method} ${url}`;
  }
}

// -------------------------------------------------------------
// OFFLINE & STORE DATA HANDLER
// -------------------------------------------------------------
function handleDemoRequest(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  let currentUser = {};
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser && rawUser !== "undefined") currentUser = JSON.parse(rawUser);
  } catch {
    currentUser = {};
  }

  let demoStore = null;
  try {
    const rawDemo = localStorage.getItem("demo_store_data");
    if (rawDemo && rawDemo !== "undefined") demoStore = JSON.parse(rawDemo);
  } catch {
    demoStore = null;
  }
  
  // Upgrade old demoStore structure if missing product_price or contact_number
  if (!demoStore || !demoStore.products?.[0]?.product_price || !demoStore.borrowers?.[0]?.contact_number) {
    demoStore = {
      profile: {
        id: currentUser.id || 1,
        email: currentUser.email || "owner@listahub.ph",
        store_name: currentUser.store_name || "Ang Akong Tindahan",
        first_name: currentUser.name || "Store Owner",
        last_name: "",
        phone_number: "09171234567",
      },
      borrowers: [
        { borrower_id: 1, first_name: "Juan", middle_name: "", last_name: "Cruz", contact_number: "0917-123-4567", dob: "1992-05-15", total_utang: 350, balance: 350, status: "WITH_BALANCE", public_access_enabled: true, created_at: "2026-08-01T10:00:00Z" },
        { borrower_id: 2, first_name: "Maria", middle_name: "", last_name: "Santos", contact_number: "0918-987-6543", dob: "1995-11-20", total_utang: 0, balance: 0, status: "FULLY_PAID", public_access_enabled: true, created_at: "2026-08-05T14:30:00Z" },
        { borrower_id: 3, first_name: "Pedro", middle_name: "", last_name: "Reyes", contact_number: "0920-555-1234", dob: "1988-03-08", total_utang: 850, balance: 850, status: "WITH_BALANCE", public_access_enabled: false, created_at: "2026-08-10T09:15:00Z" },
        { borrower_id: 4, first_name: "Ana", middle_name: "", last_name: "Lim", contact_number: "0919-444-8888", dob: "1998-07-25", total_utang: 120, balance: 120, status: "WITH_BALANCE", public_access_enabled: true, created_at: "2026-08-15T11:45:00Z" },
      ],
      products: [
        { product_id: 1, product_name: "Nescafé Original 3in1", product_price: 14.00, stock: 48, category: "Beverages" },
        { product_id: 2, product_name: "Lucky Me! Pancit Canton Chilimansi", product_price: 18.00, stock: 35, category: "Noodles" },
        { product_id: 3, product_name: "Bear Brand Fortified Milk 33g", product_price: 17.00, stock: 60, category: "Dairy" },
        { product_id: 4, product_name: "Coca-Cola 1.5L", product_price: 75.00, stock: 12, category: "Beverages" },
        { product_id: 5, product_name: "Silver Swan Soy Sauce 200ml", product_price: 22.00, stock: 20, category: "Condiments" },
      ],
      transactions: [
        { transaction_id: 101, borrower_id: 1, type: "LOAN", total_amount: 350, transaction_date: new Date().toISOString(), payment_method: null, payment_note: "General grocery items", items: [{ product_name: "Nescafé Original 3in1", quantity: 5, price: 14 }] },
        { transaction_id: 102, borrower_id: 2, type: "PAYMENT", total_amount: 500, transaction_date: new Date().toISOString(), payment_method: "CASH", payment_note: "Full settlement", items: [] },
        { transaction_id: 103, borrower_id: 3, type: "LOAN", total_amount: 850, transaction_date: new Date().toISOString(), payment_method: null, payment_note: "Sari-sari supplies", items: [] },
        { transaction_id: 104, borrower_id: 4, type: "LOAN", total_amount: 120, transaction_date: new Date().toISOString(), payment_method: null, payment_note: "Pancit Canton & Coffee", items: [] },
      ],
    };
    localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
  }

  if (method === "GET") {
    if (url.includes("/users/profile") || url.includes("/auth/me")) {
      return { ok: true, data: demoStore.profile };
    }
    if (url.includes("/dashboard/calendar")) {
      const todayStr = new Date().toISOString().split("T")[0];
      return {
        ok: true,
        data: [
          {
            due_date: todayStr,
            reminders: [
              { reminder_id: 1, borrower_id: 1, borrower_name: "Juan Cruz", amount_expected: 350, status: "PENDING", note: "Grocery loan due today" },
              { reminder_id: 2, borrower_id: 3, borrower_name: "Pedro Reyes", amount_expected: 850, status: "OVERDUE", note: "Supplies loan overdue" }
            ]
          }
        ]
      };
    }
    if (url.includes("/dashboard/collection-stats") || url.includes("/dashboard/stats")) {
      return {
        ok: true,
        data: {
          total_collected: 500,
          total_expected: 1500,
          on_time_rate: 85.5,
          done_count: 4,
          pending_count: 2,
          overdue_count: 1,
          total_reminders: 7
        }
      };
    }
    if (url.includes("/dashboard/collection-trend") || url.includes("/dashboard/trend")) {
      return {
        ok: true,
        data: [
          { date: "Aug 01", total: 250 },
          { date: "Aug 08", total: 400 },
          { date: "Aug 15", total: 350 },
          { date: "Aug 22", total: 600 },
          { date: "Aug 29", total: 500 }
        ]
      };
    }
    if (url.includes("/dashboard/income-summary") || url.includes("/dashboard/income")) {
      return {
        ok: true,
        data: {
          income: {
            total: 1850,
            by_method: [
              { method: "CASH", total: 1350 },
              { method: "GCASH", total: 500 }
            ]
          },
          expenses: {
            total: 320,
            by_category: [
              { category: "RESTOCK", total: 200 },
              { category: "SUPPLIES", total: 120 }
            ]
          },
          profit: 1530,
          period: "month"
        }
      };
    }
    if (url.includes("/dashboard/expenses")) {
      return {
        ok: true,
        data: [
          {
            expense_id: 1,
            amount: 200,
            category: "RESTOCK",
            description: "Pancit canton & coffee restock",
            expense_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            expense_id: 2,
            amount: 120,
            category: "SUPPLIES",
            description: "Plastic bags and notebook",
            expense_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ]
      };
    }
    if (url.includes("/dashboard/today")) {
      const rawTxs = demoStore.transactions || [];
      const txs = rawTxs.map((t) => {
        const b = (demoStore.borrowers || []).find((b) => b.borrower_id === t.borrower_id);
        const name = b ? `${b.first_name} ${b.last_name}`.trim() : "Borrower";
        return {
          ...t,
          amount: Number(t.total_amount || t.amount || 0),
          borrower_name: t.borrower_name || name,
          created_at: t.created_at || t.transaction_date || new Date().toISOString(),
          items: t.items || [],
        };
      });
      const totalLent = txs.filter(t => t.type === "LOAN").reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const totalCollected = txs.filter(t => t.type === "PAYMENT").reduce((s, t) => s + (Number(t.amount) || 0), 0);
      return {
        ok: true,
        data: {
          summary: {
            total_lent: totalLent || 1320,
            total_collected: totalCollected || 500,
            net: (totalCollected || 500) - (totalLent || 1320),
            transaction_count: txs.length || 4,
            collected_today: totalCollected || 500,
            expected_today: 850,
            loans_today: totalLent || 1320
          },
          transactions: txs
        }
      };
    }
    if (url.includes("/dashboard/reminders")) {
      return {
        ok: true,
        data: {
          todays_collections: [
            { reminder_id: 1, borrower_id: 1, first_name: "Juan", last_name: "Cruz", due_date: new Date().toISOString(), amount_expected: 350, note: "Grocery loan due today" }
          ],
          overdue: [],
          upcoming: []
        }
      };
    }
    if (url.includes("/dashboard")) {
      const totalUtang = demoStore.borrowers.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
      const activeBorrowers = demoStore.borrowers.filter((b) => b.balance > 0).length;
      return {
        ok: true,
        data: {
          total_utang: totalUtang,
          active_borrowers: activeBorrowers,
          total_borrowers: demoStore.borrowers.length,
          paid_today: 500,
          uncollected_amount: totalUtang,
          monthly_summary: [
            { month: "Jan", amount: 450 },
            { month: "Feb", amount: 680 },
            { month: "Mar", amount: 920 },
            { month: "Apr", amount: 1100 },
            { month: "May", amount: totalUtang },
          ],
        },
      };
    }
    if (url.includes("/borrowers/archived")) {
      return { ok: true, data: [] };
    }
    if (url.includes("/borrowers") && !url.match(/\/borrowers\/\d+/)) {
      return { ok: true, data: demoStore.borrowers };
    }
    if (url.match(/\/borrowers\/(\d+)\/transactions/)) {
      const bId = Number(url.match(/\/borrowers\/(\d+)\/transactions/)[1]);
      const txs = demoStore.transactions.filter((t) => t.borrower_id === bId);
      return { ok: true, data: txs };
    }
    if (url.match(/\/borrowers\/(\d+)\/notes/)) {
      return { ok: true, data: [{ note_id: 1, note_text: "Prefers reminder via SMS", created_at: new Date().toISOString() }] };
    }
    if (url.match(/\/borrowers\/(\d+)/)) {
      const bId = Number(url.match(/\/borrowers\/(\d+)/)[1]);
      const b = demoStore.borrowers.find((x) => x.borrower_id === bId) || demoStore.borrowers[0];
      return { ok: true, data: b };
    }
    if (url.includes("/products/archived")) {
      return { ok: true, data: [] };
    }
    if (url.includes("/products")) {
      return { ok: true, data: demoStore.products };
    }
  }

  if (method === "POST") {
    const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
    if (url.includes("/borrowers")) {
      const newB = {
        borrower_id: Date.now(),
        first_name: payload.first_name || "New",
        middle_name: payload.middle_name || "",
        last_name: payload.last_name || "Borrower",
        contact_number: payload.contact_number || "0917-000-0000",
        dob: payload.dob || "1995-01-01",
        total_utang: 0,
        balance: 0,
        status: "FULLY_PAID",
        public_access_enabled: true,
        created_at: new Date().toISOString(),
      };
      demoStore.borrowers.unshift(newB);
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: newB, message: "Borrower added in Demo Mode" };
    }
    if (url.includes("/loans")) {
      const bId = Number(payload.borrower_id || 1);
      const itemsList = payload.items || [];
      const totalAmt = itemsList.reduce((sum, i) => sum + (Number(i.quantity) || 1) * (Number(i.price) || 0), 0) || Number(payload.amount || 0);

      const targetB = demoStore.borrowers.find((b) => b.borrower_id === bId);
      if (targetB) {
        targetB.balance = (targetB.balance || 0) + totalAmt;
        targetB.total_utang = (targetB.total_utang || 0) + totalAmt;
        targetB.status = "WITH_BALANCE";
      }

      const newTx = {
        transaction_id: Date.now(),
        borrower_id: bId,
        type: "LOAN",
        total_amount: totalAmt,
        transaction_date: new Date().toISOString(),
        payment_method: null,
        payment_note: "New loan recorded",
        items: itemsList
      };

      demoStore.transactions.unshift(newTx);
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: newTx, message: "Loan added in Demo Mode" };
    }
    if (url.includes("/payments")) {
      const bId = Number(payload.borrower_id || 1);
      const amt = Number(payload.amount || 0);
      const targetB = demoStore.borrowers.find((b) => b.borrower_id === bId);
      if (targetB) {
        targetB.balance = Math.max(0, (targetB.balance || 0) - amt);
        if (targetB.balance === 0) targetB.status = "FULLY_PAID";
      }

      const newTx = {
        transaction_id: Date.now(),
        borrower_id: bId,
        type: "PAYMENT",
        total_amount: amt,
        transaction_date: new Date().toISOString(),
        payment_method: payload.payment_type || "CASH",
        payment_note: payload.note || "Quick payment",
        items: []
      };

      demoStore.transactions.unshift(newTx);
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: newTx, message: "Payment added in Demo Mode" };
    }
    if (url.includes("/expenses")) {
      const newExp = {
        expense_id: Date.now(),
        amount: Number(payload.amount || 0),
        category: payload.category || "OTHER",
        description: payload.description || "",
        expense_date: payload.expense_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: newExp, message: "Expense added in Demo Mode" };
    }
    if (url.includes("/products")) {
      const newP = {
        product_id: Date.now(),
        product_name: payload.product_name || "New Item",
        product_price: Number(payload.product_price || payload.price || 0),
        stock: 10,
        category: "General"
      };
      demoStore.products.unshift(newP);
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: newP, message: "Product added in Demo Mode" };
    }
  }

  if (method === "PUT" || method === "PATCH") {
    if (url.includes("/users/store-name")) {
      const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
      demoStore.profile.store_name = payload.store_name || demoStore.profile.store_name;
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: demoStore.profile, message: "Store name updated" };
    }
    if (url.includes("/products")) {
      const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
      const match = url.match(/\/products\/(\d+)/);
      if (match) {
        const pId = Number(match[1]);
        const targetP = demoStore.products.find((p) => p.product_id === pId);
        if (targetP) {
          targetP.product_name = payload.product_name || targetP.product_name;
          targetP.product_price = Number(payload.product_price || payload.price || targetP.product_price);
        }
        localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
        return { ok: true, data: targetP, message: "Product updated" };
      }
    }
  }

  return { ok: true, data: [] };
}

export async function customFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  // If in Demo Mode, handle through demo mock handler
  if (isDemoMode()) {
    return handleDemoRequest(url, options);
  }

  const token = getAuthToken();
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const isPlainObject = options.body && typeof options.body === "object" && !isFormData;
  const fetchOptions = {
    ...options,
    headers,
    body: isPlainObject ? JSON.stringify(options.body) : options.body,
  };

  const cacheKey = `${method}:${url}`;

  if (!navigator.onLine && method === "GET") {
    const cached = getCachedData(cacheKey);
    if (cached) return { ok: true, data: cached, _fromCache: true };
    return { ok: false, message: "Offline — no cached data available." };
  }

  if (!navigator.onLine && method !== "GET") {
    const item = enqueue({
      url,
      method,
      body: options.body,
      description: buildDescription(method, url, options.body),
    });

    return {
      ok: true,
      data: null,
      message: "Queued for sync when online.",
      _queued: true,
      queuedItem: item,
    };
  }

  if (method === "GET" && inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}${url}`, fetchOptions);

      const isAuthEndpoint = url.includes("/login") || url.includes("/register") || url.includes("/api/users/login") || url.includes("/api/users/register");

      if (response.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem("user_token");
        window.location.href = "/login";
        return { ok: false, message: "Unauthorized. Please log in again." };
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = json?.message || json?.error || `Request failed with status ${response.status}`;
        if (json?.details && typeof json.details === "object") {
          const detailValues = Object.values(json.details).filter(Boolean);
          if (detailValues.length > 0) {
            errorMsg = detailValues.join(". ");
          }
        }
        return {
          ok: false,
          status: response.status,
          message: errorMsg,
          details: json?.details,
        };
      }

      if (method === "GET" && json?.data) {
        setCachedData(cacheKey, json.data);
      }

      return { ok: true, data: json?.data ?? json, message: json?.message };
    } catch (err) {
      if (method === "GET") {
        const cached = getCachedData(cacheKey);
        if (cached) return { ok: true, data: cached, _fromCache: true };
      }

      // If network error occurred during an explicit auth action, surface clear network error
      if (url.includes("/users/login") || url.includes("/users/register")) {
        return {
          ok: false,
          message: "Unable to connect to server. Please check your internet connection or backend server.",
        };
      }

      // Fallback to mock store data if backend server is unreachable
      return handleDemoRequest(url, options);
    } finally {
      if (method === "GET") {
        inflightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    inflightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

export const apiRequest = customFetch;

export const httpClient = {
  get: (url, options) => customFetch(url, { ...options, method: "GET" }),
  post: (url, body, options) => customFetch(url, { ...options, method: "POST", body }),
  put: (url, body, options) => customFetch(url, { ...options, method: "PUT", body }),
  patch: (url, body, options) => customFetch(url, { ...options, method: "PATCH", body }),
  delete: (url, options) => customFetch(url, { ...options, method: "DELETE" }),
};

export default httpClient;

