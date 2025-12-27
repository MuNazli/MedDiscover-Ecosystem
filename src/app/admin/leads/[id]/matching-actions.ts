"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const UpdateMatchingSchema = z.object({
  clinicId: z.string().optional().nullable(),
  treatmentId: z.string().optional().nullable(),
});

export type UpdateMatchingResult = {
  success: boolean;
  error?: string;
};

export async function updateLeadMatching(
  leadId: string,
  formData: FormData
): Promise<UpdateMatchingResult> {
  const clinicIdRaw = formData.get("clinicId") as string;
  const treatmentIdRaw = formData.get("treatmentId") as string;

  // Convert empty strings to null
  const clinicId = clinicIdRaw && clinicIdRaw !== "" ? clinicIdRaw : null;
  const treatmentId = treatmentIdRaw && treatmentIdRaw !== "" ? treatmentIdRaw : null;

  // Validate
  const result = UpdateMatchingSchema.safeParse({ clinicId, treatmentId });

  if (!result.success) {
    return { success: false, error: "Geçersiz veri" };
  }

  // Check lead exists
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!existingLead) {
    return { success: false, error: "Lead bulunamadı" };
  }

  // Validate clinic if provided
  if (clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });
    if (!clinic) {
      return { success: false, error: "Klinik bulunamadı" };
    }
    if (!clinic.isActive) {
      return { success: false, error: "Bu klinik artık aktif değil" };
    }
  }

  // Validate treatment if provided
  if (treatmentId) {
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
    });
    if (!treatment) {
      return { success: false, error: "Tedavi bulunamadı" };
    }
    if (!treatment.isActive) {
      return { success: false, error: "Bu tedavi artık aktif değil" };
    }
  }

  // Update lead
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      clinicId,
      treatmentId,
    },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");

  return { success: true };
}
