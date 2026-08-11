import { NextResponse } from "next/server";
import { getClientIp, isRateLimited } from "@/lib/contact/rate-limit";
import { buildQuotePdfModel } from "@/lib/commerce/buildQuotePdfModel";
import { validateAndBuildQuotePdfRequest } from "@/lib/commerce/quoteSchema";
import { quotePdfFilename, renderQuotePdfBuffer } from "@/lib/pdf/renderQuotePdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo más tarde." },
      { status: 429 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const validated = validateAndBuildQuotePdfRequest(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: validated.status },
      );
    }

    const model = buildQuotePdfModel({
      quoteId: validated.quoteId,
      timestamp: validated.timestamp,
      input: validated.input,
      result: validated.result,
      diagnostic: validated.diagnostic,
      contact: validated.contact,
    });

    const pdf = await renderQuotePdfBuffer(model);
    const filename = quotePdfFilename(model);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[quote/pdf] generación fallida", err);
    return NextResponse.json({ error: "Error generando el PDF" }, { status: 500 });
  }
}
