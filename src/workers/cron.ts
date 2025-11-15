
import { checkGraceAndEscalate, escalateCaregivers } from "@/lib/schedule";
import { prisma } from "@/lib/prisma";
import { addMinutes, isWithinInterval } from "date-fns";

export async function runCronTick() {
  const meds = await prisma.medication.findMany({ include: { user: true } });
  for (const med of meds) {
    const schedule = med.scheduleJson as any;
    const now = new Date();
    for (const window of schedule.windows || []) {
      const start = new Date(`${now.toDateString()} ${window.start}`);
      const end = new Date(`${now.toDateString()} ${window.end}`);
      if (isWithinInterval(now, { start, end })) {
        await onScheduleStart(med.userId, med.id, start);
      }
      const graceTime = addMinutes(start, 30);
      const escalationTime = addMinutes(start, 60);
      if (Math.abs(now.getTime() - graceTime.getTime()) < 60_000) {
        await checkGraceAndEscalate(med.userId, med.id, start);
      }
      if (Math.abs(now.getTime() - escalationTime.getTime()) < 60_000) {
        await escalateCaregivers(med.userId, med.id, start);
      }
    }
  }
}
