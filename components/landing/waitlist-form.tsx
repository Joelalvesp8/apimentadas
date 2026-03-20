'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao se inscrever');
      }

      setIsSuccess(true);
      setEmail('');
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section
        id="waitlist"
        ref={formRef}
        className="relative py-32 px-6 bg-gradient-to-b from-black via-red-950/10 to-black"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-900/40 border-2 border-green-700/50 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Você está na lista!
          </h2>

          <p className="text-lg text-gray-300 mb-2">
            Em breve você receberá um email com instruções para acessar o Apimentadas.
          </p>

          <p className="text-sm text-gray-500 mb-8">
            Fique atento à sua caixa de entrada.
          </p>

          <Link href="/login">
            <Button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-red-500/50 transition-all"
            >
              Fazer Login
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      id="waitlist"
      ref={formRef}
      className="relative py-32 px-6 bg-gradient-to-b from-black via-red-950/10 to-black"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[280px] h-[280px] sm:w-[440px] sm:h-[440px] md:w-[600px] md:h-[600px] bg-red-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Algumas experiências não são
          <br />
          <span className="text-red-400">para todo mundo.</span>
        </h2>

        <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed max-w-xl mx-auto">
          O <strong className="text-white">Apimentadas</strong> está em fase de testes.
        </p>

        <p className="text-gray-400 mb-12 max-w-lg mx-auto">
          A lista de espera garante acesso antecipado ao aplicativo
          e a chance de viver a experiência antes do lançamento oficial.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-200 bg-red-950/80 border-2 border-red-700/60 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Digite seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="flex-1 bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300 h-12 text-base"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50"
            >
              {isLoading ? 'Enviando...' : 'Quero jogar primeiro'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Sem spam. Apenas quando for a hora certa.
          </p>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Já tem conta?{' '}
              <Link
                href="/login"
                className="text-red-500 hover:text-red-400 font-semibold underline-offset-4 hover:underline transition-colors"
              >
                Faça login aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
