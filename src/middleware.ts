import { NextRequest, NextResponse } from "next/server";

const locales = ["de", "en", "tr"] as const;
const defaultLocale = "de";

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

  const localeCmsMatch = pathname.match(/^\/(de|en|tr)\/(cms|admin)(?=\/|$)/);
  if (localeCmsMatch) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(de|en|tr)\//, "/");
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  const localeMatch = pathname.match(/^\/(de|en|tr)(?=\/|$)/);
  const hasLocale = Boolean(localeMatch);

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  let pathWithoutLocale = pathname.replace(/^\/(de|en|tr)(?=\/|$)/, "");
  if (pathWithoutLocale === "") {
    pathWithoutLocale = "/";
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|icon.png|icon.svg|apple-icon.png|robots.txt|sitemap.xml).*)",
  ],
};
