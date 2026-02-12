import axios from "axios";
import { useUserStore } from "@/stores/useUserStore";

// ---------------------------------------------------------------------------
// Axios instance — single source of truth for all client-side HTTP calls.
// ---------------------------------------------------------------------------

const baseURL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_APP_URL ?? "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ---- Request interceptor ----------------------------------------------------
// Stamps each request so the response interceptor can log duration.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any).__startTime = Date.now();
  }
  return config;
});

// ---- Response interceptor ---------------------------------------------------
/** Sync endpoint — don't redirect on 401 so client can retry. */
const isSyncUrl = (url?: string) => url?.includes("/api/users/sync") ?? false;

api.interceptors.response.use(
  (res) => {
    // Dev-only: log slow requests (>1 s)
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const start = (res.config as any).__startTime as number | undefined;
      if (start) {
        const ms = Date.now() - start;
        if (ms > 1000) {
           
          console.warn(`[api] slow ${res.config.method?.toUpperCase()} ${res.config.url} (${ms}ms)`);
        }
      }
    }
    return res;
  },
  (err) => {
    if (typeof window === "undefined") return Promise.reject(err);
    const status = err.response?.status;
    const url = err.config?.url;
    if (status === 401) {
      useUserStore.getState().clearUser();
      if (!isSyncUrl(url)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
