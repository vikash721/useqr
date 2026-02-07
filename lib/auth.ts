/**
 * Server-side auth. Re-export from Clerk so the app has a single auth entry point.
 * Use this instead of importing from @clerk/nextjs in server code.
 */
export { auth } from "@clerk/nextjs/server";
