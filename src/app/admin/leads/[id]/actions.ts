"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { addLeadNote, updateLeadStatus } from "@/lib/cmsLeads";
import { LEAD_STATUSES } from "@/lib/leadStatus";
import { revalidatePath } from "next/cache";

const LeadStatus = z.enum(LEAD_STATUSES);

const UpdateLeadSchema = z.object({
  status: LeadStatus,
  notes: z.string().max(2000, "Notlar en fazla 2000 karakter olabilir").optional().nullable(),
});

export type UpdateLeadResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateLead(
  leadId: string,
  formData: FormData
): Promise<UpdateLeadResult> {
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  // Validate
  const result = UpdateLeadSchema.safeParse({
    status,
    notes: notes || null,
  });

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  // Check lead exists
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!existingLead) {
    return { success: false, error: "Lead bulunamadı" };
  }

  // Update
  if (existingLead.status !== result.data.status) {
    await updateLeadStatus(leadId, result.data.status);
  }

  if (result.data.notes?.trim()) {
    await addLeadNote(leadId, result.data.notes.trim());
  }

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");

  return { success: true };
}
