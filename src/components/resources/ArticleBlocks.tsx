import Link from "next/link";
import type { ArticleBlock, InlinePart } from "@/lib/content/articles";

function Parts({ parts }: { parts: InlinePart[] }) {
  return parts.map((part, index) =>
    typeof part === "string" ? (
      <span key={index}>{part}</span>
    ) : (
      <Link
        key={index}
        href={part.href}
        className="text-[#F3F1EB] underline decoration-violet-400/50 underline-offset-[3px] transition-colors hover:decoration-violet-300"
      >
        {part.label}
      </Link>
    ),
  );
}

/** El mismo corte del duotono del sitio: gris, morado y violeta en todo el título. */
const TITLE_FILL =
  "linear-gradient(90deg, #aab2c0 0%, #aab2c0 28%, #7c5cbf 28%, #7c5cbf 58%, #c4b5fd 58%, #c4b5fd 100%)";

export function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="mt-12 space-y-6 text-[17px] leading-[1.85] text-zinc-300">
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              key={block.id}
              id={block.id}
              className="scroll-mt-28 border-t border-white/10 bg-clip-text pt-10 font-serif text-[clamp(1.45rem,2.4vw,1.85rem)] font-normal leading-[1.2] tracking-[-0.02em] text-transparent"
              style={{ backgroundImage: TITLE_FILL }}
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={block.id}
              id={block.id}
              className="scroll-mt-28 pt-4 font-serif text-[1.2rem] font-normal leading-snug text-[#F3F1EB]"
            >
              {block.text}
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="space-y-3 py-1">
              {block.items.map((item) => (
                <li key={item} className="border-l border-violet-400/55 pl-4 text-[16px] leading-[1.7]">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            <Parts parts={block.parts} />
          </p>
        );
      })}
    </div>
  );
}
