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
    <main className="min-h-screen bg-gradient-to-br from-[#1a0a14] via-[#2d0d24] to-[#4a1024] relative overflow-hidden">
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Subtle glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 lg:py-28">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24 lg:mb-32 space-y-8">
          {/* Pepper icon with glow animation */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse">
                <span className="text-6xl md:text-7xl lg:text-8xl opacity-40 blur-xl">🌶️</span>
              </div>
              <span className="relative text-6xl md:text-7xl lg:text-8xl animate-glow">🌶️</span>
            </div>
          </div>

          {/* Main headline - emotional hook */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/95 leading-tight px-4 max-w-4xl mx-auto">
            Nem todo jogo termina quando as cartas acabam.
          </h1>

          {/* Subtitle - building tension */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-200/80 font-light leading-relaxed px-4 max-w-3xl mx-auto tracking-wide">
            Um jogo adulto que transforma curiosidade em tensão… e tensão em momentos inesquecíveis.
          </p>

          {/* Primary CTA with breathing animation */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4 pt-8">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="px-8 md:px-12 py-6 md:py-7 text-base md:text-lg w-full sm:w-auto bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white border-none shadow-lg shadow-red-900/50 transition-all duration-500 animate-breathe font-normal tracking-wide"
              >
                Virar a Primeira Carta
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="px-8 md:px-12 py-6 md:py-7 text-base md:text-lg w-full sm:w-auto bg-transparent border-purple-300/30 text-purple-100 hover:bg-purple-900/20 hover:border-purple-300/50 transition-all duration-500 font-normal tracking-wide"
              >
                Entrar
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section - Reframed as sensations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mb-16 md:mb-24 px-4">
          {/* Card 1: Cards as tension creators */}
          <Card className="bg-gradient-to-br from-purple-950/40 to-red-950/40 border-purple-800/30 backdrop-blur-sm hover:border-purple-700/50 transition-all duration-700 group">
            <CardHeader className="space-y-4 pb-4">
              <CardTitle className="text-xl md:text-2xl text-purple-100 font-light tracking-wide">
                Cartas que provocam
              </CardTitle>
              <CardDescription className="text-purple-300/70 text-sm md:text-base font-light leading-relaxed">
                Testam limites, criam tensão e quebram a rotina.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-purple-200/60 font-light leading-relaxed">
                De sugestões sutis a desafios intensos. Cada carta é uma porta que você escolhe abrir… ou não.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Rating as memory keeper */}
          <Card className="bg-gradient-to-br from-red-950/40 to-purple-950/40 border-red-800/30 backdrop-blur-sm hover:border-red-700/50 transition-all duration-700 group">
            <CardHeader className="space-y-4 pb-4">
              <CardTitle className="text-xl md:text-2xl text-purple-100 font-light tracking-wide">
                Memórias que voltam
              </CardTitle>
              <CardDescription className="text-purple-300/70 text-sm md:text-base font-light leading-relaxed">
                Guarde aquilo que funcionou… e repita quando quiser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-purple-200/60 font-light leading-relaxed">
                Avalie cada experiência. Descubra padrões. Crie um histórico do que vale a pena repetir.
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Social as private moments */}
          <Card className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-purple-800/30 backdrop-blur-sm hover:border-purple-700/50 transition-all duration-700 group">
            <CardHeader className="space-y-4 pb-4">
              <CardTitle className="text-xl md:text-2xl text-purple-100 font-light tracking-wide">
                Momentos privados
              </CardTitle>
              <CardDescription className="text-purple-300/70 text-sm md:text-base font-light leading-relaxed">
                Convites fechados e sessões que não precisam ser explicadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-purple-200/60 font-light leading-relaxed">
                Adicione quem você confia. Crie sessões sob medida. O que acontece aqui, fica aqui.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof Section - Subtle and suggestive */}
        <div className="text-center mb-16 md:mb-20 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-sm md:text-base text-purple-300/60 font-light tracking-wider uppercase">
              Mais de 1.000 jogadores já viraram a primeira carta
            </p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl md:text-3xl text-red-400/80">★</span>
              ))}
            </div>
            <p className="text-purple-200/50 italic text-sm md:text-base font-light leading-relaxed">
              &ldquo;Alguns jogos você termina. Outros, você não esquece.&rdquo;
            </p>
          </div>
        </div>

        {/* Final CTA Section - Invitation to discover */}
        <div className="text-center pb-12 px-4">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-purple-950/60 to-red-950/60 border-purple-700/40 backdrop-blur-md shadow-2xl shadow-purple-900/40">
            <CardHeader className="space-y-6 pt-10 pb-6">
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl text-purple-100 font-light tracking-wide leading-tight">
                A curiosidade já começou.
              </CardTitle>
              <CardDescription className="text-base md:text-lg lg:text-xl text-purple-300/70 font-light leading-relaxed">
                Crie sua conta e descubra o que está esperando por você.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-10">
              <Link href="/register" className="w-full sm:w-auto inline-block">
                <Button
                  size="lg"
                  className="px-10 md:px-16 py-6 md:py-7 text-base md:text-lg w-full sm:w-auto bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white border-none shadow-xl shadow-red-900/50 transition-all duration-500 animate-breathe font-normal tracking-wide"
                >
                  Aceitar o Desafio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.8));
          }
        }

        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
