"use client";

import { useEffect, useState } from "react";
import { LeadStatus, LEAD_STATUSES } from "@/lib/leadStatus";

export type { LeadStatus };

export type LeadNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  packageTitle: string;
  destination: string;
  treatmentCategory: string;
  locale: string;
  status: LeadStatus;
  notes: LeadNote[];
};

type Props = {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onAddNote: (id: string, text: string) => void;
  onDeleteNote: (id: string, noteId: string) => void;
  updatingStatus: boolean;
  updateError: string | null;
};

export default function LeadDetailModal({
  open,
  lead,
  onClose,
  onUpdateStatus,
  onAddNote,
  onDeleteNote,
  updatingStatus,
  updateError,
}: Props) {
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const NOTE_MAX_LENGTH = 1000;

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setNoteText("");
      setNoteError(null);
    }
  }, [open, lead?.id]);

  if (!open || !lead) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[720px] rounded-xl border border-black/10 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border border-black/10 bg-white px-2 py-1 text-[12px] font-semibold text-black hover:bg-black/5"
        >
          Close
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-black">Lead Details</h2>
          <p className="text-[13px] text-black/60">
            Submitted {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-black/10 p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">Contact</div>
            <div className="mt-2 space-y-2 text-[14px] text-black">
              <div className="font-semibold">{lead.fullName}</div>
              <div>{lead.email}</div>
              <div>{lead.phone || "No phone provided"}</div>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">Package</div>
            <div className="mt-2 space-y-2 text-[14px] text-black">
              <div className="font-semibold">{lead.packageTitle}</div>
              <div>{lead.destination}</div>
              <div>{lead.treatmentCategory}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-black/10 p-4 text-[14px] text-black">
          <div className="text-[12px] uppercase tracking-wide text-black/50">Message</div>
          <div className="mt-2 whitespace-pre-line text-[14px] text-black/80">
            {lead.message || "No message provided."}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-black/10 p-4 text-[14px] text-black">
            <div className="text-[12px] uppercase tracking-wide text-black/50">Locale</div>
            <div className="mt-2">{lead.locale}</div>
          </div>

          <div className="rounded-lg border border-black/10 p-4 text-[14px] text-black">
            <div className="text-[12px] uppercase tracking-wide text-black/50">Status</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {LEAD_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateStatus(lead.id, status)}
                  disabled={updatingStatus || lead.status === status}
                  className={`rounded-lg border px-3 py-1 text-[12px] font-semibold ${
                    lead.status === status
                      ? "border-black bg-black text-white"
                      : "border-black/20 text-black hover:bg-black/5"
                  } ${updatingStatus ? "opacity-50" : ""}`}
                >
                  {status}
                </button>
              ))}
            </div>
            {updateError && <div className="mt-2 text-[12px] text-red-600">{updateError}</div>}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-black/10 p-4">
          <div className="flex flex-col gap-1">
            <div className="text-[12px] uppercase tracking-wide text-black/50">
              Notes / Internal Comments
            </div>
            <div className="text-[12px] text-black/60">
              Internal only. Lütfen telefon/e-posta gibi PII yazmayın.
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <textarea
              value={noteText}
              onChange={(event) => {
                setNoteText(event.target.value);
                if (noteError) setNoteError(null);
              }}
              maxLength={NOTE_MAX_LENGTH}
              rows={3}
              placeholder="Add an internal note..."
              className="w-full rounded-lg border border-black/20 p-3 text-[13px] text-black focus:border-black focus:outline-none"
            />
            <div className="flex items-center justify-between text-[12px] text-black/50">
              <span>{noteText.trim().length}/{NOTE_MAX_LENGTH}</span>
              <button
                type="button"
                onClick={() => {
                  const trimmed = noteText.trim();
                  if (!trimmed) {
                    setNoteError("Note cannot be empty.");
                    return;
                  }
                  if (trimmed.length > NOTE_MAX_LENGTH) {
                    setNoteError("Note is too long.");
                    return;
                  }
                  onAddNote(lead.id, trimmed);
                  setNoteText("");
                }}
                className="rounded-lg border border-black/20 px-3 py-1 text-[12px] font-semibold text-black hover:bg-black/5"
              >
                Add note
              </button>
            </div>
            {noteError && <div className="text-[12px] text-red-600">{noteError}</div>}
          </div>

          <div className="mt-4 space-y-3">
            {lead.notes.length === 0 && (
              <div className="rounded-lg border border-black/10 bg-black/5 p-3 text-[12px] text-black/60">
                No notes yet.
              </div>
            )}
            {lead.notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-black/10 p-3">
                <div className="flex items-center justify-between text-[12px] text-black/50">
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(lead.id, note.id)}
                    className="text-[12px] font-semibold text-black hover:text-black/70"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-line text-[13px] text-black/80">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
