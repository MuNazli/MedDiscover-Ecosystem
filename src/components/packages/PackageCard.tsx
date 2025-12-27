// src/components/packages/PackageCard.tsx
"use client";

import { MedicalPackage } from "@/lib/packages/types";
import { eur, verificationLabel } from "@/lib/packages/utils";

type Props = {
  p: MedicalPackage;
  onRequestOffer?: (p: MedicalPackage) => void;
};

export default function PackageCard({ p, onRequestOffer }: Props) {
  return (
    <div className="relative pointer-events-auto flex w-full overflow-hidden rounded-xl border border-black/10 bg-white">
      {/* LEFT */}
      <div className="pointer-events-none w-[35%] min-w-[252px] bg-black/5">
        <div className="h-[200px] w-full" aria-label={p.images[0]?.alt ?? "Image"} />
      </div>

      {/* MIDDLE */}
      <div className="w-[40%] px-6 py-5">
        <div className="text-[18px] font-semibold text-black">{p.title}</div>
        <div className="mt-1 text-[14px] text-black/70">
          {p.clinicName} | {p.destination}
        </div>

        <ul className="mt-3 space-y-1 text-[13px] leading-5 text-black/80">
          {p.bullets.slice(0, 3).map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 rounded-full bg-black/50" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-black/60">
          {p.verifications.map(verificationLabel).join(" · ")}
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-10 pointer-events-auto w-[25%] px-6 py-5 text-right">
        <div className="text-[12px] text-black/60">Starting from</div>
        <div className="mt-1 text-[24px] font-extrabold text-black">{eur(p.priceFromEur)}</div>
        <div className="mt-1 text-[11px] text-black/60">Estimated · Final quote after review</div>

        <div className="mt-5 flex flex-col items-end gap-2">
          <button className="h-9 w-full max-w-[180px] rounded-lg border border-black bg-black text-[13px] font-semibold text-white">
            View Package
          </button>
          <button
            type="button"
            onClick={() => {
              onRequestOffer?.(p);
            }}
            className="h-9 w-full max-w-[180px] cursor-pointer rounded-lg border border-black/20 bg-transparent text-[13px] font-semibold text-black hover:bg-black/5 hover:opacity-90"
            style={{ pointerEvents: "auto", zIndex: 20 }}
          >
            Request Offer
          </button>
        </div>
      </div>
    </div>
  );
}
