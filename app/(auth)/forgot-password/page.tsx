'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar email');
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao processar sua solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
        {/* Film grain texture */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Green glow for success */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-green-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] animate-pulse-slow" />

        <Card className="w-full max-w-md mx-4 relative z-10 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-green-700/50 backdrop-blur-md shadow-[0_0_60px_rgba(34,197,94,0.3)]">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-900/40 border-2 border-green-700/50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white font-bold">
              Email Enviado!
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-center">
              Se existir uma conta com o email <strong className="text-white">{email}</strong>, você receberá um link para redefinir sua senha.
            </p>
            <p className="text-sm text-gray-400 text-center">
              O link expira em 1 hora. Não se esqueça de verificar sua pasta de spam!
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold"
            >
              Voltar para o Login
            </Button>
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

          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-red-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] animate-pulse-slow" />

      <Card className="w-full max-w-md mx-4 relative z-10 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 backdrop-blur-md shadow-[0_0_60px_rgba(220,38,38,0.3)]">
        <CardHeader>
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar para o login</span>
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-900/40 border-2 border-red-700/50 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
            Esqueceu sua senha?
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Digite seu email para receber um link de recuperação
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
              <Label htmlFor="email" className="text-gray-200 font-medium">
                Email
              </Label>
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
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

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
