'use client';

import { useState, useRef } from 'react';
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
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateImage = useUpdateProfileImage();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [orientation, setOrientation] = useState<'heterosexual' | 'homosexual' | 'bisexual' | 'other' | ''>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with profile data
  useState(() => {
    if (profile) {
      setNickname(profile.nickname);
      setBio(profile.bio || '');
      setOrientation((profile.orientation || '') as 'heterosexual' | 'homosexual' | 'bisexual' | 'other' | '');
    }
  });

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
      alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    router.push('/onboarding');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Profile Image Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Adicione ou altere sua foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src={imagePreview || profile.user.image || undefined}
                  alt={profile.user.name}
                />
                <AvatarFallback className="text-4xl">
                  {profile.nickname[0].toUpperCase()}
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
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Escolher Imagem
                </Button>

                {imagePreview && (
                  <>
                    <Button
                      onClick={handleSaveImage}
                      disabled={updateImage.isPending}
                    >
                      Salvar Imagem
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImagePreview(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                JPG, PNG ou GIF. Tamanho máximo: 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.user.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Name (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={profile.user.name}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido / Nickname *</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Como você quer ser chamado(a)"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Sobre Você</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                />
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <Label htmlFor="orientation">Orientação</Label>
                <select
                  id="orientation"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'heterosexual' | 'homosexual' | 'bisexual' | 'other' | '')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione...</option>
                  <option value="heterosexual">Heterossexual</option>
                  <option value="homosexual">Homossexual</option>
                  <option value="bisexual">Bissexual</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex-1"
                >
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
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
