"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import {
  MAINTENANCE_OFFER,
  PRICING_FAQ_GROUPS,
  PRICING_TRANSPARENCY,
  PRODUCTS,
  TEMPLATES_CONTEXT,
  formatEurAmount,
  type Product,
  type ProductId,
} from "@/lib/commerce";

const BONE = "#F3F1EB";

const WEB_ORDER: ProductId[] = ["entrada", "profesional", "a-medida"];

const QUOTE_LINKS: Record<ProductId, { href: string; cta: string }> = {
  entrada: {
    href: "/presupuesto?servicio=entrada",
    cta: "Empezar con esta web",
  },
  profesional: {
    href: "/presupuesto?servicio=profesional",
    cta: "Preparar esta web",
  },
  "a-medida": {
    href: "/presupuesto?servicio=a-medida",
    cta: "Plantear el proyecto",
  },
  sistemas: {
    href: "/presupuesto?servicio=sistemas",
    cta: "Configurar un flujo",
  },
};

const TEMPLATE_DEMOS = [
  {
    name: "Comercio local",
    description: "Referencia visual para comercios y negocios de proximidad.",
    href: "https://commerce.agithecreator.com",
    image: "/templates/commerce.webp",
  },
  {
    name: "Clínica",
    description: "Referencia visual para consultas, clínicas y centros sanitarios.",
    href: "https://clinic.agithecreator.com",
    image: "/templates/clinic.webp",
  },
  {
    name: "Restaurante",
    description: "Referencia visual para restaurantes, cafeterías y hostelería.",
    href: "https://restaurant.agithecreator.com",
    image: "/templates/restaurant.webp",
  },
  {
    name: "Legal",
    description: "Referencia visual para despachos y profesionales jurídicos.",
    href: "https://legal.agithecreator.com",
    image: "/templates/legal.webp",
  },
] as const;

function webProducts(): Product[] {
  return WEB_ORDER.map((id) => PRODUCTS.find((product) => product.id === id)).filter(
    (product): product is Product => Boolean(product),
  );
}

function PriceBlock({
  amount,
  previous,
  from,
  perMonth,
  featured,
  align = "end",
  compact = false,
}: {
  amount: number;
  previous?: number;
  from?: boolean;
  perMonth?: boolean;
  featured?: boolean;
  align?: "start" | "end";
  compact?: boolean;
}) {
  const end = align === "end";
  return (
    <div className={end ? "text-left sm:text-right" : "text-left"}>
      {previous != null ? (
        <p className={`text-[13px] tabular-nums ${featured ? "text-[#070b13]/45" : "text-zinc-500"}`}>
          <span className="sr-only">Precio anterior: </span>
          <span className="line-through decoration-current/70">{formatEurAmount(previous)}</span>
        </p>
      ) : (
        <p className="select-none text-[13px] text-transparent" aria-hidden>
          —
        </p>
      )}
      {from ? (
        <p
          className={`mt-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
            featured ? "text-[#070b13]/50" : "text-zinc-500"
          }`}
        >
          Desde
        </p>
      ) : null}
      <p className={`mt-1 flex flex-wrap items-baseline gap-x-2 ${end ? "sm:justify-end" : ""}`}>
        <span className="sr-only">Precio actual: </span>
        <span
          className={`font-serif font-normal tabular-nums tracking-[-0.04em] ${
            featured
              ? "text-[clamp(3.4rem,6vw,5.4rem)] leading-none text-[#070b13]"
              : compact
                ? "text-[clamp(2rem,4vw,2.5rem)] leading-none text-[#F3F1EB]"
                : "text-[clamp(2.6rem,5vw,3.6rem)] leading-none text-[#F3F1EB]"
          }`}
        >
          {formatEurAmount(amount).replace(" €", "")}
        </span>
        <span
          className={`font-serif text-[1.35rem] ${featured ? "text-[#070b13]" : "text-[#F3F1EB]"}`}
        >
          €{perMonth ? <span className="text-[0.95rem]">/mes</span> : null}
        </span>
      </p>
      <p
        className={`mt-1 font-mono text-[11px] uppercase tracking-[0.16em] ${
          featured ? "text-[#070b13]/55" : "text-zinc-500"
        }`}
      >
        + IVA
      </p>
    </div>
  );
}

function DetailGroups({
  includes,
  conditions,
  featured,
}: {
  includes: readonly string[];
  conditions: readonly string[];
  featured?: boolean;
}) {
  const ink = featured ? "text-[#070b13]/80" : "text-zinc-400";
  const label = featured ? "text-[#070b13]/45" : "text-zinc-500";
  const rule = featured ? "border-[#070b13]/10" : "border-white/10";

  return (
    <div className={`mt-6 grid gap-6 border-t pt-5 sm:grid-cols-2 ${rule}`}>
      <div>
        <h4 className={`font-mono text-[10px] uppercase tracking-[0.16em] ${label}`}>
          Qué incluye este alcance
        </h4>
        <ul className={`mt-3 space-y-2 text-[14px] leading-relaxed ${ink}`}>
          {includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className={`font-mono text-[10px] uppercase tracking-[0.16em] ${label}`}>
          Condiciones
        </h4>
        <ul className={`mt-3 space-y-2 text-[14px] leading-relaxed ${ink}`}>
          {conditions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function IncludeToggle({
  open,
  onToggle,
  controls,
  featured,
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={`mt-4 text-left text-[13px] underline decoration-transparent underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
        featured
          ? "text-[#070b13]/60 hover:text-[#070b13] hover:decoration-[#070b13]/30"
          : "text-zinc-500 hover:text-zinc-200 hover:decoration-white/30"
      }`}
    >
      {open ? "Ocultar detalle" : "Ver qué incluye"}
    </button>
  );
}

function WebOffer({
  product,
  index,
  open,
  onToggle,
}: {
  product: Product;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const featured = product.id === "profesional";
  const link = QUOTE_LINKS[product.id];
  const order = String(index + 1).padStart(2, "0");

  const go = () => {
    trackEvent("pricing_cta", {
      location: "precios",
      destination: "presupuesto",
      product: product.id,
    });
  };

  return (
    <article
      className={
        featured
          ? "relative bg-[#F3F1EB] px-5 py-10 text-[#070b13] shadow-[0_30px_70px_-42px_rgba(0,0,0,0.8)] sm:px-8 sm:py-12 lg:px-12 lg:py-14"
          : "border-t border-white/10 px-1 py-9 sm:px-2 sm:py-11"
      }
    >
      <div
        className={`grid items-start gap-8 lg:items-center ${
          featured ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(14rem,0.7fr)]" : "lg:grid-cols-[minmax(0,1fr)_16rem]"
        }`}
      >
        <div className="min-w-0">
          <p
            className={`font-mono text-[11px] tracking-[0.18em] ${
              featured ? "text-[#070b13]/45" : "text-zinc-500"
            }`}
          >
            {order}
          </p>
          <h3
            className={`mt-3 font-serif font-normal tracking-[-0.035em] ${
              featured
                ? "text-[clamp(2.1rem,4vw,3.15rem)] leading-[1.02] text-[#070b13]"
                : "text-[clamp(1.7rem,3vw,2.25rem)] leading-[1.08] text-[#F3F1EB]"
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`mt-4 max-w-[38ch] text-[16px] leading-relaxed ${
              featured ? "text-[#070b13]/75" : "text-zinc-300"
            }`}
          >
            {product.summary}
          </p>
          <p
            className={`mt-3 max-w-[40ch] text-[14px] leading-relaxed ${
              featured ? "text-[#070b13]/55" : "text-zinc-500"
            }`}
          >
            {product.suitedFor}
          </p>
          <div className="mt-6 lg:hidden">
            <PriceBlock
              amount={product.publicFromEur}
              previous={product.previousPublicEur}
              from={product.priceIsFrom}
              featured={featured}
              align="start"
            />
            {product.priceIsFrom ? (
              <p className={`mt-3 text-[13px] leading-relaxed ${featured ? "text-[#070b13]/50" : "text-zinc-500"}`}>
                Punto de partida de este alcance.
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={link.href}
              onClick={go}
              className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 text-[14px] font-medium tracking-[-0.01em] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
                featured
                  ? "bg-[#070b13] text-[#F3F1EB] hover:bg-[#141a27]"
                  : "bg-[#F3F1EB] text-[#070b13] hover:bg-white"
              }`}
            >
              {link.cta}
            </Link>
            <IncludeToggle
              open={open}
              onToggle={onToggle}
              controls={panelId}
              featured={featured}
            />
          </div>
        </div>
        <div className="hidden lg:block">
          <PriceBlock
            amount={product.publicFromEur}
            previous={product.previousPublicEur}
            from={product.priceIsFrom}
            featured={featured}
          />
          {product.priceIsFrom ? (
            <p
              className={`mt-3 text-[13px] leading-relaxed sm:text-right ${
                featured ? "text-[#070b13]/50" : "text-zinc-500"
              }`}
            >
              Punto de partida de este alcance.
            </p>
          ) : null}
        </div>
      </div>
      <div id={panelId} role="region" aria-label={`Qué incluye ${product.name}`} hidden={!open}>
        {open ? (
          <DetailGroups
            includes={product.publicDetail.includes}
            conditions={product.publicDetail.conditions}
            featured={featured}
          />
        ) : null}
      </div>
    </article>
  );
}

function ComplementOffer({
  kicker,
  name,
  summary,
  audience,
  amount,
  previous,
  from,
  perMonth,
  note,
  href,
  cta,
  includes,
  conditions,
  open,
  onToggle,
  productId,
}: {
  kicker: string;
  name: string;
  summary: string;
  audience: string;
  amount: number;
  previous?: number;
  from?: boolean;
  perMonth?: boolean;
  note?: string;
  href: string;
  cta: string;
  includes: readonly string[];
  conditions: readonly string[];
  open: boolean;
  onToggle: () => void;
  productId: string;
}) {
  const panelId = useId();

  return (
    <article className="px-1 py-8 sm:px-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{kicker}</p>
      <h3 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.03em] text-[#F3F1EB]">
        {name}
      </h3>
      <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-zinc-300">{summary}</p>
      <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-zinc-500">{audience}</p>
      <div className="mt-6">
        <PriceBlock
          amount={amount}
          previous={previous}
          from={from}
          perMonth={perMonth}
          compact
          align="start"
        />
      </div>
      {note ? <p className="mt-3 max-w-[36ch] text-[13px] leading-relaxed text-zinc-500">{note}</p> : null}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href={href}
          onClick={() =>
            trackEvent("pricing_cta", {
              location: "precios",
              destination: "presupuesto",
              product: productId,
            })
          }
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 text-[14px] text-[#F3F1EB] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
        >
          {cta}
        </Link>
        <IncludeToggle open={open} onToggle={onToggle} controls={panelId} />
      </div>
      <div id={panelId} role="region" aria-label={`Qué incluye ${name}`} hidden={!open}>
        {open ? <DetailGroups includes={includes} conditions={conditions} /> : null}
      </div>
    </article>
  );
}

function TemplateDemoCard({
  name,
  description,
  href,
  image,
}: {
  name: string;
  description: string;
  href: string;
  image: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
    >
      <div className="relative aspect-16/10 overflow-hidden border border-white/10 bg-[#070b13]">
        <Image
          src={image}
          alt={`Vista previa de referencia: ${name}`}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover object-top"
        />
      </div>
      <h3 className="mt-3 font-serif text-[1.05rem] font-normal text-[#F3F1EB]">{name}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{description}</p>
    </a>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();

  return (
    <article className="border-b border-white/10">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-[15px] text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <span>{question}</span>
          <span aria-hidden className="font-mono text-[12px] text-zinc-500">
            {isOpen ? "–" : "+"}
          </span>
        </button>
      </h3>
      {isOpen ? (
        <p id={panelId} className="max-w-[62ch] pb-4 text-[14px] leading-relaxed text-zinc-400">
          {answer}
        </p>
      ) : null}
    </article>
  );
}

export function Pricing() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const webs = webProducts();
  const sistemas = PRODUCTS.find((product) => product.id === "sistemas");

  const toggle = (id: string) => {
    setOpenId((current) => {
      const next = current === id ? null : id;
      if (next) trackEvent("pricing_product_view", { product: id });
      return next;
    });
  };

  return (
    <div className="bg-[#070b13] text-zinc-300">
      <header className="mx-auto w-full max-w-6xl px-5 pb-6 pt-28 sm:px-8 sm:pt-32 lg:px-10 lg:pt-36">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          Tarifas de lanzamiento
        </p>
        <h1 className="mt-5 max-w-[16ch] font-serif text-[clamp(2.5rem,6.4vw,4.7rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#F3F1EB]">
          Una buena solución empieza por un precio claro.
        </h1>
        <p className="mt-6 max-w-[36ch] text-[17px] leading-relaxed text-zinc-400">
          Elige por dónde empezar. Definimos el alcance contigo antes de construir.
        </p>
      </header>

      <section aria-labelledby="pricing-webs-heading" className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <h2 id="pricing-webs-heading" className="sr-only">
          Servicios web
        </h2>
        <div className="mt-10 sm:mt-14">
          {webs.map((product, index) => (
            <WebOffer
              key={product.id}
              product={product}
              index={index}
              open={openId === product.id}
              onToggle={() => toggle(product.id)}
            />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="pricing-complements-heading"
        className="mx-auto mt-16 w-full max-w-6xl border-t border-white/10 px-5 py-12 sm:px-8 lg:px-10"
      >
        <h2
          id="pricing-complements-heading"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500"
        >
          Complementos
        </h2>
        <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-0 md:divide-x md:divide-white/10">
          {sistemas ? (
            <ComplementOffer
              kicker="Automatización"
              name={sistemas.name}
              summary={sistemas.summary}
              audience={sistemas.suitedFor}
              amount={sistemas.publicFromEur}
              from={sistemas.priceIsFrom}
              note="El importe sube con las integraciones y el alcance."
              href={QUOTE_LINKS.sistemas.href}
              cta={QUOTE_LINKS.sistemas.cta}
              includes={sistemas.publicDetail.includes}
              conditions={sistemas.publicDetail.conditions}
              open={openId === sistemas.id}
              onToggle={() => toggle(sistemas.id)}
              productId={sistemas.id}
            />
          ) : null}
          <ComplementOffer
            kicker="Después de publicar"
            name={MAINTENANCE_OFFER.name}
            summary={MAINTENANCE_OFFER.summary}
            audience={MAINTENANCE_OFFER.audience}
            amount={MAINTENANCE_OFFER.priceFromEur}
            previous={MAINTENANCE_OFFER.previousPublicEur}
            perMonth
            note="Cuidado técnico. El desarrollo nuevo va aparte."
            href="/presupuesto?mantenimiento=si"
            cta="Incluir mantenimiento"
            includes={MAINTENANCE_OFFER.includes}
            conditions={[
              MAINTENANCE_OFFER.scopeClarification,
              MAINTENANCE_OFFER.priceNote,
            ]}
            open={openId === "mantenimiento"}
            onToggle={() => toggle("mantenimiento")}
            productId="mantenimiento"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 lg:px-10" aria-labelledby="pricing-clarity-heading">
        <h2 id="pricing-clarity-heading" className="sr-only">
          Cómo se cierra el precio
        </h2>
        <p className="max-w-[58ch] text-[15px] leading-[1.75] text-zinc-500">{PRICING_TRANSPARENCY}</p>
        <p className="mt-5 text-[14px] text-zinc-500">
          Más contexto en{" "}
          <Link href="/desarrollo-web" className="text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-[#F3F1EB]">
            desarrollo web
          </Link>
          {" y "}
          <Link
            href="/automatizacion-de-procesos"
            className="text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-[#F3F1EB]"
          >
            automatización
          </Link>
          .
        </p>
      </section>

      <section className="border-t border-white/10" aria-labelledby="pricing-templates-heading">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <h2
            id="pricing-templates-heading"
            className="font-serif text-[clamp(1.4rem,2.5vw,1.8rem)] font-normal tracking-[-0.03em] text-[#F3F1EB]"
          >
            Referencias visuales
          </h2>
          <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-zinc-500">{TEMPLATES_CONTEXT}</p>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATE_DEMOS.map((demo) => (
              <TemplateDemoCard key={demo.name} {...demo} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10" aria-labelledby="pricing-faq-heading">
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8">
          <h2
            id="pricing-faq-heading"
            className="font-serif text-[clamp(1.4rem,2.5vw,1.8rem)] font-normal tracking-[-0.03em] text-[#F3F1EB]"
          >
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-8">
            {PRICING_FAQ_GROUPS.map((group) => (
              <div key={group.id}>
                <h3 className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {group.title}
                </h3>
                <div className="border-t border-white/10">
                  {group.items.map((item) => {
                    const key = `${group.id}:${item.q}`;
                    return (
                      <FaqItem
                        key={key}
                        question={item.q}
                        answer={item.a}
                        isOpen={openFaq === key}
                        onToggle={() => setOpenFaq((current) => (current === key ? null : key))}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10" aria-labelledby="pricing-cta-heading">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <h2
            id="pricing-cta-heading"
            className="max-w-[16ch] font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#F3F1EB]"
          >
            Si aún no tienes claro el alcance, lo vemos juntos.
          </h2>
          <div className="mt-8">
            <Link
              href="/presupuesto"
              onClick={() =>
                trackEvent("pricing_cta", {
                  location: "precios",
                  destination: "presupuesto",
                  product: "none",
                })
              }
              className="inline-flex min-h-12 items-center justify-center rounded-md px-6 text-[15px] font-medium text-[#070b13] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
              style={{ backgroundColor: BONE }}
            >
              Preparar un presupuesto
            </Link>
          </div>
          <p className="mt-4 max-w-[42ch] text-[13px] leading-relaxed text-zinc-600">
            El configurador da una orientación. El presupuesto definitivo llega antes de contratar.
          </p>
        </div>
      </section>
    </div>
  );
}
