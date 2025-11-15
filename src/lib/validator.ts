// src/lib/validator.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Require a verified session.
 * Throws if no session or email not verified.
 */
export async function requireVerifiedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.emailVerified) {
    throw new Error("Email not verified");
  }
  return session;
}
