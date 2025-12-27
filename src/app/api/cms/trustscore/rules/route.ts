import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/cmsAuth";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const rules = await prisma.trustRule.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      code: true,
      delta: true,
      isActive: true,
      titleKey: true,
      descriptionKey: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ rules }, { status: 200 });
}
