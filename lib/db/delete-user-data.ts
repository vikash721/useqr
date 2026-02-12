import { deleteScanEventsByQrId } from "@/lib/db/analytics";
import { deleteAllQRsByClerkId, listQRsByClerk } from "@/lib/db/qrs";
import { deleteUserByClerkId } from "@/lib/db/users";

export type DeleteUserDataResult = {
  userDeleted: boolean;
  qrsDeleted: number;
  scanEventsDeleted: number;
};

/**
 * Deletes all data associated with a user (Clerk id).
 * Call this when a user is deleted from Clerk (webhook or manual delete).
 *
 * Order: scan_events (per QR) → qrs → users.
 */
export async function deleteAllUserDataByClerkId(
  clerkId: string
): Promise<DeleteUserDataResult> {
  const qrs = await listQRsByClerk(clerkId, { limit: 10_000 });
  let scanEventsDeleted = 0;
  for (const qr of qrs) {
    const n = await deleteScanEventsByQrId(qr._id);
    scanEventsDeleted += n;
  }
  const qrsDeleted = await deleteAllQRsByClerkId(clerkId);
  const userDeleted = await deleteUserByClerkId(clerkId);
  return { userDeleted, qrsDeleted, scanEventsDeleted };
}
