import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireVerifiedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.emailVerified) throw new Error("Email not verified");
  return session;
}
