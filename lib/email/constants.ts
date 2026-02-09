/**
 * Email sender identity. Must be a verified domain in Resend (e.g. useqr.codes).
 */
export const FROM_EMAIL = "welcome@useqr.codes" as const;

export const FROM_LABEL = "UseQR" as const;

/** Full from header: "UseQR <welcome@useqr.codes>" */
export const FROM_HEADER = `${FROM_LABEL} <${FROM_EMAIL}>` as const;
