import { http } from "./http";

const API_URL = "http://localhost:10000";

const ANON_KEY = "anonId";
const SESS_KEY = "sessionId";

function uuid() { return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2); }

export function getAnonId() {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) { id = uuid(); localStorage.setItem(ANON_KEY, id); }
  return id;
}
export function getSessionId() {
  let id = sessionStorage.getItem(SESS_KEY);
  if (!id) { id = uuid(); sessionStorage.setItem(SESS_KEY, id); }
  return id;
}

export function trackPageView(path: string, referrer?: string) {
  const payload = {
    type: "page_view",
    anonId: getAnonId(),
    sessionId: getSessionId(),
    path,
    referrer: referrer || document.referrer || undefined,
  };

  const url = `${API_URL}/api/track`;

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);  // ✅ absolute URL
      return;
    }
  } catch {}

  http.post("/api/track", payload).catch(() => {}); // ✅ will use axios baseURL (5001)
}
