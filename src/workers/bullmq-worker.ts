import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { checkGraceAndEscalate, escalateCaregivers, onScheduleStart } from "@/lib/schedule";

const connection = new IORedis(process.env.REDIS_URL!);
const queue = new Queue("neuramed", { connection });

new Worker(
  "neuramed",
  async (job) => {
    const { type, payload } = job.data;
    if (type === "scheduleStart") await onScheduleStart(payload.userId, payload.medId, new Date(payload.scheduledAt));
    if (type === "graceCheck") await checkGraceAndEscalate(payload.userId, payload.medId, new Date(payload.scheduledAt));
    if (type === "caregiverEscalation") await escalateCaregivers(payload.userId, payload.medId, new Date(payload.scheduledAt));
  },
  { connection }
);
