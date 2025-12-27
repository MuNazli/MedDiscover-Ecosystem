import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/cmsAuth";
import { addLeadNote, getLeadDetail } from "@/lib/cmsLeads";
import { prisma } from "@/lib/prisma";

const NoteSchema = z.object({
  content: z.string().min(2).max(2000),
});

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const body = await request.json().catch(() => null);
  const parsed = NoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }

  const existing = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await addLeadNote(params.id, parsed.data.content.trim());
  const lead = await getLeadDetail(params.id);
  return NextResponse.json({ lead }, { status: 200 });
}
