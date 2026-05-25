import Image from "next/image";
import {
  NOT_FOUND_MASCOT_ASSET,
  NOT_FOUND_MASCOT_PRESET,
} from "@/components/not-found/not-found-mascot-preset";

export function NotFoundMascot() {
  const {
    widthPx,
    offsetXPx,
    offsetYPx,
    gapBelowPx,
    useOriginalFile,
    imageQuality,
  } = NOT_FOUND_MASCOT_PRESET;
  const { src, naturalWidth, naturalHeight } = NOT_FOUND_MASCOT_ASSET;

  const heightPx = Math.round(widthPx * (naturalHeight / naturalWidth));

  return (
    <div
      aria-hidden
      style={{
        width: widthPx,
        height: heightPx,
        marginBottom: gapBelowPx,
        transform: `translate(${offsetXPx}px, ${offsetYPx}px)`,
      }}
    >
      <Image
        src={src}
        alt=""
        width={naturalWidth}
        height={naturalHeight}
        priority
        unoptimized={useOriginalFile}
        quality={imageQuality}
        sizes={`${widthPx}px`}
        style={{
          width: widthPx,
          height: heightPx,
          display: "block",
        }}
      />
    </div>
  );
}
