'use client';

import { useState, useRef, useEffect } from 'react';
import { useProfile, useUpdateProfile, useUpdateProfileImage } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, error: profileError } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateImage = useUpdateProfileImage();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [orientation, setOrientation] = useState<'heterosexual' | 'homosexual' | 'bisexual' | 'other' | ''>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to onboarding if profile doesn't exist
  useEffect(() => {
    if (!isLoading && !profile && profileError) {
      const errorMessage = String(profileError);
      if (errorMessage.includes('404') || errorMessage.includes('não encontrado')) {
        router.push('/onboarding');
      }
    }
  }, [isLoading, profile, profileError, router]);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setBio(profile.bio || '');
      setOrientation((profile.orientation || '') as 'heterosexual' | 'homosexual' | 'bisexual' | 'other' | '');
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Tamanho máximo: 5MB');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!imagePreview) return;

    try {
      await updateImage.mutateAsync(imagePreview);
      setImagePreview(null);
      alert('Imagem atualizada com sucesso!');
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar imagem');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync({
        nickname,
        bio,
        orientation: orientation || undefined,
      });
      router.push(`/users/${nickname}`);
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar perfil');
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <p className="text-gray-400">Carregando perfil...</p>
      </div>
    );
  }

  // Show error if profile couldn't be loaded for other reasons
  if (profileError) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50">
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-red-400">Erro ao carregar perfil</p>
            <p className="mb-4 text-sm text-gray-400">{profileError ? String(profileError) : 'Erro desconhecido'}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-700 hover:bg-red-800">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-white">Meu Perfil</h1>
          <p className="text-gray-400">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Profile Image Card */}
        <Card className="mb-6 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/30">
          <CardHeader>
            <CardTitle className="text-white">Foto de Perfil</CardTitle>
            <CardDescription className="text-gray-400">
              Adicione ou altere sua foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-red-700/50">
                <AvatarImage
                  src={imagePreview || profile?.user?.image || undefined}
                  alt={profile?.nickname || 'User'}
                />
                <AvatarFallback className="text-4xl bg-red-900 text-red-200">
                  {profile?.nickname?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Escolher Imagem
                </Button>

                {imagePreview && (
                  <>
                    <Button
                      onClick={handleSaveImage}
                      disabled={updateImage.isPending}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      Salvar Imagem
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImagePreview(null)}
                      className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-400">
                JPG, PNG ou GIF. Tamanho máximo: 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/30">
          <CardHeader>
            <CardTitle className="text-white">Informações do Perfil</CardTitle>
            <CardDescription className="text-gray-400">
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.user?.email || ''}
                  disabled
                  className="bg-zinc-800/50 border-zinc-700 text-gray-400"
                />
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-gray-200">Apelido / Nickname *</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Como você quer ser chamado(a)"
                  required
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-700"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-200">Sobre Você</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-700"
                />
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <Label htmlFor="orientation" className="text-gray-200">Orientação</Label>
                <select
                  id="orientation"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'heterosexual' | 'homosexual' | 'bisexual' | 'other' | '')}
                  className="w-full rounded-md border-2 border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-700"
                >
                  <option value="" className="bg-zinc-900">Selecione...</option>
                  <option value="heterosexual" className="bg-zinc-900">Heterossexual</option>
                  <option value="homosexual" className="bg-zinc-900">Homossexual</option>
                  <option value="bisexual" className="bg-zinc-900">Bissexual</option>
                  <option value="other" className="bg-zinc-900">Outro</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex-1 bg-red-700 hover:bg-red-800"
                >
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
