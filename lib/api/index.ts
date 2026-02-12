/**
 * Centralized API service — barrel export.
 *
 * Import from `@/lib/api` for convenience, or from the domain file directly
 * (e.g. `@/lib/api/users`) when you only need one domain.
 *
 * All calls go through the shared axios instance (`@/lib/axios`) which
 * handles credentials, 401 redirects, and slow-request logging.
 */

export { usersApi } from "./users";
export type { UserSyncResponse, WaitlistUser } from "./users";

export { scanApi } from "./scan";
export type { ScanStatusPayload } from "./scan";

export { telegramApi } from "./telegram";

export { qrsApi } from "./qrs";
export type {
  QRListItem,
  QRListResponse,
  QRDetailResponse,
  QRCreateResponse,
  QRUpdateResponse,
  QRCreateBody,
  QRUpdateBody,
} from "./qrs";
