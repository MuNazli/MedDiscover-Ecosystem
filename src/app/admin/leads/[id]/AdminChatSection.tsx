"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  senderType: string;
  body: string;
  createdAt: string;
}

interface Props {
  leadId: string;
  messages: Message[];
}

export default function AdminChatSection({ leadId, messages }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!body.trim()) {
      setError("Mesaj boş olamaz");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${leadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "CLINIC",
          body: body.trim(),
        }),
      });

      if (res.status === 201) {
        setBody("");
        setSuccess(true);
        router.refresh();
      } else {
        const data = await res.json();
        if (data.fieldErrors?.body) {
          setError(data.fieldErrors.body[0]);
        } else {
          setError(data.error || "Bir hata oluştu");
        }
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Messages List */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          minHeight: 150,
          maxHeight: 300,
          overflowY: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", marginTop: 50, fontSize: 14 }}>
            Henüz mesaj yok
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  backgroundColor:
                    msg.senderType === "PATIENT"
                      ? "#dbeafe"
                      : msg.senderType === "CLINIC"
                      ? "#dcfce7"
                      : "#fef3c7",
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                  <strong>
                    {msg.senderType === "PATIENT"
                      ? "Hasta"
                      : msg.senderType === "CLINIC"
                      ? "Klinik"
                      : "Admin"}
                  </strong>{" "}
                  • {new Date(msg.createdAt).toLocaleString("tr-TR")}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Form */}
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: 10,
              backgroundColor: "#fee2e2",
              border: "1px solid #dc2626",
              borderRadius: 4,
              marginBottom: 12,
              color: "#991b1b",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 10,
              backgroundColor: "#d1fae5",
              border: "1px solid #10b981",
              borderRadius: 4,
              marginBottom: 12,
              color: "#065f46",
              fontSize: 13,
            }}
          >
            ✓ Mesaj gönderildi
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 4 }}
          >
            Klinik adına mesaj gönder:
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Mesajınızı yazın..."
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: 14,
              minHeight: 60,
              resize: "vertical",
            }}
            maxLength={2000}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: loading ? "#9ca3af" : "#059669",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>

      <p style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
        Not: PII (telefon, e-posta, URL vb.) içeren mesajlar engellenecektir.
      </p>
    </div>
  );
}
