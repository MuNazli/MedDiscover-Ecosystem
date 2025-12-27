import { headers } from "next/headers";
import { computeLeadStats, LeadSummary } from "@/lib/admin/leadStats";
import { LEAD_STATUSES } from "@/lib/leadStatus";

async function getLeads(): Promise<LeadSummary[]> {
  const headerList = headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const response = await fetch(`${proto}://${host}/api/leads`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return Array.isArray(data.leads) ? data.leads : [];
}

export default async function AdminDashboardPage() {
  const leads = await getLeads();
  const stats = computeLeadStats(leads);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-black/10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Admin Dashboard</h1>
            <p className="text-[13px] text-black/60">Leads overview</p>
          </div>
          <a
            href="/admin/leads"
            className="inline-flex h-10 items-center rounded-lg border border-black/20 px-4 text-[13px] font-semibold text-black hover:bg-black/5"
          >
            Go to Leads
          </a>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-8">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">Total Leads</div>
            <div className="mt-2 text-3xl font-semibold text-black">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">NEW</div>
            <div className="mt-2 text-3xl font-semibold text-black">{stats.statusCounts.NEW}</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">IN_REVIEW</div>
            <div className="mt-2 text-3xl font-semibold text-black">
              {stats.statusCounts.IN_REVIEW}
            </div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">OFFER_SENT</div>
            <div className="mt-2 text-3xl font-semibold text-black">{stats.statusCounts.OFFER_SENT}</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">CLOSED</div>
            <div className="mt-2 text-3xl font-semibold text-black">{stats.statusCounts.CLOSED}</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
          <div className="text-[12px] uppercase tracking-wide text-black/50">Status breakdown</div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {LEAD_STATUSES.map((status) => (
              <div key={status} className="rounded-lg border border-black/10 p-3">
                <div className="text-[12px] font-semibold text-black">{status}</div>
                <div className="mt-1 text-[13px] text-black/70">
                  {stats.statusCounts[status]} leads • {stats.statusPercentages[status]}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_2fr]">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">Last 7 days</div>
            <div className="mt-3 text-3xl font-semibold text-black">{stats.last7DaysCount}</div>
            <div className="mt-1 text-[12px] text-black/60">Leads created in the last 7 days</div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">Recent Leads</div>
            {stats.recentLeads.length === 0 ? (
              <div className="mt-3 text-[13px] text-black/60">No leads yet</div>
            ) : (
              <div className="mt-3 space-y-2">
                {stats.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-[13px] text-black"
                  >
                    <div className="text-[12px] text-black/60">
                      {new Date(lead.createdAt).toLocaleString()}
                    </div>
                    <div className="text-[12px] font-semibold">{lead.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {stats.total === 0 && (
          <div className="mt-6 rounded-xl border border-black/10 bg-white p-4 text-[13px] text-black/60">
            No leads yet. Once leads arrive, stats will appear here.
          </div>
        )}
      </section>
    </main>
  );
}
