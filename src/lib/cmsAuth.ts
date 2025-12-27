import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "md_admin";

export function isAdminSession(): boolean {
  return Boolean(cookies().get(ADMIN_COOKIE_NAME)?.value);
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  const hasAdmin = Boolean(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
  if (!hasAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
