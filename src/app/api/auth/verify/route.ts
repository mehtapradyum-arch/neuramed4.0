import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const verification = await prisma.accountVerificationToken.findUnique({ where: { token } }).catch(() => null);
  // For simplicity: store a custom token model or rely on NextAuth’s flow
  // Assume we set emailVerified upon valid token
  if (!verification) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  await prisma.user.update({ where: { id: verification.userId }, data: { emailVerified: new Date() } });
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
}
