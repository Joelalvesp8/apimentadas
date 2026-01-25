'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Users, FileText, ShoppingCart, LayoutDashboard, LogOut, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
    description: 'Lista de espera, usuários ativos, estatísticas',
  },
  {
    title: 'Cartas',
    href: '/admin/cartas',
    icon: FileText,
    description: 'Gerenciar, aprovar, editar cartas',
  },
  {
    title: 'Importar',
    href: '/admin/importar',
    icon: Upload,
    description: 'Importar cartas em massa via CSV/Excel',
  },
  {
    title: 'Vendas',
    href: '/admin/vendas',
    icon: ShoppingCart,
    description: 'Produtos e pedidos',
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🌶️</div>
            <div>
              <h1 className="text-xl font-bold text-white">Apimentadas</h1>
              <p className="text-xs text-red-400">Painel Administrativo</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all',
                    isActive
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                      : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-gray-300 hover:text-white hover:bg-zinc-800"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}
