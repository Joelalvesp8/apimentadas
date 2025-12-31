'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProfile, useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function OnboardingPage() {
  const router = useRouter();
  const createProfile = useCreateProfile();
  const { data: existingProfile, isLoading: profileLoading } = useProfile();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [orientation, setOrientation] = useState<string>('');
  const [error, setError] = useState('');

  // If user already has a profile with nickname, redirect to dashboard
  // This prevents users from being stuck in onboarding loop
  useEffect(() => {
    if (existingProfile && existingProfile.nickname) {
      console.log('[DEBUG] Onboarding - Profile exists, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [existingProfile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('[DEBUG] Onboarding - Submitting profile:', { nickname, hasBio: !!bio, orientation });

    try {
      await createProfile.mutateAsync({
        nickname,
        bio: bio || undefined,
        orientation: orientation ? (orientation as 'heterosexual' | 'homosexual' | 'bisexual' | 'other') : undefined,
      });

      console.log('[DEBUG] Onboarding - Profile created successfully, redirecting to dashboard');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar perfil';
      console.log('[DEBUG] Onboarding - Error creating profile:', errorMessage);

      // If profile already exists, redirect to dashboard instead of showing error
      if (errorMessage.includes('já existe') || errorMessage.includes('already exists')) {
        console.log('[DEBUG] Onboarding - Profile already exists, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }

      setError(errorMessage);
    }
  };

  // Show loading state while checking if profile exists
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <p className="text-gray-400">Carregando...</p>
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse-slow" />

      <Card className="w-full max-w-md relative z-10 bg-gradient-to-br from-black/90 via-red-950/30 to-black/90 border-red-900/40 backdrop-blur-sm shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">🌶️</span>
          </div>
          <CardTitle className="text-2xl text-center text-white font-bold">
            Última etapa
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Escolha seu nickname e complete seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-200 bg-red-950/50 border border-red-800/50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-gray-300">
                Nickname *
              </Label>
              <Input
                id="nickname"
                type="text"
                placeholder="seunickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                disabled={createProfile.isPending}
                minLength={3}
                maxLength={20}
                className="bg-black/50 border-red-900/30 text-white placeholder:text-gray-600 focus:border-red-700/50 focus:ring-red-900/30"
              />
              <p className="text-xs text-gray-500">
                Apenas letras, números e underscores (3-20 caracteres)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-300">
                Bio (opcional)
              </Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={createProfile.isPending}
                maxLength={500}
                className="bg-black/50 border-red-900/30 text-white placeholder:text-gray-600 focus:border-red-700/50 focus:ring-red-900/30 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation" className="text-gray-300">
                Orientação (opcional)
              </Label>
              <select
                id="orientation"
                className="flex h-10 w-full rounded-md border border-red-900/30 bg-black/50 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:border-red-700/50 focus-visible:ring-2 focus-visible:ring-red-900/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                disabled={createProfile.isPending}
              >
                <option value="" className="bg-black text-white">Selecione...</option>
                <option value="heterosexual" className="bg-black text-white">Heterosexual</option>
                <option value="homosexual" className="bg-black text-white">Homosexual</option>
                <option value="bisexual" className="bg-black text-white">Bisexual</option>
                <option value="other" className="bg-black text-white">Outro</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-500 mt-6"
              disabled={createProfile.isPending}
            >
              {createProfile.isPending ? 'Criando perfil...' : 'Começar a Jogar'}
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
