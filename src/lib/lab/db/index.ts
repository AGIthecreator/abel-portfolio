import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getLabDbConfig } from "../config";
import { LAB_STORE_LIMITS, type LabLogEntry, type LabRunRecord } from "../store";
import type { LabAction, LabClassification } from "../types";
import { createMemoryLabRepository } from "./memory-repo";
import type { DedupClaim, LabFollowupWrite, LabRepository } from "./repository";
import {
  LAB_CONTACT_SOURCE,
  type LabContactRecord,
} from "./contact-logic";

interface RunRow {
  id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  access_token_hash: string;
  email_hash: string;
  ip_hash: string;
  payload_hash: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_message: string | null;
  route_id: string;
  classification: LabClassification;
  status: string;
  duplicate: boolean;
  internal_email_id: string | null;
  visitor_email_id: string | null;
  followup_email_id: string | null;
  followup_scheduled_at: string | null;
  followup_canceled: boolean;
  degraded_reason: string | null;
  usage: LabRunRecord["usage"];
  steps: LabRunRecord["steps"];
  actions: LabRunRecord["actions"];
  capabilities: LabRunRecord["capabilities"];
}

interface ContactRow {
  id: string;
  email: string;
  email_hash: string;
  name: string | null;
  business_type: string | null;
  goal: string | null;
  current_method: string | null;
  blocker: string | null;
  timeframe: string | null;
  route: string | null;
  experiences_completed: number;
  demo_completed: boolean;
  cta_clicked: boolean;
  source: string;
  first_seen_at: string;
  last_seen_at: string;
  test_count: number;
  last_run_id: string | null;
}

function fromContactRow(row: ContactRow): LabContactRecord {
  return {
    id: row.id,
    email: row.email,
    emailHash: row.email_hash,
    name: row.name,
    businessType: row.business_type,
    goal: row.goal,
    currentMethod: row.current_method,
    blocker: row.blocker,
    timeframe: row.timeframe,
    route: row.route,
    experiencesCompleted: row.experiences_completed,
    demoCompleted: row.demo_completed,
    ctaClicked: row.cta_clicked,
    source: LAB_CONTACT_SOURCE,
    firstSeenAt: new Date(row.first_seen_at).getTime(),
    lastSeenAt: new Date(row.last_seen_at).getTime(),
    testCount: row.test_count,
    lastRunId: row.last_run_id,
  };
}

function firstContactRow(data: unknown): ContactRow | null {
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? (row as ContactRow) : null;
}

function isExpired(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now();
}

function fromRow(row: RunRow): LabRunRecord | null {
  if (isExpired(row.expires_at)) return null;
  return {
    runId: row.id,
    accessTokenHash: row.access_token_hash,
    emailHash: row.email_hash,
    ipHash: row.ip_hash,
    payloadHash: row.payload_hash,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
    routeId: row.route_id as LabRunRecord["routeId"],
    classification: row.classification,
    classificationType: row.classification?.type ?? "",
    visitor:
      row.visitor_name && row.visitor_email && row.visitor_message
        ? {
            name: row.visitor_name,
            email: row.visitor_email,
            message: row.visitor_message,
          }
        : null,
    duplicate: row.duplicate,
    degradedReason: row.degraded_reason ?? undefined,
    steps: row.steps ?? [],
    actions: row.actions ?? [],
    capabilities: row.capabilities ?? {
      emailStatus: false,
      pdf: false,
      followup: false,
    },
    internalEmailId: row.internal_email_id,
    visitorEmailId: row.visitor_email_id,
    followupEmailId: row.followup_email_id,
    followupScheduledAt: row.followup_scheduled_at,
    followupCanceled: row.followup_canceled,
    usage: {
      emails: row.usage?.emails ?? 0,
      statusChecks: row.usage?.statusChecks ?? 0,
      pdfs: row.usage?.pdfs ?? 0,
      followups: row.usage?.followups ?? 0,
      reschedules: row.usage?.reschedules ?? 0,
    },
  };
}

function toRow(record: LabRunRecord): Record<string, unknown> {
  return {
    id: record.runId,
    created_at: new Date(record.createdAt).toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: new Date(record.expiresAt).toISOString(),
    access_token_hash: record.accessTokenHash,
    email_hash: record.emailHash,
    ip_hash: record.ipHash,
    payload_hash: record.payloadHash,
    visitor_name: record.visitor?.name ?? null,
    visitor_email: record.visitor?.email ?? null,
    visitor_message: record.visitor?.message ?? null,
    route_id: record.routeId,
    classification: record.classification,
    status: record.duplicate ? "duplicate" : "accepted",
    duplicate: record.duplicate,
    internal_email_id: record.internalEmailId,
    visitor_email_id: record.visitorEmailId,
    followup_email_id: record.followupEmailId,
    followup_scheduled_at: record.followupScheduledAt,
    followup_canceled: record.followupCanceled,
    degraded_reason: record.degradedReason ?? null,
    usage: record.usage,
    steps: record.steps,
    actions: record.actions,
    capabilities: record.capabilities,
  };
}

export function createSupabaseLabClient(): SupabaseClient | null {
  const config = getLabDbConfig();
  if (!config) return null;
  return createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseLabRepository(
  client: SupabaseClient,
): LabRepository {
  async function loadRun(runId: string): Promise<LabRunRecord | null> {
    const { data, error } = await client
      .from("lab_runs")
      .select("*")
      .eq("id", runId)
      .maybeSingle();
    if (error || !data) return null;
    return fromRow(data as RunRow);
  }

  async function scrubExpiredQuietly(): Promise<void> {
    await client.rpc("lab_scrub_expired");
  }

  return {
    kind: "supabase",

    async claimDedup(emailHash, runId): Promise<DedupClaim> {
      await client.rpc("lab_scrub_expired");
      const ttlSeconds = Math.floor(LAB_STORE_LIMITS.dedupeWindowMs / 1000);
      const { data, error } = await client.rpc("lab_claim_dedup", {
        p_email_hash: emailHash,
        p_run_id: runId,
        p_ttl_seconds: ttlSeconds,
      });

      if (error) {
        console.error("[lab] claimDedup", error.message);
        return { duplicate: true, existing: null };
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row || row.is_duplicate !== true) {
        return { duplicate: false, existing: null };
      }

      const existing = row.existing_run_id
        ? await loadRun(row.existing_run_id as string)
        : null;
      return { duplicate: true, existing };
    },

    async createRun(record) {
      await scrubExpiredQuietly();
      const { error } = await client.from("lab_runs").insert(toRow(record));
      if (error) throw error;
    },

    async getRunById(runId) {
      await scrubExpiredQuietly();
      return loadRun(runId);
    },

    async getRunByAccessTokenHash(tokenHash) {
      await scrubExpiredQuietly();
      const { data, error } = await client
        .from("lab_runs")
        .select("*")
        .eq("access_token_hash", tokenHash)
        .maybeSingle();
      if (error || !data) return null;
      return fromRow(data as RunRow);
    },

    async updateRun(runId, patch) {
      const current = await loadRun(runId);
      if (!current) return null;
      const { usage, ...rest } = patch;
      const next: LabRunRecord = {
        ...current,
        ...rest,
        usage: usage ? { ...current.usage, ...usage } : current.usage,
      };
      const { data, error } = await client
        .from("lab_runs")
        .update(toRow(next))
        .eq("id", runId)
        .select("*")
        .maybeSingle();
      if (error || !data) return null;
      return fromRow(data as RunRow);
    },

    async replaceActions(runId, actions: readonly LabAction[]) {
      await client.from("lab_actions").delete().eq("run_id", runId);
      if (actions.length === 0) {
        await client.from("lab_runs").update({ actions, updated_at: new Date().toISOString() }).eq("id", runId);
        return;
      }
      const { error } = await client.from("lab_actions").insert(
        actions.map((action) => ({
          run_id: runId,
          type: action.id,
          execution_mode: action.executionMode,
          status: action.status,
          provider_id: action.providerId ?? null,
          detail: action.detail,
        })),
      );
      if (error) throw error;
      await client
        .from("lab_runs")
        .update({ actions, updated_at: new Date().toISOString() })
        .eq("id", runId);
    },

    async upsertFollowup(runId, followup: LabFollowupWrite) {
      const { error } = await client.from("lab_followups").upsert(
        {
          run_id: runId,
          provider_id: followup.providerId,
          status: followup.status,
          execution_mode: followup.executionMode,
          scheduled_at: followup.scheduledAt,
          cancelled_at: followup.cancelled ? new Date().toISOString() : null,
          reschedules: followup.reschedules,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "run_id" },
      );
      if (error) throw error;
    },

    async addEvent(entry: Omit<LabLogEntry, "at">) {
      await client.from("lab_events").insert({
        run_id: entry.runId,
        event: entry.event,
        detail: entry.detail ?? null,
      });
      console.info("[lab]", entry.event, entry.runId, entry.detail ?? "");
    },

    async hasExhaustedRealRunQuota(ipHash) {
      const since = new Date(
        Date.now() - LAB_STORE_LIMITS.quotaWindowMs,
      ).toISOString();
      const { count, error } = await client
        .from("lab_quota_hits")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since);
      if (error) return false;
      return (count ?? 0) >= LAB_STORE_LIMITS.realRunQuota;
    },

    async consumeRealRunQuota(ipHash) {
      await client.from("lab_quota_hits").insert({ ip_hash: ipHash });
    },

    async isRateLimited(ipHash) {
      const since = new Date(
        Date.now() - LAB_STORE_LIMITS.rateWindowMs,
      ).toISOString();
      const { error } = await client
        .from("lab_rate_hits")
        .insert({ ip_hash: ipHash });
      if (error) return true;
      const { count } = await client
        .from("lab_rate_hits")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since);
      return (count ?? 0) > LAB_STORE_LIMITS.rateMaxRequests;
    },

    async hasEmailBudget(count, limit) {
      const day = new Date().toISOString().slice(0, 10);
      const { data } = await client
        .from("lab_budget")
        .select("emails_sent")
        .eq("day", day)
        .maybeSingle();
      const used = data?.emails_sent ?? 0;
      return used + count <= limit;
    },

    async tryConsumeEmailBudget(count, limit) {
      const { data, error } = await client.rpc("lab_try_consume_email_budget", {
        n: count,
        daily_limit: limit,
      });
      if (error) {
        console.error("[lab] budget consume", error.message);
        return false;
      }
      return data === true;
    },

    async refundEmailBudget(count) {
      const { error } = await client.rpc("lab_refund_email_budget", { n: count });
      if (error) console.error("[lab] budget refund", error.message);
    },

    async upsertLabContact(input) {
      const { data, error } = await client.rpc("lab_upsert_contact", {
        p_email: input.email,
        p_email_hash: input.emailHash,
        p_name: input.name ?? null,
        p_goal: input.goal ?? null,
        p_route: input.route ?? null,
        p_last_run_id: input.lastRunId ?? null,
      });
      if (error) throw error;
      const row = firstContactRow(data);
      if (!row) throw new Error("lab_upsert_contact empty");
      return fromContactRow(row);
    },

    async updateLabContactProgress(emailHash, patch) {
      const { data, error } = await client.rpc("lab_update_contact_progress", {
        p_email_hash: emailHash,
        p_experiences: patch.experiencesCompleted ?? null,
        p_demo: patch.demoCompleted ?? null,
        p_cta: patch.ctaClicked ?? null,
      });
      if (error) {
        console.error("[lab] contact progress", error.message);
        return null;
      }
      const row = firstContactRow(data);
      return row ? fromContactRow(row) : null;
    },

    async getLabContactByEmailHash(emailHash) {
      const { data, error } = await client
        .from("lab_contacts")
        .select("*")
        .eq("email_hash", emailHash)
        .maybeSingle();
      if (error || !data) return null;
      return fromContactRow(data as ContactRow);
    },
  };
}

const REPO_KEY = "__agiLabRepositoryV3" as const;

type GlobalWithRepo = typeof globalThis & { [REPO_KEY]?: LabRepository };

export function getLabRepository(): LabRepository {
  const g = globalThis as GlobalWithRepo;
  if (!g[REPO_KEY]) {
    const client = createSupabaseLabClient();
    g[REPO_KEY] = client
      ? createSupabaseLabRepository(client)
      : createMemoryLabRepository();
    console.info("[lab] persistencia", g[REPO_KEY].kind);
  }
  return g[REPO_KEY];
}
