'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-900/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold">
            <span className="text-white">Apimentadas</span>
            <span className="text-red-500">.</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-white hover:text-red-500 hover:bg-red-950/30 transition-colors"
            >
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-red-500/50 transition-all"
            >
              Criar Conta
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
