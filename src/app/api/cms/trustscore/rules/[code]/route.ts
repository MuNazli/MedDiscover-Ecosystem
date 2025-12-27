import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/cmsAuth";

const UpdateSchema = z.object({
  delta: z.number().int().min(-100).max(100).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.trustRule.update({
    where: { code: params.code },
    data: {
      ...(parsed.data.delta !== undefined ? { delta: parsed.data.delta } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
    },
    select: {
      code: true,
      delta: true,
      isActive: true,
      titleKey: true,
      descriptionKey: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ rule: updated }, { status: 200 });
}
