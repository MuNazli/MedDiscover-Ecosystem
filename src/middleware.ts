import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const locales = ["de", "tr"] as const;
const defaultLocale = "de";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/cms") || pathname.startsWith("/admin")) {
    if (pathname.startsWith("/cms/login")) {
      return NextResponse.next();
    }

    const adminCookie = request.cookies.get("md_admin");
    if (adminCookie?.value) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/cms/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const localeCmsMatch = pathname.match(/^\/(de|tr)\/(cms|admin)(?=\/|$)/);
  if (localeCmsMatch) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(de|tr)\//, "/");
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|icon.png|icon.svg|apple-icon.png|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
