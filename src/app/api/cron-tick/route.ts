import { NextResponse } from "next/server";
import { runCronTick } from "@/workers/cron";

export async function GET() {
  await runCronTick();
  return NextResponse.json({ ok: true });
}
