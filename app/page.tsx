'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Film grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Red halo glow - inspired by logo background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/30 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-800/20 rounded-full blur-[100px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32">
        {/* Hero Section - Logo-inspired */}
        <div className="text-center mb-20 md:mb-32 lg:mb-40 space-y-10">
          {/* Pepper icon with intense glow - matching logo style */}
          <div className="flex items-center justify-center mb-12">
            <div className="relative">
              {/* Outer glow halo */}
              <div className="absolute inset-0 -m-12">
                <div className="w-full h-full rounded-full bg-red-600/40 blur-3xl animate-breathe-glow" />
              </div>

              {/* Inner pulse */}
              <div className="absolute inset-0 animate-pulse">
                <span className="text-7xl md:text-8xl lg:text-9xl opacity-30 blur-2xl">🌶️</span>
              </div>

              {/* Main pepper */}
              <span className="relative text-7xl md:text-8xl lg:text-9xl drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] animate-heat-shimmer">
                🌶️
              </span>
            </div>
          </div>

          {/* Main headline - Direct, provocative */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] px-4 max-w-5xl mx-auto">
            Nem todo limite
            <br />
            <span className="text-red-500">precisa ser explicado.</span>
          </h1>

          {/* Subtitle - Building heat and tension */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-normal leading-relaxed px-4 max-w-2xl mx-auto tracking-wide">
            Cartas que aquecem.
            <br className="hidden sm:block" />
            Decisões que mudam o clima.
            <br className="hidden sm:block" />
            Momentos que não se repetem.
          </p>

          {/* Primary CTA with heat effect */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center px-4 pt-6">
            <Link href="/register" className="w-full sm:w-auto group">
              <Button
                size="lg"
                className="px-10 md:px-14 py-7 md:py-8 text-lg md:text-xl w-full sm:w-auto bg-gradient-to-br from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:via-red-600 hover:to-red-700 text-white border-none shadow-[0_0_40px_rgba(220,38,38,0.5)] hover:shadow-[0_0_60px_rgba(220,38,38,0.8)] transition-all duration-700 font-semibold tracking-wider uppercase animate-breathe-slow relative overflow-hidden"
              >
                <span className="relative z-10">Virar a Primeira Carta</span>
                {/* Heat shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="px-10 md:px-14 py-7 md:py-8 text-lg md:text-xl w-full sm:w-auto bg-transparent border-2 border-red-900/50 text-gray-300 hover:bg-red-950/30 hover:border-red-700/70 hover:text-white transition-all duration-500 font-semibold tracking-wider uppercase"
              >
                Entrar
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section - Sensations, not specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20 md:mb-32 px-4">
          {/* Card 1: Heat */}
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800/60 hover:border-red-700/60 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-700 group relative overflow-hidden shadow-xl">
            {/* Side glow on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-xl md:text-2xl text-white font-semibold tracking-wide">
                Cartas que aquecem
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm md:text-base font-normal leading-relaxed">
                De sugestões sutis a desafios intensos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
                Cada carta é uma porta. Você escolhe até onde vai.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Memory as heat */}
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800/60 hover:border-red-700/60 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-700 group relative overflow-hidden shadow-xl">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-xl md:text-2xl text-white font-semibold tracking-wide">
                Sessões que marcam
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm md:text-base font-normal leading-relaxed">
                O que funcionou, você guarda. E repete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
                Avalie. Descubra padrões. Crie um histórico pessoal.
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Private intensity */}
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800/60 hover:border-red-700/60 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-700 group relative overflow-hidden shadow-xl">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-xl md:text-2xl text-white font-semibold tracking-wide">
                Convites fechados
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm md:text-base font-normal leading-relaxed">
                Só você e quem você confia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
                Sessões privadas. Sem explicações necessárias.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof - Indirect and suggestive */}
        <div className="text-center mb-20 md:mb-28 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-sm md:text-base text-gray-600 font-medium tracking-[0.2em] uppercase">
              Mais de 1.000 jogadores
            </p>

            {/* Dripping stars effect - inspired by logo drops */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="text-3xl md:text-4xl text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                  style={{
                    animation: `drip 3s ease-in-out infinite ${star * 0.2}s`
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <p className="text-gray-500 italic text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              &ldquo;Nem todo jogo termina quando a partida acaba.&rdquo;
            </p>
          </div>
        </div>

        {/* Final CTA - Maximum heat */}
        <div className="text-center pb-16 px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-black/90 via-red-950/40 to-black/90 border-red-800/50 backdrop-blur-md shadow-[0_0_80px_rgba(220,38,38,0.3)] relative overflow-hidden">
            {/* Ambient glow inside card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-red-900/20 to-transparent" />

            <CardHeader className="space-y-8 pt-12 pb-8 relative z-10">
              <CardTitle className="text-3xl md:text-4xl lg:text-5xl text-white font-bold tracking-tight leading-tight">
                Você decide até onde vai.
              </CardTitle>
              <CardDescription className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light leading-relaxed">
                A primeira carta já está na mesa.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-12 relative z-10">
              <Link href="/register" className="inline-block group">
                <Button
                  size="lg"
                  className="px-12 md:px-20 py-7 md:py-9 text-lg md:text-xl w-full sm:w-auto bg-gradient-to-br from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:via-red-600 hover:to-red-700 text-white border-none shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:shadow-[0_0_80px_rgba(220,38,38,0.9)] transition-all duration-700 font-bold tracking-widest uppercase animate-breathe-slow relative overflow-hidden"
                >
                  <span className="relative z-10">Aceitar o Desafio</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }

        @keyframes breathe-glow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes heat-shimmer {
          0%, 100% {
            filter: drop-shadow(0 0 25px rgba(220, 38, 38, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(239, 68, 68, 1));
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes drip {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }

        .animate-breathe-slow {
          animation: breathe-slow 4s ease-in-out infinite;
        }

        .animate-breathe-glow {
          animation: breathe-glow 3s ease-in-out infinite;
        }

        .animate-heat-shimmer {
          animation: heat-shimmer 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
