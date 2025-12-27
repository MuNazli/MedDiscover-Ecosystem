"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  leadId: string;
}

export default function PatientChatForm({ leadId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
          senderType: "PATIENT",
          body: body.trim(),
        }),
      });

      if (res.status === 201) {
        setBody("");
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
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            padding: 12,
            backgroundColor: "#fee2e2",
            border: "1px solid #dc2626",
            borderRadius: 4,
            marginBottom: 12,
            color: "#991b1b",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Mesajınızı yazın..."
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #ccc",
          borderRadius: 4,
          fontSize: 14,
          minHeight: 80,
          resize: "vertical",
          marginBottom: 12,
        }}
        maxLength={2000}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#9ca3af" : "#2563eb",
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
  );
}
