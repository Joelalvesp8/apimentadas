'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut, Store, Package, ShoppingBag, Compass } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: profile } = useProfile();

  // Redirect to login only on client-side
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state during auth check
  if (status === 'loading') {
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
      <header className="sticky top-0 z-50 bg-zinc-900/95 border-b-2 border-red-700/30 backdrop-blur-md shadow-[0_4px_20px_rgba(220,38,38,0.15)]">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2 group">
            <span className="text-2xl sm:text-3xl drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all group-hover:drop-shadow-[0_0_25px_rgba(220,38,38,1)]">🌶️</span>
            <span className="text-lg sm:text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
              APIMENTADAS
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-gray-300 hover:text-white hover:bg-red-900/30 transition-colors">
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-gray-300 hover:text-white hover:bg-red-900/30 transition-colors">
                <Store className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Pimentinhas</span>
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-gray-300 hover:text-white hover:bg-red-900/30 transition-colors">
                <Package className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Pedidos</span>
              </Button>
            </Link>
            {profile?.isVendor && (
              <Link href="/seller">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-gray-300 hover:text-white hover:bg-red-900/30 transition-colors">
                  <ShoppingBag className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Vendas</span>
                </Button>
              </Link>
            )}
            <Link href="/connections">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-gray-300 hover:text-white hover:bg-red-900/30 transition-colors">
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Conexões</span>
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-gray-300 hover:text-white hover:bg-red-900/30 transition-colors">
                <Compass className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Explorar</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-2 sm:px-3 text-gray-300 hover:text-red-400 hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 overflow-y-auto">{children}</main>
    </div>
  );
}
