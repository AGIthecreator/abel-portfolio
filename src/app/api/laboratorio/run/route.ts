import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/contact/rate-limit";
import { stripHeaderInjection } from "@/lib/contact/sanitize";
import { sendLabRouteEmails } from "@/lib/lab/actions/email";
import { simulated } from "@/lib/lab/actions/provider";
import { isLabMailConfigured, labMailUnavailableReason } from "@/lib/lab/config";
import { classifyLabMessage } from "@/lib/lab/classify";
import {
  applyLabAccessCookie,
  readLabAccessToken,
  remainingCookieMaxAge,
} from "@/lib/lab/db/cookie";
import {
  accessTokensEqual,
  createLabAccessToken,
  hashLabAccessToken,
} from "@/lib/lab/db/crypto";
import { getLabRepository } from "@/lib/lab/db";
import { rememberLabContact } from "@/lib/lab/db/remember-contact";
import { activationFromRun } from "@/lib/lab/present";
import { isLabRateLimited } from "@/lib/lab/rate-limit";
import { labRunSchema, normalizeLabEmail } from "@/lib/lab/schema";
import { resolveLabRoute } from "@/lib/lab/routing";
import {
  buildDuplicateActions,
  buildDuplicateTimeline,
  buildRunActions,
  buildRunTimeline,
} from "@/lib/lab/steps";
import {
  createEmptyUsage,
  createLabRunId,
  hashLabIdentifier,
  hashLabPayload,
  LAB_STORE_LIMITS,
  type LabRunRecord,
} from "@/lib/lab/store";
import type { LabRunResponse } from "@/lib/lab/types";

export const runtime = "nodejs";

const QUOTA_MESSAGE = "Límite de ejecuciones reales alcanzado.";

export async function POST(req: Request) {
  const clientIp = getClientIp(req);

  if (await isLabRateLimited(clientIp)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Demasiados intentos. Inténtalo más tarde.",
        code: "rate_limited",
      },
      { status: 429 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Datos inválidos", code: "invalid" },
        { status: 400 },
      );
    }

    const parsed = labRunSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Datos inválidos",
          code: "invalid",
        },
        { status: 400 },
      );
    }

    const { name, email, message, website } = parsed.data;
    const { classification, routeId } = classifyLabMessage(message);
    const route = resolveLabRoute(routeId);
    const repo = getLabRepository();

    // Honeypot: respuesta plausible sin persistir ni cookie.
    if (website) {
      const blocked = simulated(
        "La solicitud no ha pasado los controles de entrada.",
      );
      const payload: LabRunResponse = {
        ok: true,
        runId: createLabRunId(),
        duplicate: false,
        classification,
        route,
        steps: buildRunTimeline({
          classification,
          route,
          internal: blocked,
          visitor: blocked,
          quotaExhausted: true,
          recorded: false,
        }),
        actions: buildRunActions({
          classification,
          internal: blocked,
          visitor: blocked,
          quotaExhausted: true,
          recorded: false,
        }),
        capabilities: { emailStatus: false, pdf: false, followup: false },
        degradedReason: "La solicitud no ha pasado los controles de entrada.",
      };
      return NextResponse.json(payload);
    }

    const cleanName = stripHeaderInjection(name);
    const cleanEmail = normalizeLabEmail(stripHeaderInjection(email));
    const emailHash = hashLabIdentifier(cleanEmail);
    const runId = createLabRunId();

    const claim = await repo.claimDedup(emailHash, runId);
    if (claim.duplicate) {
      if (!claim.existing) {
        return NextResponse.json(
          { ok: false, error: "Error interno", code: "server_error" },
          { status: 500 },
        );
      }

      const previous = claim.existing;
      await repo.addEvent({
        runId: previous.runId,
        event: "run_duplicate",
        detail: `intento=${runId}`,
      });

      const token = readLabAccessToken(req);
      const ownsPrevious = Boolean(
        token &&
          accessTokensEqual(
            previous.accessTokenHash,
            hashLabAccessToken(token),
          ),
      );

      const minutesAgo = Math.max(
        1,
        Math.round((Date.now() - previous.createdAt) / 60000),
      );

      await rememberLabContact(repo, {
        email: cleanEmail,
        emailHash,
        name: cleanName,
        classification: previous.classification ?? classification,
        routeId: previous.routeId ?? route.id,
        runId: previous.runId,
      });

      if (ownsPrevious && token) {
        const restored = activationFromRun(previous);
        const payload: LabRunResponse = restored
          ? {
              ok: true,
              runId: previous.runId,
              duplicate: true,
              classification: restored.classification,
              route: restored.route,
              steps: restored.steps,
              actions: restored.actions,
              capabilities: restored.capabilities,
              followup: restored.followup,
              degradedReason:
                "La comprobación de duplicados ha detenido el proceso antes de ejecutar acciones.",
            }
          : {
              ok: true,
              runId: previous.runId,
              duplicate: true,
              classification,
              route,
              steps: buildDuplicateTimeline(minutesAgo),
              actions: buildDuplicateActions(),
              capabilities: { emailStatus: false, pdf: false, followup: false },
              degradedReason:
                "La comprobación de duplicados ha detenido el proceso antes de ejecutar acciones.",
            };

        const response = NextResponse.json(payload);
        applyLabAccessCookie(
          response,
          token,
          remainingCookieMaxAge(previous.expiresAt),
        );
        return response;
      }

      const payload: LabRunResponse = {
        ok: true,
        runId: previous.runId,
        duplicate: true,
        classification,
        route,
        steps: buildDuplicateTimeline(minutesAgo),
        actions: buildDuplicateActions(),
        capabilities: { emailStatus: false, pdf: false, followup: false },
        degradedReason:
          "La comprobación de duplicados ha detenido el proceso antes de ejecutar acciones.",
      };
      return NextResponse.json(payload);
    }

    const mailConfigured = isLabMailConfigured();
    const ipHash = hashLabIdentifier(clientIp);
    const quotaExhausted = await repo.hasExhaustedRealRunQuota(ipHash);

    const accessToken = createLabAccessToken();
    const now = Date.now();
    const record: LabRunRecord = {
      runId,
      accessTokenHash: hashLabAccessToken(accessToken),
      emailHash,
      ipHash,
      payloadHash: hashLabPayload({ name, email, message }),
      createdAt: now,
      expiresAt: now + LAB_STORE_LIMITS.runTtlMs,
      routeId: route.id,
      classification,
      classificationType: classification.type,
      visitor: { name: cleanName, email: cleanEmail, message },
      duplicate: false,
      degradedReason: quotaExhausted ? QUOTA_MESSAGE : undefined,
      steps: [],
      actions: [],
      capabilities: { emailStatus: false, pdf: true, followup: false },
      internalEmailId: null,
      visitorEmailId: null,
      followupEmailId: null,
      followupScheduledAt: null,
      followupCanceled: false,
      usage: createEmptyUsage(),
    };

    // Registrar antes de actuar: si el envío falla a medias, la ejecución existe.
    await repo.createRun(record);
    await rememberLabContact(repo, {
      email: cleanEmail,
      emailHash,
      name: cleanName,
      classification,
      routeId: route.id,
      runId,
    });

    const { internal, visitor } = quotaExhausted
      ? { internal: simulated(QUOTA_MESSAGE), visitor: simulated(QUOTA_MESSAGE) }
      : await sendLabRouteEmails({
          runId,
          name: cleanName,
          email: cleanEmail,
          message,
          classification,
          route,
        });

    const realEmails = Number(internal.ok) + Number(visitor.ok);
    if (realEmails > 0) {
      await repo.consumeRealRunQuota(ipHash);
      await repo.addEvent({
        runId,
        event: "run_email_sent",
        detail: `ruta=${route.id}`,
      });
    } else if (quotaExhausted) {
      await repo.addEvent({ runId, event: "run_quota_exhausted" });
    } else if (internal.error || visitor.error) {
      await repo.addEvent({
        runId,
        event: "run_email_failed",
        detail: internal.error ?? visitor.error ?? "error",
      });
    }

    const steps = buildRunTimeline({
      classification,
      route,
      internal,
      visitor,
      quotaExhausted,
      recorded: true,
    });
    const actions = buildRunActions({
      classification,
      internal,
      visitor,
      quotaExhausted,
      recorded: true,
    });
    const capabilities = {
      emailStatus: Boolean(internal.providerId ?? visitor.providerId),
      pdf: true,
      followup: mailConfigured && !quotaExhausted,
    };
    const degradedReason = mailConfigured
      ? quotaExhausted
        ? QUOTA_MESSAGE
        : internal.ok || visitor.ok
          ? undefined
          : (internal.error ?? internal.detail)
      : labMailUnavailableReason();

    await repo.updateRun(runId, {
      degradedReason,
      steps,
      actions,
      capabilities,
      internalEmailId: internal.providerId ?? null,
      visitorEmailId: visitor.providerId ?? null,
      usage: { emails: realEmails },
    });
    await repo.replaceActions(runId, actions);
    await repo.addEvent({
      runId,
      event: "run_accepted",
      detail: `tipo=${classification.type} ruta=${route.id} emails=${realEmails} persist=${repo.kind}`,
    });

    const payload: LabRunResponse = {
      ok: true,
      runId,
      duplicate: false,
      classification,
      route,
      steps,
      actions,
      capabilities,
      degradedReason,
    };

    const response = NextResponse.json(payload);
    applyLabAccessCookie(response, accessToken);
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error interno", code: "server_error" },
      { status: 500 },
    );
  }
}
