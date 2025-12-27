import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeLeadStatus } from "@/lib/leadStatus";
import LeadUpdateForm from "./LeadUpdateForm";
import LeadMatchingForm from "./LeadMatchingForm";
import AdminChatSection from "./AdminChatSection";

interface PageProps {
  params: { id: string };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      clinic: true,
      treatment: true,
      conversation: {
        include: {
          messages: {
            where: { blocked: false },
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  // Fetch active clinics and treatments for dropdowns
  const [clinics, treatments] = await Promise.all([
    prisma.clinic.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, country: true },
    }),
    prisma.treatment.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Prepare messages for client component
  const messages = (lead.conversation?.messages || []).map((msg) => ({
    id: msg.id,
    senderType: msg.senderType,
    body: msg.body,
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <main style={{ padding: 32, maxWidth: 600 }}>
      <h1 style={{ marginBottom: 24 }}>Lead Detay</h1>

      <div style={{ marginBottom: 24 }}>
        <table style={{ fontSize: 14 }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 500, color: "#6b7280" }}>
                Tarih:
              </td>
              <td style={{ padding: "8px 0" }}>
                {lead.createdAt.toLocaleString("tr-TR")}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 500, color: "#6b7280" }}>
                Hasta Adı:
              </td>
              <td style={{ padding: "8px 0" }}>{lead.patientName}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 500, color: "#6b7280" }}>
                Ülke:
              </td>
              <td style={{ padding: "8px 0" }}>{lead.country}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 500, color: "#6b7280" }}>
                İletişim Tercihi:
              </td>
              <td style={{ padding: "8px 0" }}>{lead.contactPreference}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 500, color: "#6b7280", verticalAlign: "top" }}>
                Talep Edilen İşlem:
              </td>
              <td style={{ padding: "8px 0", whiteSpace: "pre-wrap" }}>
                {lead.requestedProcedure}
              </td>
            </tr>
            {lead.clinic && (
              <tr>
                <td style={{ padding: "8px 16px 8px 0", fontWeight: 500, color: "#6b7280" }}>
                  Eşleşen Klinik:
                </td>
                <td style={{ padding: "8px 0", color: "#059669" }}>
                  {lead.clinic.name} ({lead.clinic.country})
                </td>
              </tr>
            )}
            {lead.treatment && (
              <tr>
                <td style={{ padding: "8px 16px 8px 0", fontWeight: 500, color: "#6b7280" }}>
                  Eşleşen Tedavi:
                </td>
                <td style={{ padding: "8px 0", color: "#059669" }}>
                  {lead.treatment.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

      <h2 style={{ marginBottom: 16, fontSize: 18 }}>Durum Güncelle</h2>
      <LeadUpdateForm
        leadId={lead.id}
        currentStatus={normalizeLeadStatus(lead.status)}
        currentNotes=""
      />

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

      <h2 style={{ marginBottom: 16, fontSize: 18 }}>Klinik / Tedavi Eşleştirme</h2>
      <LeadMatchingForm
        leadId={lead.id}
        clinics={clinics}
        treatments={treatments}
        currentClinicId={lead.clinicId}
        currentTreatmentId={lead.treatmentId}
      />

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

      <h2 style={{ marginBottom: 16, fontSize: 18 }}>Mesajlar</h2>
      <AdminChatSection leadId={lead.id} messages={messages} />

      <p style={{ marginTop: 32, fontSize: 13, color: "#6b7280" }}>
        <a href="/admin/leads" style={{ color: "#2563eb" }}>
          ← Lead Listesine Dön
        </a>
      </p>
    </main>
  );
}
