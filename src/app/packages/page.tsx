"use client";

import MedicalSearchModule from "@/components/packages/MedicalSearchModule";
import PackageCard from "@/components/packages/PackageCard";
import ResultsFilterPanel from "@/components/packages/ResultsFilterPanel";
import TopPackageSpotlight from "@/components/packages/TopPackageSpotlight";
import LeadOfferModal from "@/components/lead/LeadOfferModal";
import { PACKAGES } from "@/lib/packages/mockData";
import { FiltersState, MedicalPackage } from "@/lib/packages/types";
import { applyFilters, sortPackages } from "@/lib/packages/utils";
import { useMemo, useState } from "react";

export default function PackagesPage() {
  const [filters, setFilters] = useState<FiltersState>({
    priceMin: undefined,
    priceMax: undefined,
    treatments: new Set(),
    destinations: new Set(),
    verifications: new Set(),
    inclusions: new Set(),
    sort: "recommended",
    destinationQuery: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<{
    id: string;
    title: string;
    destination: string;
    treatmentCategory: string;
  } | null>(null);

  const spotlight = useMemo(() => PACKAGES.find((p) => p.spotlight) ?? PACKAGES[0], []);

  const filtered = useMemo(() => {
    const a = applyFilters(PACKAGES, filters);
    return sortPackages(a, filters.sort);
  }, [filters]);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-black/10">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="font-semibold">MedDiscover</div>
          <nav className="hidden gap-6 text-[13px] text-black/70 md:flex">
            <a href="#">Home</a>
            <a href="#">Treatments</a>
            <a href="#">Clinics</a>
            <a href="#">Flights</a>
            <a href="#">Packages</a>
            <a href="#">Contact</a>
          </nav>
          <div className="flex items-center gap-3 text-[13px] text-black/70">
            <span>EN/TR/DE</span>
            <span className="h-8 w-8 rounded-full border border-black/10" />
          </div>
        </div>
      </div>

      <section className="border-b border-black/10 bg-black/5 py-10">
        <div className="mx-auto max-w-[1200px] px-6">
          <h1 className="text-3xl font-semibold text-black">
            Find Your Medical Trip &amp; Flight Package
          </h1>
          <p className="mt-2 text-[14px] text-black/70">
            Compare curated packages and request a verified offer — fast.
          </p>

          <div className="mt-6">
            <MedicalSearchModule onSubmit={() => {}} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 rounded-xl border border-black/10 bg-white md:col-span-3">
            <ResultsFilterPanel filters={filters} onChange={setFilters} />
          </aside>

          <div className="col-span-12 md:col-span-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[13px] text-black/70">
                Showing <span className="font-semibold">{filtered.length}</span> packages
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map((p) => (
                <PackageCard
                  key={p.id}
                  p={p}
                  onRequestOffer={(pkg) => {
                    setSelectedPkg({
                      id: pkg.id,
                      title: pkg.title,
                      destination: pkg.destination,
                      treatmentCategory: pkg.treatmentCategory,
                    });
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>

          <aside className="col-span-12 md:col-span-3">
            <TopPackageSpotlight p={spotlight} />
          </aside>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold">Compare Packages</h2>
          <p className="mt-2 text-[13px] text-black/70">
            MVP: selection + real comparison comes in Phase-2. This section is reserved.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-black/10 bg-white p-4">
                <div className="h-[120px] rounded-lg bg-black/5" />
                <div className="mt-3 h-4 w-3/4 rounded bg-black/10" />
                <div className="mt-2 h-3 w-2/3 rounded bg-black/10" />
                <div className="mt-4 h-10 rounded-lg border border-black/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-black/10 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              ["Certified Clinics", "Worldwide accreditation"],
              ["Full Travel Arrangement", "Flights & Hotels"],
              ["German Support", "24/7 assistance"],
              ["Transparent Pricing", "Clear estimates"],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-black/5" />
                <div>
                  <div className="text-[14px] font-semibold">{t}</div>
                  <div className="text-[12px] text-black/70">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 py-10">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-6 md:grid-cols-4">
          <div>
            <div className="font-semibold">MedDiscover</div>
            <div className="mt-2 text-[12px] text-black/60">© {new Date().getFullYear()}</div>
          </div>
          <div className="text-[13px] text-black/70">
            <div className="font-semibold text-black">Treatments</div>
            <div className="mt-2 space-y-1">
              <div>Dental</div>
              <div>IVF</div>
              <div>Hair</div>
              <div>Ortho</div>
            </div>
          </div>
          <div className="text-[13px] text-black/70">
            <div className="font-semibold text-black">Destinations</div>
            <div className="mt-2 space-y-1">
              <div>Turkey</div>
              <div>Germany</div>
              <div>Mexico</div>
              <div>Thailand</div>
            </div>
          </div>
          <div className="text-[13px] text-black/70">
            <div className="font-semibold text-black">Company</div>
            <div className="mt-2 space-y-1">
              <div>About</div>
              <div>FAQ</div>
              <div>Terms</div>
              <div>Contact</div>
            </div>
          </div>
        </div>
      </footer>

      <LeadOfferModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedPackage={selectedPkg}
      />
    </main>
  );
}
