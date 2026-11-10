import Image from "next/image";
import type { ReactNode } from "react";
import {
  ServicePageStripes,
  type ServiceStripeVariant,
} from "@/components/services/ServicePagePrimitives";

const SECTION_SURFACE =
  "linear-gradient(180deg, #0c121c 0%, #131b2a 52%, #0c121c 100%)";

export function StripeBand({
  variant,
  children,
  className = "",
}: {
  variant: ServiceStripeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden bg-[#070b13] ${className}`}>
      <ServicePageStripes variant={variant} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function SurfaceBand({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className} style={{ background: SECTION_SURFACE }}>
      {children}
    </section>
  );
}

export function BoneBand({
  children,
  className = "",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section aria-labelledby={labelledBy} className={`bg-[#F3F1EB] text-[#1c1915] ${className}`}>
      {children}
    </section>
  );
}

export function EditorialImage({
  src,
  alt,
  priority = false,
  wide = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#12151f] ${wide ? "aspect-video" : "aspect-4/3"}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
