import { prisma } from "../src/lib/prisma";

async function run() {
  const maria = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: { email: "maria@example.com", name: "Maria Rodriguez", role: "PATIENT", emailVerified: new Date() }
  });
  const sofia = await prisma.user.upsert({
    where: { email: "sofia@example.com" },
    update: {},
    create: { email: "sofia@example.com", name: "Sofia Rodriguez", role: "CAREGIVER", emailVerified: new Date() }
  });
  await prisma.relationship.create({ data: { patientId: maria.id, caregiverId: sofia.id, permissions: "read,ack,notify" } });
  const meds = [
    { name: "Lisinopril", dosage: "10mg", pillCount: 28, refillThreshold: 2, critical: true, scheduleJson: { windows: [{ start: "08:00", end: "10:00" }], days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] } },
    { name: "Metformin", dosage: "500mg", pillCount: 30, refillThreshold: 2, critical: false, scheduleJson: { windows: [{ start: "20:00", end: "22:00" }], days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] } },
  ];
  for (const m of meds) {
    await prisma.medication.create({ data: { userId: maria.id, ...m } });
  }
  // Simulated missed dose
  await prisma.doseLog.create({
    data: {
      userId: maria.id,
      medId: (await prisma.medication.findFirst({ where: { userId: maria.id } }))!.id,
      scheduledAt: new Date(Date.now() - 1000 * 60 * 90),
      status: "ESCALATED_PATIENT",
      source: "seed",
    },
  });
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
