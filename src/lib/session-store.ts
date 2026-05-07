/*
 * Session store with Redis backend and in-memory fallback.
 * Purpose: provide fast session lookups, revocation blacklist, and rate-limit counters.
 * Usage: import the exported `ingreyhrSessionStore` and call `init()` at startup.
 */

import type { IngreyhrAuthSession } from "./ingreyhr-auth";

type AnyObject = Record<string, any>;

let IORedis: any | null = null;
try {
  // dynamic require to avoid hard dependency during dev if not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IORedis = require("ioredis");
} catch (e) {
  IORedis = null;
}

class SessionStore {
  private redis: any | null = null;
  private memorySessions = new Map<string, { value: string; expiresAt: number }>();
  private memoryCounters = new Map<string, { count: number; expiresAt: number }>();

  public async init(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || process.env.INGREYHR_REDIS_URL;
    if (redisUrl && IORedis) {
      this.redis = new IORedis(redisUrl);
      // optional: handle error events
      this.redis.on("error", (err: Error) => {
        // eslint-disable-next-line no-console
        console.error("SessionStore Redis error:", err);
      });
      return;
    }

    // no-op for in-memory fallback
  }

  private nowMs() {
    return Date.now();
  }

  async setSession(sessionId: string, session: IngreyhrAuthSession, ttlSeconds = 3600) {
    const key = `ingreyhr:session:${sessionId}`;
    const payload = JSON.stringify(session);
    if (this.redis) {
      await this.redis.set(key, payload, "EX", Math.max(1, ttlSeconds));
      return;
    }

    const expiresAt = this.nowMs() + ttlSeconds * 1000;
    this.memorySessions.set(key, { value: payload, expiresAt });
  }

  async getSession(sessionId: string): Promise<IngreyhrAuthSession | null> {
    const key = `ingreyhr:session:${sessionId}`;
    if (this.redis) {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as IngreyhrAuthSession) : null;
    }

    const entry = this.memorySessions.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= this.nowMs()) {
      this.memorySessions.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as IngreyhrAuthSession;
  }

  async revokeSession(sessionId: string, ttlSeconds = 3600) {
    const key = `ingreyhr:revoked:${sessionId}`;
    if (this.redis) {
      await this.redis.set(key, "1", "EX", Math.max(1, ttlSeconds));
      // optionally delete session key
      await this.redis.del(`ingreyhr:session:${sessionId}`);
      return;
    }

    const expiresAt = this.nowMs() + ttlSeconds * 1000;
    this.memorySessions.delete(`ingreyhr:session:${sessionId}`);
    this.memorySessions.set(key, { value: "1", expiresAt });
  }

  async isRevoked(sessionId: string): Promise<boolean> {
    const key = `ingreyhr:revoked:${sessionId}`;
    if (this.redis) {
      const raw = await this.redis.get(key);
      return !!raw;
    }

    const entry = this.memorySessions.get(key);
    if (!entry) return false;
    if (entry.expiresAt <= this.nowMs()) {
      this.memorySessions.delete(key);
      return false;
    }
    return true;
  }

  // Simple Redis-backed leaky-bucket / sliding window counter for rate-limiting
  async incrCounter(key: string, windowSeconds = 60): Promise<number> {
    const k = `ingreyhr:counter:${key}`;
    if (this.redis) {
      const count = await this.redis.incr(k);
      if (count === 1) {
        await this.redis.expire(k, windowSeconds);
      }
      return Number(count);
    }

    const now = this.nowMs();
    const existing = this.memoryCounters.get(k);
    if (!existing || existing.expiresAt <= now) {
      this.memoryCounters.set(k, { count: 1, expiresAt: now + windowSeconds * 1000 });
      return 1;
    }

    existing.count += 1;
    this.memoryCounters.set(k, existing);
    return existing.count;
  }

  async getCounter(key: string): Promise<number> {
    const k = `ingreyhr:counter:${key}`;
    if (this.redis) {
      const val = await this.redis.get(k);
      return val ? Number(val) : 0;
    }
    const existing = this.memoryCounters.get(k);
    if (!existing || existing.expiresAt <= this.nowMs()) return 0;
    return existing.count;
  }

  async clear(): Promise<void> {
    if (this.redis) {
      // WARNING: don't run in production without scope
      // implement scoped deletes in real deployments
      return;
    }
    this.memorySessions.clear();
    this.memoryCounters.clear();
  }
}

export const ingreyhrSessionStore = new SessionStore();

export default ingreyhrSessionStore;
