export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/connections/:path*',
    '/game/:path*',
    '/create-card',
    '/popular-cards',
    '/new-session',
    '/api/profile/:path*',
    '/api/connections/:path*',
    '/api/sessions/:path*',
    '/api/cards/:path*',
    '/api/user-cards/:path*',
  ],
};
