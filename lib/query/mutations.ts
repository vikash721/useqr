import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qrsApi, type QRCreateBody, type QRUpdateBody, type QRListItem } from "@/lib/api";
import { qrKeys } from "./keys";

// ---------------------------------------------------------------------------
// Default list params used across the app – keep in sync with pages.
// ---------------------------------------------------------------------------
const DEFAULT_LIST_PARAMS = { limit: 50, skip: 0 } as const;

// ---------------------------------------------------------------------------
// Create QR
// ---------------------------------------------------------------------------
export function useCreateQR() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: QRCreateBody) => qrsApi.create(body),
        onSuccess: (_data) => {
            // Invalidate all list queries so dashboard / my-qrs / analytics pick up the new QR.
            queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
        },
    });
}

// ---------------------------------------------------------------------------
// Update QR (full edit from create/edit page)
// ---------------------------------------------------------------------------
export function useUpdateQR() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: QRUpdateBody }) =>
            qrsApi.update(id, body),
        onSuccess: (updatedQr, { id }) => {
            // Seed the detail cache with the fresh response.
            queryClient.setQueryData(qrKeys.detail(id), updatedQr);
            // Invalidate lists so other pages reflect the change.
            queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
        },
    });
}

// ---------------------------------------------------------------------------
// Delete QR
// ---------------------------------------------------------------------------
export function useDeleteQR() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => qrsApi.delete(id),
        onSuccess: (_data, id) => {
            // Remove the detail from cache immediately.
            queryClient.removeQueries({ queryKey: qrKeys.detail(id) });
            // Invalidate lists so it disappears from list pages.
            queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
        },
    });
}

// ---------------------------------------------------------------------------
// Update QR status (optimistic)
// ---------------------------------------------------------------------------
export function useUpdateQRStatus(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newStatus: string) =>
            qrsApi.update(id, { status: newStatus }),

        onMutate: async (newStatus) => {
            // Cancel in-flight fetches so they don't overwrite our optimistic update.
            await queryClient.cancelQueries({ queryKey: qrKeys.detail(id) });

            // Snapshot previous value for rollback.
            const previous = queryClient.getQueryData<QRListItem>(qrKeys.detail(id));

            // Optimistically update the cache.
            if (previous) {
                queryClient.setQueryData<QRListItem>(qrKeys.detail(id), {
                    ...previous,
                    status: newStatus,
                });
            }

            return { previous };
        },

        onError: (_err, _newStatus, context) => {
            // Rollback to the previous value on error.
            if (context?.previous) {
                queryClient.setQueryData(qrKeys.detail(id), context.previous);
            }
        },

        onSuccess: (updatedQr) => {
            // Seed detail cache with the server response (PATCH already returns it).
            queryClient.setQueryData(qrKeys.detail(id), updatedQr);
        },

        onSettled: () => {
            // Only invalidate lists — detail is already fresh from onSuccess/setQueryData.
            queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
        },
    });
}

// ---------------------------------------------------------------------------
// Toggle lost-and-found mode (optimistic)
// ---------------------------------------------------------------------------
export function useToggleLostMode(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (enabled: boolean) => {
            const current = queryClient.getQueryData<QRListItem>(qrKeys.detail(id));
            const meta = (current?.metadata ?? {}) as Record<string, unknown>;
            const item =
                typeof meta.vcardLostItem === "string" ? meta.vcardLostItem : "";
            return qrsApi.update(id, {
                metadata: {
                    ...meta,
                    vcardLostMode: enabled,
                    vcardLostItem: item,
                } as QRUpdateBody["metadata"],
            });
        },

        onMutate: async (enabled) => {
            await queryClient.cancelQueries({ queryKey: qrKeys.detail(id) });

            const previous = queryClient.getQueryData<QRListItem>(qrKeys.detail(id));

            if (previous) {
                queryClient.setQueryData<QRListItem>(qrKeys.detail(id), {
                    ...previous,
                    metadata: {
                        ...previous.metadata,
                        vcardLostMode: enabled,
                    },
                });
            }

            return { previous };
        },

        onError: (_err, _enabled, context) => {
            if (context?.previous) {
                queryClient.setQueryData(qrKeys.detail(id), context.previous);
            }
        },

        onSuccess: (updatedQr) => {
            queryClient.setQueryData(qrKeys.detail(id), updatedQr);
        },

        onSettled: () => {
            // Only invalidate lists — detail is already fresh from onSuccess/setQueryData.
            queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
        },
    });
}

// ---------------------------------------------------------------------------
// Enable analytics
// ---------------------------------------------------------------------------
export function useEnableAnalytics(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => qrsApi.update(id, { analyticsEnabled: true }),
        onSuccess: (updatedQr) => {
            // Seed the detail cache — PATCH already returns the updated QR.
            queryClient.setQueryData(qrKeys.detail(id), updatedQr);
            // Invalidate lists so dashboard/my-qrs reflect the change.
            queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
        },
    });
}
