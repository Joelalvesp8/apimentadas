'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Lock, CheckCircle, XCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de recuperação não fornecido');
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password/validate?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Token inválido ou expirado');
        }

        setIsValidToken(true);
      } catch (error: any) {
        setError(error.message || 'Token inválido ou expirado');
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha');
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao redefinir sua senha');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading validation state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Validando token...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-green-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] animate-pulse-slow" />

        <Card className="w-full max-w-md mx-4 relative z-10 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-green-700/50 backdrop-blur-md shadow-[0_0_60px_rgba(34,197,94,0.3)]">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-900/40 border-2 border-green-700/50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white font-bold">
              Senha Redefinida!
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-center">
              Você será redirecionado para a página de login em instantes...
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold"
            >
              Ir para o Login
            </Button>
          </CardContent>
        </Card>

        <style jsx>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.3; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <Card className="w-full max-w-md relative z-10 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 backdrop-blur-md shadow-[0_0_60px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-900/40 border-2 border-red-700/50 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white font-bold">
              Link Inválido
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              {error || 'Este link de recuperação é inválido ou expirou'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-center text-sm">
              Links de recuperação expiram após 1 hora. Solicite um novo link se necessário.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/forgot-password')}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold"
              >
                Solicitar Novo Link
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800"
              >
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-red-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] animate-pulse-slow" />

      <Card className="w-full max-w-md mx-4 relative z-10 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 backdrop-blur-md shadow-[0_0_60px_rgba(220,38,38,0.3)]">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-900/40 border-2 border-red-700/50 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="p-3 text-sm text-red-200 bg-red-950/80 border-2 border-red-700/60 rounded-md shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200 font-medium">
                Nova Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300 shadow-inner"
              />
              <p className="text-xs text-gray-400">Mínimo de 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300 shadow-inner"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50"
              disabled={isLoading}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>

            <div className="text-center text-sm pt-2">
              <Link
                href="/login"
                className="text-gray-400 hover:text-gray-200 hover:underline transition-colors"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
