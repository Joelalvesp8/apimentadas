'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta');
        setIsLoading(false);
        return;
      }

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      setError('Ocorreu um erro ao criar a conta');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Film grain texture */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Red halo glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse-slow" />

      <Card className="w-full max-w-md relative z-10 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 backdrop-blur-md shadow-[0_0_60px_rgba(220,38,38,0.3)] hover:shadow-[0_0_80px_rgba(220,38,38,0.4)] transition-all duration-500">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl drop-shadow-[0_0_25px_rgba(220,38,38,0.9)] animate-heat-shimmer">🌶️</span>
            <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              APIMENTADAS
            </h1>
          </div>
          <CardTitle className="text-2xl text-center text-white font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
            Virar a Primeira Carta
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Crie sua conta e comece a jogar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-200 bg-red-950/80 border-2 border-red-700/60 rounded-md shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200 font-medium">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200 font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300 shadow-inner"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50 hover:border-red-500/80"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Aceitar o Desafio'}
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-gray-400">Já tem uma conta? </span>
              <Link
                href="/login"
                className="text-red-400 hover:text-red-300 hover:underline font-semibold transition-colors drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]"
              >
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes heat-shimmer {
          0%, 100% {
            filter: drop-shadow(0 0 25px rgba(220, 38, 38, 0.9));
          }
          50% {
            filter: drop-shadow(0 0 35px rgba(239, 68, 68, 1));
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-heat-shimmer {
          animation: heat-shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
