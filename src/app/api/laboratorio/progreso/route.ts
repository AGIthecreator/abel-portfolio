import { NextResponse } from "next/server";
import { readLabAccessToken } from "@/lib/lab/db/cookie";
import { hashLabAccessToken } from "@/lib/lab/db/crypto";
import { getLabRepository } from "@/lib/lab/db";
import { toLabContactPublic } from "@/lib/lab/db/contact-logic";
import { rememberLabContact } from "@/lib/lab/db/remember-contact";
import {
  experiencesFromProgress,
  labProgressSchema,
} from "@/lib/lab/schema";
import type { LabErrorResponse, LabProgressResponse } from "@/lib/lab/types";

export const runtime = "nodejs";

function notFound() {
  const payload: LabErrorResponse = {
    ok: false,
    error: "No encontrado",
    code: "not_found",
  };
  return NextResponse.json(payload, { status: 404 });
}

async function contactForRequest(req: Request) {
  const token = readLabAccessToken(req);
  if (!token) return null;
  const repo = getLabRepository();
  const run = await repo.getRunByAccessTokenHash(hashLabAccessToken(token));
  if (!run) return null;

  let contact = await repo.getLabContactByEmailHash(run.emailHash);
  if (!contact && run.visitor) {
    contact = await rememberLabContact(repo, {
      email: run.visitor.email,
      emailHash: run.emailHash,
      name: run.visitor.name,
      classification: run.classification,
      routeId: run.routeId,
      runId: run.runId,
    });
  }
  if (!contact) return null;
  return { repo, run, contact };
}

export async function GET(req: Request) {
  const resolved = await contactForRequest(req);
  if (!resolved) return notFound();
  const payload: LabProgressResponse = toLabContactPublic(resolved.contact);
  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  const resolved = await contactForRequest(req);
  if (!resolved) return notFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Datos inválidos", code: "invalid" } satisfies LabErrorResponse,
      { status: 400 },
    );
  }

  const parsed = labProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Datos inválidos",
        code: "invalid",
      } satisfies LabErrorResponse,
      { status: 400 },
    );
  }

  if (parsed.data.event === "experience" && !parsed.data.experience) {
    return NextResponse.json(
      { ok: false, error: "Datos inválidos", code: "invalid" } satisfies LabErrorResponse,
      { status: 400 },
    );
  }

  const patch = {
    experiencesCompleted: experiencesFromProgress(parsed.data),
    demoCompleted: parsed.data.event === "demo_completed",
    ctaClicked: parsed.data.event === "cta_clicked",
  };

  const updated = await resolved.repo.updateLabContactProgress(
    resolved.run.emailHash,
    patch,
  );
  if (!updated) return notFound();

  const payload: LabProgressResponse = toLabContactPublic(updated);
  return NextResponse.json(payload);
}
