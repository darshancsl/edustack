import { clear } from 'console';
import { http } from '../lib/http';

export type AuthUser = { id: string; name: string; email: string; role: string };
type State = { user: AuthUser | null; token: string | null; ready: boolean };

const KEY = 'access_token';

// Simple event system so components can subscribe if needed
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export const authStore = {
  state: { user: null, token: localStorage.getItem(KEY), ready: false } as State,

  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setUser(user: AuthUser | null) {
    this.state.user = user;
    notify();
  },

  setToken(token: string | null) {
    this.state.token = token;
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
    notify();
  },

  clear() {
    this.setUser(null);
    this.setToken(null);
  },

  // called once on app start (or after capturing token from URL)
  async hydrate() {
    try {
      if (!this.state.token) {
        this.state.ready = true;
        notify();
        return;
      }
      const { data } = await http.get<{ user: AuthUser }>('/api/users/me');
      this.state.user = data.user;
    } catch {
      // token invalid -> clear
      this.state.user = null;
      this.setToken(null);
    } finally {
      this.state.ready = true;
      notify();
    }
  },
};
