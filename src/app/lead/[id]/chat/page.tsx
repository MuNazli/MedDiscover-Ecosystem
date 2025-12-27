import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientChatForm from "./PatientChatForm";

interface PageProps {
  params: { id: string };
}

export default async function PatientChatPage({ params }: PageProps) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
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

  const messages = lead.conversation?.messages || [];

  return (
    <main style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Mesajlar</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
        Başvuru: {lead.patientName}
      </p>

      {/* Messages List */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          minHeight: 200,
          maxHeight: 400,
          overflowY: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", marginTop: 80 }}>
            Henüz mesaj yok
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor:
                    msg.senderType === "PATIENT" ? "#dbeafe" : "#fff",
                  border: "1px solid #e5e7eb",
                  alignSelf:
                    msg.senderType === "PATIENT" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    marginBottom: 4,
                  }}
                >
                  {msg.senderType === "PATIENT"
                    ? "Siz"
                    : msg.senderType === "CLINIC"
                    ? "Klinik"
                    : "Admin"}{" "}
                  • {new Date(msg.createdAt).toLocaleString("tr-TR")}
                </div>
                <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
                  {msg.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Form */}
      <PatientChatForm leadId={lead.id} />

      <div
        style={{
          marginTop: 24,
          padding: 12,
          backgroundColor: "#fef3c7",
          borderRadius: 4,
          fontSize: 13,
          color: "#92400e",
        }}
      >
        ⚠️ Güvenliğiniz için lütfen telefon numarası, e-posta adresi veya
        WhatsApp bilgisi paylaşmayın. Bu tür bilgiler otomatik olarak
        engellenecektir.
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: "#6b7280" }}>
        <a href="/" style={{ color: "#2563eb" }}>
          ← Ana Sayfaya Dön
        </a>
      </p>
    </main>
  );
}
