import { randomUUID } from "node:crypto";
import { LAB_STORE_LIMITS, type LabLogEntry, type LabRunRecord } from "../store";
import { getLabMemory } from "../memory";
import type { LabRepository, DedupClaim, LabFollowupWrite } from "./repository";
import type { LabAction } from "../types";
import {
  createLabContact,
  isLabContactExpired,
  mergeLabContactProgress,
  mergeLabContactUpsert,
  type LabContactRecord,
} from "./contact-logic";

function runs(): LabRunRecord[] {
  return getLabMemory().runs as LabRunRecord[];
}

function contacts(): LabContactRecord[] {
  return getLabMemory().contacts as LabContactRecord[];
}

function pruneContacts(now: number): void {
  const list = contacts();
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (isLabContactExpired(list[i], now)) list.splice(i, 1);
  }
}

function prune(now: number): void {
  const list = runs();
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (now > list[i].expiresAt) list.splice(i, 1);
  }
}

const dedupLocks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T> | T): Promise<T> {
  const previous = dedupLocks.get(key) ?? Promise.resolve();
  const current = previous.then(
    () => fn(),
    () => fn(),
  );
  dedupLocks.set(
    key,
    current.then(
      () => undefined,
      () => undefined,
    ),
  );
  return current;
}

export function createMemoryLabRepository(): LabRepository {
  return {
    kind: "memory",

    async claimDedup(emailHash, runId): Promise<DedupClaim> {
      return withLock(emailHash, () => {
        const now = Date.now();
        prune(now);
        const mem = getLabMemory() as ReturnType<typeof getLabMemory> & {
          dedup?: Map<string, { runId: string; expiresAt: number }>;
        };
        if (!mem.dedup) mem.dedup = new Map();

        const current = mem.dedup.get(emailHash);
        if (current && current.expiresAt > now) {
          const existing = runs().find((run) => run.runId === current.runId) ?? null;
          if (!existing) {
            mem.dedup.set(emailHash, {
              runId,
              expiresAt: now + LAB_STORE_LIMITS.dedupeWindowMs,
            });
            return { duplicate: false, existing: null };
          }
          return { duplicate: true, existing };
        }

        mem.dedup.set(emailHash, {
          runId,
          expiresAt: now + LAB_STORE_LIMITS.dedupeWindowMs,
        });
        return { duplicate: false, existing: null };
      });
    },

    async createRun(record) {
      prune(Date.now());
      runs().push(record);
    },

    async getRunById(runId) {
      prune(Date.now());
      const run = runs().find((item) => item.runId === runId) ?? null;
      if (run && run.expiresAt <= Date.now()) return null;
      return run;
    },

    async getRunByAccessTokenHash(tokenHash) {
      prune(Date.now());
      const run =
        runs().find((item) => item.accessTokenHash === tokenHash) ?? null;
      if (run && run.expiresAt <= Date.now()) return null;
      return run;
    },

    async updateRun(runId, patch) {
      const run = await this.getRunById(runId);
      if (!run) return null;
      const { usage, ...rest } = patch;
      Object.assign(run, rest);
      if (usage) Object.assign(run.usage, usage);
      return run;
    },

    async replaceActions(runId, actions: readonly LabAction[]) {
      const run = await this.getRunById(runId);
      if (!run) return;
      run.actions = [...actions];
    },

    async upsertFollowup(runId, followup: LabFollowupWrite) {
      await this.updateRun(runId, {
        followupEmailId: followup.providerId,
        followupScheduledAt: followup.scheduledAt,
        followupCanceled: followup.cancelled,
      });
    },

    async addEvent(entry: Omit<LabLogEntry, "at">) {
      const logs = getLabMemory().logs as LabLogEntry[];
      logs.push({ ...entry, at: Date.now() });
      if (logs.length > 200) logs.splice(0, logs.length - 200);
      console.info("[lab]", entry.event, entry.runId, entry.detail ?? "");
    },

    async hasExhaustedRealRunQuota(ipHash) {
      const now = Date.now();
      const hits = getLabMemory().realRunHits;
      const recent = (hits.get(ipHash) ?? []).filter(
        (t) => now - t < LAB_STORE_LIMITS.quotaWindowMs,
      );
      hits.set(ipHash, recent);
      return recent.length >= LAB_STORE_LIMITS.realRunQuota;
    },

    async consumeRealRunQuota(ipHash) {
      const now = Date.now();
      const hits = getLabMemory().realRunHits;
      const recent = (hits.get(ipHash) ?? []).filter(
        (t) => now - t < LAB_STORE_LIMITS.quotaWindowMs,
      );
      recent.push(now);
      hits.set(ipHash, recent);
    },

    async isRateLimited(ipHash) {
      const now = Date.now();
      const hits = getLabMemory().rateHits;
      const recent = (hits.get(ipHash) ?? []).filter(
        (t) => now - t < LAB_STORE_LIMITS.rateWindowMs,
      );
      if (recent.length >= LAB_STORE_LIMITS.rateMaxRequests) {
        hits.set(ipHash, recent);
        return true;
      }
      recent.push(now);
      hits.set(ipHash, recent);
      return false;
    },

    async hasEmailBudget(count, limit) {
      const mem = getLabMemory();
      const now = Date.now();
      if (now - mem.budgetWindowStart >= 24 * 60 * 60 * 1000) {
        mem.budgetWindowStart = now;
        mem.emailsSentToday = 0;
      }
      return mem.emailsSentToday + count <= limit;
    },

    async tryConsumeEmailBudget(count, limit) {
      if (count <= 0) return true;
      const mem = getLabMemory();
      const now = Date.now();
      if (now - mem.budgetWindowStart >= 24 * 60 * 60 * 1000) {
        mem.budgetWindowStart = now;
        mem.emailsSentToday = 0;
      }
      if (mem.emailsSentToday + count > limit) return false;
      mem.emailsSentToday += count;
      return true;
    },

    async refundEmailBudget(count) {
      if (count <= 0) return;
      const mem = getLabMemory();
      mem.emailsSentToday = Math.max(0, mem.emailsSentToday - count);
    },

    async upsertLabContact(input) {
      const now = Date.now();
      pruneContacts(now);
      const list = contacts();
      const index = list.findIndex((item) => item.emailHash === input.emailHash);
      if (index === -1) {
        const created = createLabContact(input, randomUUID(), now);
        list.push(created);
        return created;
      }
      const merged = mergeLabContactUpsert(list[index], input, now);
      list[index] = merged;
      return merged;
    },

    async updateLabContactProgress(emailHash, patch) {
      const now = Date.now();
      pruneContacts(now);
      const list = contacts();
      const index = list.findIndex((item) => item.emailHash === emailHash);
      if (index === -1) return null;
      const merged = mergeLabContactProgress(list[index], patch, now);
      list[index] = merged;
      return merged;
    },

    async getLabContactByEmailHash(emailHash) {
      pruneContacts(Date.now());
      return contacts().find((item) => item.emailHash === emailHash) ?? null;
    },
  };
}
