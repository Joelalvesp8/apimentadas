'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProfile } from '@/hooks/useProfile';
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

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [orientation, setOrientation] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createProfile.mutateAsync({
        nickname,
        bio: bio || undefined,
        orientation: orientation ? (orientation as 'heterosexual' | 'homosexual' | 'bisexual' | 'other') : undefined,
      });

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Erro ao criar perfil');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-purple-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete seu Perfil</CardTitle>
          <CardDescription>
            Adicione algumas informações para começar a jogar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname *</Label>
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
              />
              <p className="text-xs text-muted-foreground">
                Apenas letras, números e underscores (3-20 caracteres). Sem @ ou caracteres especiais.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={createProfile.isPending}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientação (opcional)</Label>
              <select
                id="orientation"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                disabled={createProfile.isPending}
              >
                <option value="">Selecione...</option>
                <option value="heterosexual">Heterosexual</option>
                <option value="homosexual">Homosexual</option>
                <option value="bisexual">Bisexual</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createProfile.isPending}
            >
              {createProfile.isPending ? 'Criando perfil...' : 'Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
