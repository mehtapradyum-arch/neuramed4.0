import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireVerifiedSession } from "@/lib/validator";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const session = await requireVerifiedSession();
  await rateLimit(`${session.user.id}:confirm`);
  const { doseLogId } = await req.json();
  const log = await prisma.doseLog.update({ where: { id: doseLogId }, data: { status: "TAKEN", takenAt: new Date() } });
  // decrement pill count
  await prisma.medication.update({ where: { id: log.medId }, data: { pillCount: { decrement: 1 } } });
  return NextResponse.json({ ok: true });
}
