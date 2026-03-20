'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut, Store, Compass, User, Newspaper, Menu } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Toaster } from '@/components/ui/toaster';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { cn } from '@/lib/utils';

const bottomNavItems = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/explore', icon: Compass, label: 'Explorar' },
  { href: '/posts', icon: Newspaper, label: 'Posts' },
  { href: '/connections', icon: Users, label: 'Conexões' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Redirect to login only on client-side
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Check if user has completed profile (has nickname)
  useEffect(() => {
    // Only check after both session and profile are loaded
    if (status === 'authenticated' && !profileLoading) {
      const isOnboardingPage = window.location.pathname === '/onboarding';

      // If no profile or no nickname, redirect to onboarding
      if (!isOnboardingPage && (!profile || !profile.nickname)) {
        router.push('/onboarding');
      }
    }
  }, [status, profile, profileLoading, router]);

  // Show loading state during auth check or profile check
  if (status === 'loading' || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Film grain texture */}
      <div
        className="fixed inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Red ambient glow */}
      <div className="fixed top-20 right-1/4 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 border-b border-red-700/30 backdrop-blur-md shadow-[0_4px_20px_rgba(220,38,38,0.15)]">
        <div className="px-3 sm:px-4 flex items-center justify-between gap-2 h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <span className="text-2xl drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">🌶️</span>
            <span className="text-sm font-bold text-white tracking-wide drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
              APIMENTADAS
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="px-3 text-gray-300 hover:text-white hover:bg-red-900/30">
                <Home className="h-4 w-4 mr-2" />Dashboard
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="px-3 text-gray-300 hover:text-white hover:bg-red-900/30">
                <Store className="h-4 w-4 mr-2" />Pimentinhas
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="px-3 text-gray-300 hover:text-white hover:bg-red-900/30">
                <Compass className="h-4 w-4 mr-2" />Explorar
              </Button>
            </Link>
            <Link href="/connections">
              <Button variant="ghost" size="sm" className="px-3 text-gray-300 hover:text-white hover:bg-red-900/30">
                <Users className="h-4 w-4 mr-2" />Conexões
              </Button>
            </Link>
            <Link href="/posts">
              <Button variant="ghost" size="sm" className="px-3 text-gray-300 hover:text-white hover:bg-red-900/30">
                <Newspaper className="h-4 w-4 mr-2" />Posts
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="px-3 text-gray-300 hover:text-white hover:bg-red-900/30">
                <User className="h-4 w-4 mr-2" />Perfil
              </Button>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-2 text-gray-300 hover:text-red-400 hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 overflow-x-hidden overflow-y-auto pb-20 md:pb-0">{children}</main>

      {/* Bottom Navigation — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900/95 border-t border-red-700/30 backdrop-blur-md">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                  isActive ? 'text-red-400' : 'text-gray-400 hover:text-gray-200'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(220,38,38,0.8)]')} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
