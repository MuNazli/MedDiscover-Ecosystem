import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { logSecurityEvent, logError } from "@/lib/securityLogger";

const LoginSchema = z.object({
  key: z.string().min(1),
});

const LoginResponseSchema = z.object({
  ok: z.boolean(),
});

const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export async function POST(request: NextRequest) {
  // Rate limiting - stricter for auth attempts
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.ADMIN_AUTH);
  if (rateLimitResponse) {
    logSecurityEvent("AUTH_RATE_LIMITED");
    return rateLimitResponse;
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);
    
    if (!parsed.success) {
      logSecurityEvent("AUTH_INVALID_INPUT");
      return NextResponse.json(
        ErrorResponseSchema.parse({ code: "INVALID_REQUEST", message: "Invalid request format" }),
        { status: 400 }
      );
    }

    const { key } = parsed.data;
    const expectedKey = process.env.ADMIN_PASSPHRASE;

    if (!expectedKey) {
      return NextResponse.json(
        ErrorResponseSchema.parse({ code: "CONFIG_ERROR", message: "Admin key not configured" }),
        { status: 500 }
      );
    }

    if (key !== expectedKey) {
      logSecurityEvent("AUTH_FAILED");
      return NextResponse.json(
        ErrorResponseSchema.parse({ code: "UNAUTHORIZED", message: "Invalid admin key" }),
        { status: 401 }
      );
    }

    logSecurityEvent("AUTH_SUCCESS");
    const response = NextResponse.json(LoginResponseSchema.parse({ ok: true }));
    response.cookies.set("md_admin", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    logError("AUTH_ERROR", error);
    return NextResponse.json(
      ErrorResponseSchema.parse({ code: "AUTH_ERROR", message: "Authentication failed" }),
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("md_admin");
  return response;
}


