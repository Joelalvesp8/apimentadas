import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register');
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isOnboardingPage = req.nextUrl.pathname === '/onboarding';

  // Check if user is admin
  const isAdmin = isAdminEmail(req.auth?.user?.email);

  // Lista de rotas protegidas (somente para usuários comuns, não admin)
  const protectedRoutes = [
    '/dashboard',
    '/explore',
    '/connections',
    '/game',
    '/create-card',
    '/popular-cards',
    '/new-session',
    '/profile',
  ];

  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Admin routes protection
  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
    if (!isAdmin) {
      // Non-admin trying to access admin panel, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
    // Admin can access admin panel
    return NextResponse.next();
  }

  // Admin trying to access regular user routes - redirect to admin panel
  if (isLoggedIn && isAdmin && isProtectedRoute) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl));
  }

  // Redirecionar usuários logados para longe das páginas de autenticação
  if (isAuthPage && isLoggedIn) {
    // Redirect based on user type
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.nextUrl));
    }
    // Regular users go to explore (profile check will happen client-side)
    return NextResponse.redirect(new URL('/explore', req.nextUrl));
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
    '/explore/:path*',
    '/onboarding',
    '/connections/:path*',
    '/game/:path*',
    '/create-card',
    '/popular-cards',
    '/new-session',
    '/admin/:path*',
    '/login',
    '/register',
    '/profile/:path*',
  ],
};
