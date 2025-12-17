'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut, Store, Package } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl">🌶️</span>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              APIMENTADAS
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <Store className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Marketplace</span>
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <Package className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Pedidos</span>
              </Button>
            </Link>
            <Link href="/connections">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Conexões</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="overflow-y-auto">{children}</main>
    </div>
  );
}
