import { NextRequest, NextResponse } from "next/server";
import { isLeadStatus, LeadStatus } from "@/lib/leadStatus";

type LeadNote = {
  id: string;
  text: string;
  createdAt: string;
};

type Lead = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  packageId: string;
  packageTitle: string;
  destination: string;
  treatmentCategory: string;
  locale: string;
  status: LeadStatus;
  notes: LeadNote[];
};

const leadsStore: Lead[] = [];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTE_MAX_LENGTH = 1000;


export async function GET() {
  return NextResponse.json({ leads: leadsStore }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      packageId,
      packageTitle,
      destination,
      treatmentCategory,
      fullName,
      email,
      phone,
      message,
      consentPrivacy,
      consentContact,
      locale,
    } = body ?? {};

    if (!packageId || !packageTitle || !fullName || !email || !destination || !treatmentCategory || !locale) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (consentPrivacy !== true || consentContact !== true) {
      return NextResponse.json({ error: "Both consents are required" }, { status: 400 });
    }

    const lead: Lead = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      fullName: String(fullName),
      email: String(email),
      phone: phone ? String(phone) : null,
      message: message ? String(message) : null,
      packageId: String(packageId),
      packageTitle: String(packageTitle),
      destination: String(destination),
      treatmentCategory: String(treatmentCategory),
      locale: String(locale),
      status: "NEW",
      notes: [],
    };

    leadsStore.unshift(lead);

    return NextResponse.json({ ok: true, id: lead.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, noteText, deleteNoteId } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const lead = leadsStore.find((item) => item.id === id);
    if (!lead) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (status) {
      if (!isLeadStatus(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      lead.status = status;
    }

    if (typeof noteText === "string") {
      const trimmed = noteText.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
      }
      if (trimmed.length > NOTE_MAX_LENGTH) {
        return NextResponse.json({ error: "Note too long" }, { status: 400 });
      }
      lead.notes.unshift({
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
        text: trimmed,
        createdAt: new Date().toISOString(),
      });
    }

    if (deleteNoteId) {
      const idx = lead.notes.findIndex((note) => note.id === deleteNoteId);
      if (idx === -1) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      lead.notes.splice(idx, 1);
    }

    return NextResponse.json({ ok: true, lead }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
