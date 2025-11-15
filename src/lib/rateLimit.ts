// src/lib/rateLimit.ts
import { createClient } from "redis";

const WINDOW = 60; // seconds
const MAX = 20;

let memory = new Map<string, { count: number; ts: number }>();
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (process.env.REDIS_URL && !redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", () => (redisClient = null));
    await redisClient.connect().catch(() => (redisClient = null));
  }
  return redisClient;
}

/**
 * Rate limit helper.
 * Throws an error if the limit is exceeded.
 */
export async function rateLimit(key: string) {
  const redis = await getRedis();
  const now = Math.floor(Date.now() / 1000);

  if (redis) {
    const k = `rl:${key}:${Math.floor(now / WINDOW)}`;
    const count = (await redis.incr(k)) || 0;
    if (count === 1) await redis.expire(k, WINDOW);
    if (count > MAX) throw new Error("Rate limit exceeded");
    return;
  }

  const bucket = memory.get(key);
  if (!bucket || now - bucket.ts >= WINDOW) {
    memory.set(key, { count: 1, ts: now });
  } else if (bucket.count + 1 > MAX) {
    throw new Error("Rate limit exceeded");
  } else {
    memory.set(key, { count: bucket.count + 1, ts: bucket.ts });
  }
}
