// -------------------------------------------------------------
// IN-MEMORY & LOCALSTORAGE DEMO STORE DATABASE ADAPTER
// -------------------------------------------------------------
export function handleDemoRequest(url, options = {}) {
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

  // Free/local mode: start with a completely clean store
  const isFreeLocal = localStorage.getItem("is_free_local") === "true";

  // Initialize store if missing, outdated, or in free/local mode with no store yet
  if (!demoStore || (!isFreeLocal && (!demoStore.products?.[0]?.product_price || !demoStore.borrowers?.[0]?.contact_number))) {
    demoStore = {
      profile: {
        id: currentUser.id || 1,
        email: currentUser.email || "owner@listahub.ph",
        store_name: currentUser.store_name || "ListaHub",
        first_name: currentUser.name || "Store Owner",
        last_name: "",
        phone_number: "",
      },
      borrowers: isFreeLocal ? [] : [
        { borrower_id: 1, first_name: "Juan", middle_name: "", last_name: "Cruz", contact_number: "0917-123-4567", dob: "1992-05-15", total_utang: 350, balance: 350, status: "WITH_BALANCE", public_access_enabled: true, created_at: "2026-08-01T10:00:00Z" },
        { borrower_id: 2, first_name: "Maria", middle_name: "", last_name: "Santos", contact_number: "0918-987-6543", dob: "1995-11-20", total_utang: 0, balance: 0, status: "FULLY_PAID", public_access_enabled: true, created_at: "2026-08-05T14:30:00Z" },
        { borrower_id: 3, first_name: "Pedro", middle_name: "", last_name: "Reyes", contact_number: "0920-555-1234", dob: "1988-03-08", total_utang: 850, balance: 850, status: "WITH_BALANCE", public_access_enabled: false, created_at: "2026-08-10T09:15:00Z" },
        { borrower_id: 4, first_name: "Ana", middle_name: "", last_name: "Lim", contact_number: "0919-444-8888", dob: "1998-07-25", total_utang: 120, balance: 120, status: "WITH_BALANCE", public_access_enabled: true, created_at: "2026-08-15T11:45:00Z" },
      ],
      products: isFreeLocal ? [] : [
        { product_id: 1, product_name: "Nescafé Original 3in1", product_price: 14.00, stock: 48, category: "Beverages" },
        { product_id: 2, product_name: "Lucky Me! Pancit Canton Chilimansi", product_price: 18.00, stock: 35, category: "Noodles" },
        { product_id: 3, product_name: "Bear Brand Fortified Milk 33g", product_price: 17.00, stock: 60, category: "Dairy" },
        { product_id: 4, product_name: "Coca-Cola 1.5L", product_price: 75.00, stock: 12, category: "Beverages" },
        { product_id: 5, product_name: "Silver Swan Soy Sauce 200ml", product_price: 22.00, stock: 20, category: "Condiments" },
      ],
      transactions: isFreeLocal ? [] : [
        { transaction_id: 101, borrower_id: 1, type: "LOAN", total_amount: 350, transaction_date: new Date().toISOString(), payment_method: null, payment_note: "General grocery items", items: [{ product_name: "Nescafé Original 3in1", quantity: 5, price: 14 }] },
        { transaction_id: 102, borrower_id: 2, type: "PAYMENT", total_amount: 500, transaction_date: new Date().toISOString(), payment_method: "CASH", payment_note: "Full settlement", items: [] },
        { transaction_id: 103, borrower_id: 3, type: "LOAN", total_amount: 850, transaction_date: new Date().toISOString(), payment_method: null, payment_note: "Sari-sari supplies", items: [] },
        { transaction_id: 104, borrower_id: 4, type: "LOAN", total_amount: 120, transaction_date: new Date().toISOString(), payment_method: null, payment_note: "Pancit Canton & Coffee", items: [] },
      ],
      expenses: [],
    };
    localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
  }

  if (method === "GET") {
    if (url.includes("/users/profile") || url.includes("/auth/me")) {
      return { ok: true, data: demoStore.profile };
    }
    if (url.includes("/dashboard/calendar")) {
      const todayStr = new Date().toISOString().split("T")[0];
      const reminders = (demoStore.borrowers || [])
        .filter((b) => (Number(b.balance) || 0) > 0)
        .map((b, i) => ({
          reminder_id: i + 1,
          borrower_id: b.borrower_id,
          borrower_name: `${b.first_name} ${b.last_name}`.trim(),
          amount_expected: Number(b.balance) || 0,
          status: "PENDING",
          note: "",
        }));
      return {
        ok: true,
        data: reminders.length > 0 ? [{ due_date: todayStr, reminders }] : [],
      };
    }
    if (url.includes("/dashboard/collection-stats") || url.includes("/dashboard/stats")) {
      const txs = (demoStore.transactions || []).filter((t) => !t.voided);
      const totalCollected = txs.filter((t) => t.type === "PAYMENT").reduce((s, t) => s + (Number(t.total_amount) || 0), 0);
      const borrowersWithBalance = (demoStore.borrowers || []).filter((b) => (Number(b.balance) || 0) > 0).length;
      return {
        ok: true,
        data: {
          total_collected: totalCollected,
          total_expected: 0,
          on_time_rate: 0,
          done_count: txs.length,
          pending_count: borrowersWithBalance,
          overdue_count: 0,
          total_reminders: borrowersWithBalance
        }
      };
    }
    if (url.includes("/dashboard/collection-trend") || url.includes("/dashboard/trend")) {
      return { ok: true, data: [] };
    }
    if (url.includes("/dashboard/income-summary") || url.includes("/dashboard/income")) {
      const txs = demoStore.transactions || [];
      const totalCollected = txs.filter((t) => t.type === "PAYMENT" && !t.voided).reduce((s, t) => s + (Number(t.total_amount) || 0), 0);
      const exps = demoStore.expenses || [];
      const totalExpenses = exps.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const byCategory = {};
      exps.forEach((e) => {
        const cat = e.category || "OTHER";
        byCategory[cat] = (byCategory[cat] || 0) + (Number(e.amount) || 0);
      });
      return {
        ok: true,
        data: {
          income: { total: totalCollected, by_method: [] },
          expenses: { total: totalExpenses, by_category: Object.entries(byCategory).map(([category, total]) => ({ category, total })) },
          profit: totalCollected - totalExpenses,
          period: "month"
        }
      };
    }
    if (url.includes("/dashboard/expenses") || url.includes("/expenses")) {
      return { ok: true, data: demoStore.expenses || [] };
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
      const activeTxs = txs.filter(t => !t.voided);
      const totalLent = activeTxs.filter(t => t.type === "LOAN").reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const totalCollected = activeTxs.filter(t => t.type === "PAYMENT").reduce((s, t) => s + (Number(t.amount) || 0), 0);
      return {
        ok: true,
        data: {
          summary: {
            total_lent: totalLent ?? 0,
            total_collected: totalCollected ?? 0,
            net: (totalCollected ?? 0) - (totalLent ?? 0),
            transaction_count: txs.length ?? 0,
            collected_today: totalCollected ?? 0,
            expected_today: 0,
            loans_today: totalLent ?? 0
          },
          transactions: txs
        }
      };
    }
    if (url.includes("/dashboard/reminders")) {
      const todays = (demoStore.borrowers || [])
        .filter((b) => (Number(b.balance) || 0) > 0)
        .map((b, i) => ({
          reminder_id: i + 1,
          borrower_id: b.borrower_id,
          first_name: b.first_name,
          last_name: b.last_name,
          due_date: new Date().toISOString(),
          amount_expected: Number(b.balance) || 0,
          note: "",
        }));
      return {
        ok: true,
        data: { todays_collections: todays, overdue: [], upcoming: [] },
      };
    }
    if (url.match(/\/dashboard\/?(\?.*)?$/)) {
      const borrowers = Array.isArray(demoStore?.borrowers) ? demoStore.borrowers : [];
      const totalUtang = borrowers.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
      const withBalance = borrowers.filter((b) => (Number(b.balance) || 0) > 0).length;
      const fullyPaid = borrowers.filter((b) => (Number(b.balance) || 0) === 0).length;
      const topBorrowers = [...borrowers]
        .filter((b) => (Number(b.balance) || 0) > 0)
        .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0))
        .slice(0, 5)
        .map((b) => ({
          borrower_id: b.borrower_id,
          name: `${b.first_name || ""} ${b.last_name || ""}`.trim() || "Borrower",
          balance: Number(b.balance) || 0,
        }));

      return {
        ok: true,
        data: {
          total_utang: totalUtang,
          active_borrowers: withBalance,
          total_borrowers: borrowers.length,
          fully_paid: fullyPaid,
          with_balance: withBalance,
          new_borrowers_today: 0,
          new_borrowers_this_month: borrowers.length,
          paid_today: 0,
          uncollected_amount: totalUtang,
          monthly_utang_trend: [
            { month: "Apr", total: 0 },
            { month: "May", total: 0 },
            { month: "Jun", total: 0 },
            { month: "Jul", total: 0 },
            { month: "Aug", total: totalUtang },
          ],
          monthly_summary: [
            { month: "Jan", amount: 0 },
            { month: "Feb", amount: 0 },
            { month: "Mar", amount: 0 },
            { month: "Apr", amount: 0 },
            { month: "May", amount: totalUtang },
          ],
          top_borrowers: topBorrowers,
        },
      };
    }
    if (url.includes("/borrowers/archived")) {
      return { ok: true, data: demoStore.borrowers.filter((b) => b.archived) };
    }
    if (url.includes("/borrowers") && !url.match(/\/borrowers\/\d+/)) {
      return { ok: true, data: demoStore.borrowers.filter((b) => !b.archived) };
    }
    if (url.match(/\/borrowers\/(\d+)\/transactions/)) {
      const bId = Number(url.match(/\/borrowers\/(\d+)\/transactions/)[1]);
      const txs = demoStore.transactions.filter((t) => t.borrower_id === bId);
      return { ok: true, data: txs };
    }
    if (url.match(/\/borrowers\/(\d+)\/notes/)) {
      return { ok: true, data: [] };
    }
    if (url.match(/\/borrowers\/(\d+)/)) {
      const bId = Number(url.match(/\/borrowers\/(\d+)/)[1]);
      const b = demoStore.borrowers.find((x) => x.borrower_id === bId) || demoStore.borrowers[0];
      return { ok: true, data: b };
    }
    if (url.includes("/products/archived")) {
      return { ok: true, data: demoStore.products.filter((p) => p.archived) };
    }
    if (url.includes("/products")) {
      return { ok: true, data: demoStore.products.filter((p) => !p.archived) };
    }
    if (url.includes("/subscriptions/plans")) {
      return {
        ok: true,
        data: [
          { id: "free", name: "FREE", monthlyPrice: 0, maxBorrowers: 999999, allowSms: false, allowCustomPdf: false, allowCsvExport: false, allowCloudSync: false, prioritySupport: false },
          { id: "premium", name: "PREMIUM", monthlyPrice: 299, maxBorrowers: 999999, allowSms: true, allowCustomPdf: true, allowCsvExport: true, allowCloudSync: true, prioritySupport: true }
        ]
      };
    }
    if (url.includes("/subscriptions/current")) {
      const savedPlan = localStorage.getItem("user_subscription_plan") || "free";
      const isPrem = savedPlan.toLowerCase() === "premium";
      return {
        ok: true,
        data: {
          plan: savedPlan.toUpperCase(),
          status: "active",
          is_free: !isPrem,
          limits: {
            id: savedPlan.toLowerCase(),
            name: savedPlan.toUpperCase(),
            monthlyPrice: isPrem ? 299 : 0,
            maxBorrowers: 999999,
            allowSms: isPrem,
            allowCustomPdf: isPrem,
            allowCsvExport: isPrem,
            allowCloudSync: isPrem,
            prioritySupport: isPrem
          }
        }
      };
    }
  }

  if (method === "POST") {
    const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
    if (url.includes("/borrowers")) {
      const smallIds = demoStore.borrowers.filter((b) => (b.borrower_id || 0) <= 2147483647);
      const maxId = smallIds.reduce((max, b) => Math.max(max, b.borrower_id || 0), 0);
      const newB = {
        borrower_id: maxId + 1,
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

      const maxTxId = demoStore.transactions.filter((t) => (t.transaction_id || 0) <= 2147483647).reduce((max, t) => Math.max(max, t.transaction_id || 0), 0);
      const newTx = {
        transaction_id: maxTxId + 1,
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

      const maxTxId = demoStore.transactions.filter((t) => (t.transaction_id || 0) <= 2147483647).reduce((max, t) => Math.max(max, t.transaction_id || 0), 0);
      const newTx = {
        transaction_id: maxTxId + 1,
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
      if (!demoStore.expenses) demoStore.expenses = [];
      const maxExpId = demoStore.expenses.filter((e) => (e.expense_id || 0) <= 2147483647).reduce((max, e) => Math.max(max, e.expense_id || 0), 0);
      const newExp = {
        expense_id: maxExpId + 1,
        amount: Number(payload.amount || 0),
        category: payload.category || "OTHER",
        description: payload.description || "",
        expense_date: payload.expense_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      demoStore.expenses.unshift(newExp);
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: newExp, message: "Expense added in Demo Mode" };
    }
    if (url.includes("/products")) {
      const maxProdId = demoStore.products.filter((p) => (p.product_id || 0) <= 2147483647).reduce((max, p) => Math.max(max, p.product_id || 0), 0);
      const newP = {
        product_id: maxProdId + 1,
        product_name: payload.product_name || "New Item",
        product_price: Number(payload.product_price || payload.price || 0),
        stock: 10,
        category: "General"
      };
      demoStore.products.unshift(newP);
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: newP, message: "Product added in Demo Mode" };
    }
    if (url.includes("/subscriptions/subscribe") || url.includes("/subscriptions/cancel")) {
      return { ok: false, message: "Premium is activated by the administrator. Call 0927 616 8478 to subscribe." };
    }
  }

  if (method === "PUT" || method === "PATCH") {
    if (url.includes("/void")) {
      const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
      const match = url.match(/\/borrowers\/(\d+)\/transactions\/(\d+)\/void/);
      if (match) {
        const txId = Number(match[2]);
        const tx = demoStore.transactions.find((t) => t.transaction_id === txId);
        if (tx && !tx.voided) {
          tx.voided = true;
          tx.voided_at = new Date().toISOString();
          tx.void_reason = payload.reason || "Voided by user";
          // Revert the borrower's balance
          const bId = tx.borrower_id;
          const targetB = demoStore.borrowers.find((b) => b.borrower_id === bId);
          if (targetB) {
            if (tx.type === "LOAN") {
              targetB.balance = Math.max(0, (targetB.balance || 0) - (Number(tx.total_amount) || 0));
              targetB.total_utang = Math.max(0, (targetB.total_utang || 0) - (Number(tx.total_amount) || 0));
            } else if (tx.type === "PAYMENT") {
              targetB.balance = (targetB.balance || 0) + (Number(tx.total_amount) || 0);
            }
            targetB.status = (targetB.balance || 0) > 0 ? "WITH_BALANCE" : "FULLY_PAID";
          }
          localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
          return { ok: true, data: tx, message: "Transaction voided" };
        }
        return { ok: false, message: "Transaction not found or already voided" };
      }
    }
    if (url.includes("/users/store-name")) {
      const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
      demoStore.profile.store_name = payload.store_name || demoStore.profile.store_name;
      localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
      return { ok: true, data: demoStore.profile, message: "Store name updated" };
    }
    if (url.includes("/borrowers")) {
      const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
      const match = url.match(/\/borrowers\/(\d+)/);
      if (match) {
        const bId = Number(match[1]);
        // Archive
        if (url.includes("/archive")) {
          const targetB = demoStore.borrowers.find((b) => b.borrower_id === bId);
          if (targetB) {
            targetB.archived = true;
            targetB.archived_at = new Date().toISOString();
            localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
            return { ok: true, data: targetB, message: "Borrower archived" };
          }
        }
        // Reactivate
        if (url.includes("/reactivate")) {
          const targetB = demoStore.borrowers.find((b) => b.borrower_id === bId);
          if (targetB) {
            targetB.archived = false;
            targetB.archived_at = null;
            localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
            return { ok: true, data: targetB, message: "Borrower reactivated" };
          }
        }
        // Update borrower details
        const targetB = demoStore.borrowers.find((b) => b.borrower_id === bId);
        if (targetB) {
          if (payload.first_name !== undefined) targetB.first_name = payload.first_name;
          if (payload.last_name !== undefined) targetB.last_name = payload.last_name;
          if (payload.middle_name !== undefined) targetB.middle_name = payload.middle_name;
          if (payload.contact_number !== undefined) targetB.contact_number = payload.contact_number;
          if (payload.dob !== undefined) targetB.dob = payload.dob;
          localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
          return { ok: true, data: targetB, message: "Borrower updated" };
        }
      }
    }
    if (url.includes("/products")) {
      const payload = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};
      const match = url.match(/\/products\/(\d+)/);
      if (match) {
        const pId = Number(match[1]);
        // Archive
        if (url.includes("/archive")) {
          const targetP = demoStore.products.find((p) => p.product_id === pId);
          if (targetP) {
            targetP.archived = true;
            targetP.archived_at = new Date().toISOString();
            localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
            return { ok: true, data: targetP, message: "Product archived" };
          }
        }
        // Reactivate
        if (url.includes("/reactivate")) {
          const targetP = demoStore.products.find((p) => p.product_id === pId);
          if (targetP) {
            targetP.archived = false;
            targetP.archived_at = null;
            localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
            return { ok: true, data: targetP, message: "Product reactivated" };
          }
        }
        // Update product details
        const targetP = demoStore.products.find((p) => p.product_id === pId);
        if (targetP) {
          if (payload.product_name !== undefined) targetP.product_name = payload.product_name;
          if (payload.product_price !== undefined) targetP.product_price = Number(payload.product_price);
          if (payload.price !== undefined) targetP.product_price = Number(payload.price);
          if (payload.stock !== undefined) targetP.stock = Number(payload.stock);
          if (payload.category !== undefined) targetP.category = payload.category;
          localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
          return { ok: true, data: targetP, message: "Product updated" };
        }
      }
    }
  }

  if (method === "DELETE") {
    if (url.includes("/borrowers")) {
      const match = url.match(/\/borrowers\/(\d+)/);
      if (match) {
        const bId = Number(match[1]);
        demoStore.borrowers = demoStore.borrowers.filter((b) => b.borrower_id !== bId);
        demoStore.transactions = demoStore.transactions.filter((t) => t.borrower_id !== bId);
        localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
        return { ok: true, message: "Borrower deleted" };
      }
    }
    if (url.includes("/products")) {
      const match = url.match(/\/products\/(\d+)/);
      if (match) {
        const pId = Number(match[1]);
        demoStore.products = demoStore.products.filter((p) => p.product_id !== pId);
        localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
        return { ok: true, message: "Product deleted" };
      }
    }
    if (url.includes("/expenses")) {
      const match = url.match(/\/expenses\/(\d+)/);
      if (match) {
        const eId = Number(match[1]);
        demoStore.expenses = (demoStore.expenses || []).filter((e) => e.expense_id !== eId);
        localStorage.setItem("demo_store_data", JSON.stringify(demoStore));
        return { ok: true, message: "Expense deleted" };
      }
    }
  }

  return { ok: true, data: [] };
}
