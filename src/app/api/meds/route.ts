import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedSession } from "@/lib/validator";
import { rateLimit } from "@/lib/rateLimit";

export async function GET() {
  const session = await requireVerifiedSession();
  const meds = await prisma.medication.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(meds);
}

export async function POST(req: Request) {
  const session = await requireVerifiedSession();
  await rateLimit(`${session.user.id}:meds`);
  const body = await req.json();
  const med = await prisma.medication.create({
    data: {
      userId: session.user.id,
      name: String(body.name),
      dosage: String(body.dosage),
      scheduleJson: body.schedule,
      pillCount: Number(body.pillCount || 0),
      refillThreshold: Number(body.refillThreshold || 2),
      critical: !!body.critical,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(med, { status: 201 });
}
