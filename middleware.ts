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

  // TEMP DEBUG: Extract locale if present
  const localeMatch = pathname.match(/^\/(de|tr|en)/);
  const detectedLocale = localeMatch ? localeMatch[1] : "none";

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
    
    // TEMP DEBUG: Add headers for redirects
    const response = NextResponse.redirect(url, 308);
    response.headers.set("x-md-mw", "hit");
    response.headers.set("x-md-path", pathname);
    response.headers.set("x-md-locale", detectedLocale);
    response.headers.set("x-md-redirect", `yes->${url.pathname}`);
    return response;
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    
    // TEMP DEBUG: Add headers for root redirect
    const response = NextResponse.redirect(url);
    response.headers.set("x-md-mw", "hit");
    response.headers.set("x-md-path", pathname);
    response.headers.set("x-md-locale", defaultLocale);
    response.headers.set("x-md-redirect", `yes->${url.pathname}`);
    return response;
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    
    // TEMP DEBUG: Add headers for en redirect
    const response = NextResponse.redirect(url);
    response.headers.set("x-md-mw", "hit");
    response.headers.set("x-md-path", pathname);
    response.headers.set("x-md-locale", "en");
    response.headers.set("x-md-redirect", `yes->${url.pathname}`);
    return response;
  }

  const invalidLocaleMatch = pathname.match(/^\/([a-zA-Z-]{2,})(?=\/|$)/);
  if (invalidLocaleMatch && !locales.includes(invalidLocaleMatch[1] as typeof locales[number]) && invalidLocaleMatch[1] !== "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    const response = NextResponse.redirect(url);
    response.headers.set("x-md-mw", "hit");
    response.headers.set("x-md-path", pathname);
    response.headers.set("x-md-locale", invalidLocaleMatch[1]);
    response.headers.set("x-md-redirect", `yes->${url.pathname}`);
    return response;
  }

  // TEMP DEBUG: Add headers for intl middleware handling
  const response = intlMiddleware(request);
  response.headers.set("x-md-mw", "hit");
  response.headers.set("x-md-path", pathname);
  response.headers.set("x-md-locale", detectedLocale);
  response.headers.set("x-md-redirect", "no");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|icon.png|icon.svg|apple-icon.png|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
