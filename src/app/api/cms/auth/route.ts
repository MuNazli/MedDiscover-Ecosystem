import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // Rate limiting - stricter for auth attempts
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.ADMIN_AUTH);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { key } = await request.json();
    const expectedKey = process.env.ADMIN_PASSPHRASE;

    if (!expectedKey) {
      return NextResponse.json(
        { error: "Admin key not configured" },
        { status: 500 }
      );
    }

    if (key !== expectedKey) {
      return NextResponse.json(
        { error: "Invalid admin key" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("md_admin", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("md_admin");
  return response;
}


