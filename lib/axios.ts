import axios from "axios";
import { useUserStore } from "@/stores/useUserStore";

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

/** Sync endpoint — don't redirect on 401 so client can retry. */
const isSyncUrl = (url?: string) => url?.includes("/api/users/sync") ?? false;

api.interceptors.response.use(
  (res) => res,
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
