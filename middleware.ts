import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register');

  // Lista de rotas protegidas
  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
    '/connections',
    '/game',
    '/create-card',
    '/popular-cards',
    '/new-session',
  ];

  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Redirecionar usuários logados para longe das páginas de autenticação
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  // Redirecionar usuários não logados de rotas protegidas
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/connections/:path*',
    '/game/:path*',
    '/create-card',
    '/popular-cards',
    '/new-session',
    '/login',
    '/register',
  ],
};
