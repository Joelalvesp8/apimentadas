'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileText,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Upload,
  Gamepad2,
  Menu,
  X,
  Flame,
} from 'lucide-react';
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
  },
  {
    title: 'Sessões',
    href: '/admin/sessoes',
    icon: Gamepad2,
  },
  {
    title: 'Cartas',
    href: '/admin/cartas',
    icon: FileText,
  },
  {
    title: 'Importar',
    href: '/admin/importar',
    icon: Upload,
  },
  {
    title: 'Vendas',
    href: '/admin/vendas',
    icon: ShoppingCart,
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-red-500" aria-hidden="true" />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Apimentadas</h1>
              <p className="text-xs text-red-400 leading-tight">Admin</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all text-sm',
                    isActive
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                      : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-300 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sair
            </Button>
          </div>

          {/* Mobile: Hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <div className="container mx-auto px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg transition-all',
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}

            <div className="pt-1 pb-2 border-t border-zinc-800 mt-2">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-zinc-800 transition-all w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
