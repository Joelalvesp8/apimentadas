'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
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
import { MapPin, User, AlertCircle } from 'lucide-react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // Basic profile fields (pre-filled from existing profile)
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [orientation, setOrientation] = useState<'heterosexual' | 'homosexual' | 'bisexual' | 'other' | ''>('');

  // Address fields (main focus - these are what's missing)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryZipCode, setDeliveryZipCode] = useState('');
  const [deliveryComplement, setDeliveryComplement] = useState('');

  const [error, setError] = useState('');

  // Redirect to onboarding if no profile exists
  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/onboarding');
    }
  }, [profile, isLoading, router]);

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
      setBio(profile.bio || '');
      setOrientation((profile.orientation || '') as any);
      setDeliveryAddress(profile.deliveryAddress || '');
      setDeliveryCity(profile.deliveryCity || '');
      setDeliveryState(profile.deliveryState || '');
      setDeliveryZipCode(profile.deliveryZipCode || '');
      setDeliveryComplement(profile.deliveryComplement || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required address fields
    if (!deliveryAddress || !deliveryCity || !deliveryState || !deliveryZipCode) {
      setError('Por favor, preencha todos os campos de endereço obrigatórios');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        nickname,
        bio: bio || undefined,
        orientation: orientation || undefined,
        deliveryAddress,
        deliveryCity,
        deliveryState: deliveryState.toUpperCase(),
        deliveryZipCode,
        deliveryComplement: deliveryComplement || undefined,
      });

      // Redirect back to previous page or marketplace
      router.back();
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-purple-100">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  // Check if profile already has address
  const hasAddress = profile.deliveryAddress && profile.deliveryCity &&
                     profile.deliveryState && profile.deliveryZipCode;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-purple-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Complete seu Endereço de Entrega
          </CardTitle>
          <CardDescription>
            {hasAddress 
              ? 'Atualize suas informações de perfil e endereço' 
              : 'Precisamos do seu endereço para realizar entregas no marketplace'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Existing Profile Info Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-700">Suas Informações Básicas</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={updateProfile.isPending}
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground">
                  Você pode editar se desejar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre você..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={updateProfile.isPending}
                  maxLength={500}
                  rows={3}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">Orientação</Label>
                <select
                  id="orientation"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  disabled={updateProfile.isPending}
                >
                  <option value="">Selecione...</option>
                  <option value="heterosexual">Heterossexual</option>
                  <option value="homosexual">Homossexual</option>
                  <option value="bisexual">Bissexual</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            {/* Address Section (Main Focus) */}
            <div className="space-y-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">
                  Endereço de Entrega {!hasAddress && <span className="text-red-600">*Obrigatório</span>}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress" className="font-semibold">
                    Rua, Avenida e Número *
                  </Label>
                  <Input
                    id="deliveryAddress"
                    type="text"
                    placeholder="Ex: Rua das Flores, 123"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    disabled={updateProfile.isPending}
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryCity" className="font-semibold">Cidade *</Label>
                    <Input
                      id="deliveryCity"
                      type="text"
                      placeholder="Ex: São Paulo"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      required
                      disabled={updateProfile.isPending}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryState" className="font-semibold">Estado (UF) *</Label>
                    <Input
                      id="deliveryState"
                      type="text"
                      placeholder="Ex: SP"
                      value={deliveryState}
                      onChange={(e) => setDeliveryState(e.target.value.toUpperCase())}
                      required
                      disabled={updateProfile.isPending}
                      maxLength={2}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryZipCode" className="font-semibold">CEP *</Label>
                    <Input
                      id="deliveryZipCode"
                      type="text"
                      placeholder="00000-000"
                      value={deliveryZipCode}
                      onChange={(e) => setDeliveryZipCode(e.target.value)}
                      required
                      disabled={updateProfile.isPending}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryComplement">Complemento</Label>
                    <Input
                      id="deliveryComplement"
                      type="text"
                      placeholder="Apto, bloco, etc"
                      value={deliveryComplement}
                      onChange={(e) => setDeliveryComplement(e.target.value)}
                      disabled={updateProfile.isPending}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {!hasAddress && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                  <strong>Importante:</strong> Seu endereço é necessário para que os vendedores possam entregar os produtos.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Salvando...' : hasAddress ? 'Atualizar Perfil' : 'Salvar e Continuar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={updateProfile.isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
