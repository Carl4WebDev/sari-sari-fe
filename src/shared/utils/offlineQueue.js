const QUEUE_KEY = "ssc_offline_queue";
const MAX_RETRIES = 3;
const DELAY_BETWEEN = 3000; // 3 seconds between requests

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.user_id || user?.id || null;
  } catch {
    return null;
  }
}

function getAllQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// Only return items belonging to the current user
export function getQueue() {
  const userId = getCurrentUserId();
  if (!userId) return [];
  return getAllQueue().filter((item) => item.userId === userId);
}

export function enqueue(url, method, body, description, dependsOn, dependencyField) {
  const queue = getAllQueue();
  const userId = getCurrentUserId();
  const item = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    url,
    method,
    body,
    description,
    userId,
    timestamp: Date.now(),
  };

  // Dependency tracking: this item depends on another queued item
  if (dependsOn && dependencyField) {
    item.dependsOn = dependsOn;        // queue item ID
    item.dependencyField = dependencyField; // field name in body to update (e.g., "borrower_id")
  }

  queue.push(item);
  saveQueue(queue);
  return item;
}

export function dequeue(id) {
  const queue = getAllQueue().filter((item) => item.id !== id);
  saveQueue(queue);
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function getQueueSize() {
  return getQueue().length;
}

export async function replayQueue(sendFn) {
  const queue = getQueue();
  const results = [];
  const resolvedIds = {}; // queue item ID → real server ID

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];

    // Delay between requests to let slow servers process
    if (i > 0) await new Promise((r) => setTimeout(r, DELAY_BETWEEN));

    // Resolve dependencies: replace temp IDs with real IDs from previous replays
    if (item.dependsOn && item.dependencyField) {
      const realId = resolvedIds[item.dependsOn];
      if (realId !== undefined) {
        const body = typeof item.body === "string" ? JSON.parse(item.body) : { ...item.body };
        body[item.dependencyField] = realId;
        item.body = typeof item.body === "string" ? JSON.stringify(body) : body;
      }
    }

    // Skip items with IDs that overflow PostgreSQL integer (stale temp IDs from old builds)
    try {
      const body = typeof item.body === "string" ? JSON.parse(item.body) : item.body;
      if (body?.borrower_id && (body.borrower_id > 2147483647 || body.borrower_id < 0)) {
        dequeue(item.id);
        results.push({ item, success: false, error: "Skipped: invalid temp borrower ID" });
        continue;
      }
      // Also check product_id overflow in loan items
      if (body?.items && Array.isArray(body.items)) {
        const badProduct = body.items.find(
          (i) => i.product_id != null && (i.product_id > 2147483647 || i.product_id < 0)
        );
        if (badProduct) {
          dequeue(item.id);
          results.push({ item, success: false, error: "Skipped: invalid temp product ID" });
          continue;
        }
      }
    } catch {
      // body parse failed, let it proceed to server validation
    }

    let success = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await sendFn(item.url, item.method, item.body);

        if (res?.ok || res?.status === 409) {
          // Extract real ID from response for dependency resolution
          const realId = res?.data?.id || res?.data?.borrower_id || res?.data?.loan_id;
          if (realId !== undefined) {
            resolvedIds[item.id] = realId;
          }

          // Also resolve any dependency in the response body
          if (res?.data && item.dependencyField) {
            const resolvedValue = res.data[item.dependencyField];
            if (resolvedValue !== undefined) {
              resolvedIds[item.id] = resolvedValue;
            }
          }

          dequeue(item.id);
          results.push({ item, success: true, data: res?.data });
          success = true;
          break;
        }

        // 429 rate limit — wait longer and retry
        if (res?.status === 429) {
          await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
          continue;
        }

        // Other server errors — retry with backoff
        if (res?.status >= 500) {
          await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }

        // Client error (400, 401, 403, 404) — don't retry, skip this item
        dequeue(item.id);
        results.push({ item, success: false, error: res?.message });
        success = true; // Mark as handled so we don't break the loop
        break;
      } catch {
        // Network error — wait and retry
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      }
    }

    // If all retries failed, stop processing remaining items
    if (!success) {
      results.push({ item, success: false, error: "Max retries exceeded" });
      break;
    }
  }

  return results;
}
