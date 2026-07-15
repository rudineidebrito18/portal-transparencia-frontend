import { NextRequest, NextResponse } from "next/server";

const NOME_COOKIE = "admin_token";

// Barra /admin/* por UX (não mostrar a casca do painel pra visitante
// aleatório) — a barreira de segurança real é o Spring Security no backend
// em cada request (ver STATUS.md, seção 7).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(NOME_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*"
};
