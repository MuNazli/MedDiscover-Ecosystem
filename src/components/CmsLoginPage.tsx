"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CmsLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/cms/settings";

  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/cms/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid admin key");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0A3F62 0%, #0FA3B1 100%)",
      padding: 32,
    }}>
      <div style={{
        width: 400,
        background: "rgba(255,255,255,0.95)",
        borderRadius: 16,
        padding: 40,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, #2EC4B6, #0FA3B1)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16,
          }}>
            M
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#0A2540",
            marginBottom: 8,
          }}>
            MedDiscover CMS
          </h1>
          <p style={{
            fontSize: 14,
            color: "#64748b",
          }}>
            Enter your admin key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#dc2626",
              fontSize: 14,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              marginBottom: 8,
            }}>
              Admin Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                outline: "none",
                transition: "border-color 150ms",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2EC4B6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              fontSize: 16,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #2EC4B6, #0FA3B1)",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{
          marginTop: 24,
          fontSize: 12,
          color: "#9ca3af",
          textAlign: "center",
        }}>
          MVP Admin Panel ƒ?½ Protected Access
        </p>
      </div>
    </div>
  );
}
