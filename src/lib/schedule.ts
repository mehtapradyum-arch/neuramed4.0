
import { prisma } from "./prisma";
import { sendEmail } from "./notify";
import { sendPush } from "./webpush";

const defaultConfig = {
  graceWindowMinutes: 30,
  escalationWindowMinutes: 60,
};

export async function onScheduleStart(userId: string, medId: string, scheduledAt: Date) {
  await prisma.doseLog.create({ data: { userId, medId, scheduledAt, status: "PENDING" } });
  // Client-side will prompt local reminder via push subscription
}

export async function checkGraceAndEscalate(userId: string, medId: string, scheduledAt: Date) {
  const log = await prisma.doseLog.findFirst({ where: { userId, medId, scheduledAt } });
  if (!log || log.status !== "PENDING") return;

  // Escalate to patient
  await prisma.alert.create({ data: { userId, medId, type: "ESCALATION_PATIENT" } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) await sendEmail(user.email, "Reminder to take medication", "<p>Please take your dose.</p>");

  await prisma.doseLog.update({ where: { id: log.id }, data: { status: "ESCALATED_PATIENT" } });
}

export async function escalateCaregivers(userId: string, medId: string, scheduledAt: Date) {
  const log = await prisma.doseLog.findFirst({ where: { userId, medId, scheduledAt } });
  if (!log || (log.status !== "PENDING" && log.status !== "ESCALATED_PATIENT")) return;

  const caregivers = await prisma.relationship.findMany({ where: { patientId: userId }, include: { caregiver: true } });
  for (const rel of caregivers) {
    if (rel.caregiver.email) {
      await sendEmail(rel.caregiver.email, "Medication missed", "<pPatient may have missed a dose.</p>");
    }
  }
  await prisma.alert.create({ data: { userId, medId, type: "ESCALATION_CAREGIVER" } });
  await prisma.doseLog.update({ where: { id: log.id }, data: { status: "ESCALATED_CAREGIVER" } });
}
