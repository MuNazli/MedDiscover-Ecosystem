import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { detectPII, sanitizeText } from "@/lib/pii";

const SenderType = z.enum(["PATIENT", "CLINIC", "ADMIN"]);

const SendMessageSchema = z.object({
  senderType: SenderType,
  body: z
    .string()
    .min(1, "Mesaj boş olamaz")
    .max(2000, "Mesaj en fazla 2000 karakter olabilir"),
});

interface RouteParams {
  params: { leadId: string };
}

// GET - List messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { leadId } = params;

  // Check lead exists
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      conversation: {
        include: {
          messages: {
            where: { blocked: false },
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead bulunamadı" }, { status: 404 });
  }

  const messages = lead.conversation?.messages || [];

  return NextResponse.json({ messages });
}

// POST - Send message
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { leadId } = params;

  try {
    const body = await request.json();

    // Validate
    const result = SendMessageSchema.safeParse(body);

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

    // Check lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { conversation: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead bulunamadı" }, { status: 404 });
    }

    // PII Detection - BLOCK if detected
    const piiCheck = detectPII(result.data.body);
    if (piiCheck.hasPII) {
      return NextResponse.json(
        {
          error: "PII detected",
          fieldErrors: {
            body: [
              `İletişim bilgisi paylaşmak yasaktır. ${piiCheck.reason || ""}`.trim(),
            ],
          },
        },
        { status: 400 }
      );
    }

    // Sanitize text
    const sanitizedBody = sanitizeText(result.data.body);

    // Get or create conversation
    let conversation = lead.conversation;
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { leadId },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: result.data.senderType,
        body: sanitizedBody,
        blocked: false,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      { ok: true, messageId: message.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Internal server error", fieldErrors: {} },
      { status: 500 }
    );
  }
}
