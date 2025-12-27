import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

// Enums for validation
const ContactPreference = z.enum(["WHATSAPP", "PHONE", "EMAIL"]);

// Zod schema for lead form validation
const LeadSchema = z.object({
  patientName: z
    .string()
    .min(2, "Hasta adı en az 2 karakter olmalı")
    .max(80, "Hasta adı en fazla 80 karakter olabilir"),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/, "Geçerli bir ülke kodu giriniz (örn: DE, TR)"),
  contactPreference: ContactPreference,
  requestedProcedure: z
    .string()
    .min(3, "İşlem açıklaması en az 3 karakter olmalı")
    .max(2000, "İşlem açıklaması en fazla 2000 karakter olabilir"),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: "GDPR onayı zorunludur" }),
  }),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.LEAD_SUBMISSION);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate with Zod
    const result = LeadSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      }

      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        patientName: result.data.patientName,
        country: result.data.country,
        contactPreference: result.data.contactPreference,
        requestedProcedure: result.data.requestedProcedure,
        gdprConsent: result.data.gdprConsent,
        status: "NEW",
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", fieldErrors: {} },
      { status: 500 }
    );
  }
}
