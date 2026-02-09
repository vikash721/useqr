import { api } from "@/lib/axios";
import type { UserProfile } from "@/stores/useUserStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserSyncResponse = {
  ok: boolean;
  user: UserProfile;
};

export type WaitlistUser = {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const usersApi = {
  /** Sync the current Clerk session to the DB (post-login / signup). */
  sync: () =>
    api.post<UserSyncResponse>("/api/users/sync").then((res) => res.data),

  /** Fetch all waitlist users (authenticated). */
  getAll: () =>
    api
      .get<{ users: WaitlistUser[] }>("/api/users")
      .then((res) => res.data.users),
} as const;
