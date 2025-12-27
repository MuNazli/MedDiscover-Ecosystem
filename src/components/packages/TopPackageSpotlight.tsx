// src/components/packages/TopPackageSpotlight.tsx
import { MedicalPackage } from "@/lib/packages/types";
import { eur, verificationLabel } from "@/lib/packages/utils";

type Props = { p: MedicalPackage };

export default function TopPackageSpotlight({ p }: Props) {
  return (
    <div className="sticky top-6 rounded-xl border border-black/10 bg-white">
      <div className="px-5 pt-5">
        <div className="text-[16px] font-semibold">Top Package Spotlight</div>
        <div className="mt-1 text-[12px] font-light uppercase tracking-wide text-black/60">
          MedDiscover Choice
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[100px] w-[100px] rounded-lg bg-black/5" />
          ))}
        </div>

        <div className="mt-4 text-[18px] font-semibold">{p.title.replace("Package –", "–")}</div>
        <div className="mt-1 text-[13px] text-black/70">
          Verified Clinic · {p.destination}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            p.satisfactionPct ? `${p.satisfactionPct}% Patient Sat.` : null,
            ...p.verifications.slice(0, 2).map(verificationLabel),
            p.hotelStars ? `${p.hotelStars}-Star Hotel` : null,
          ]
            .filter(Boolean)
            .slice(0, 3)
            .map((t) => (
              <span
                key={t as string}
                className="rounded border border-black/10 px-2 py-1 text-[11px] text-black/70"
              >
                {t as string}
              </span>
            ))}
        </div>

        <ul className="mt-4 space-y-2 text-[13px] text-black/80">
          {[
            "Treatment included",
            "Hotel included",
            "Private transfers",
            "German support",
            "Aftercare plan",
          ].slice(0, 5).map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 rounded-full bg-black/50" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-black/10 bg-black/5 px-5 py-5">
        <div className="text-[12px] text-black/60">Starting from</div>
        <div className="mt-1 text-[26px] font-extrabold text-black">{eur(p.priceFromEur)}</div>
        <div className="mt-1 text-[11px] text-black/60">Estimated · Final quote after review</div>

        <div className="mt-4 flex flex-col gap-3">
          <button className="h-11 rounded-lg border border-black bg-black text-[14px] font-semibold text-white">
            View Package
          </button>
          <button className="h-11 rounded-lg border border-black/20 bg-white text-[14px] font-semibold text-black">
            Request Offer
          </button>
        </div>
      </div>
    </div>
  );
}
