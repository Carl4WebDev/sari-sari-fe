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

// Only return items belonging to the current user
export function getQueue() {
  const userId = getCurrentUserId();
  if (!userId) return [];
  return getAllQueue().filter((item) => item.userId === userId);
}

export function enqueue(url, method, body, description) {
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
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return item;
}

export function dequeue(id) {
  const queue = getAllQueue().filter((item) => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
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

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];

    // Delay between requests to let slow servers process
    if (i > 0) await new Promise((r) => setTimeout(r, DELAY_BETWEEN));

    let success = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await sendFn(item.url, item.method, item.body);

        if (res?.ok || res?.status === 409) {
          dequeue(item.id);
          results.push({ item, success: true });
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
