'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnections } from '@/hooks/useConnections';
import { useProfile } from '@/hooks/useProfile';
import { useCreateSession } from '@/hooks/useSessions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function NewSessionPage() {
  const router = useRouter();
  const { data: myProfile } = useProfile();
  const { data: connections, isLoading } = useConnections('accepted');
  const createSession = useCreateSession();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleParticipant = (profileId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleCreateSession = async () => {
    if (selectedParticipants.length === 0) {
      setError('Selecione pelo menos 1 participante');
      return;
    }

    try {
      const session = await createSession.mutateAsync({
        participantIds: selectedParticipants,
      });
      router.push(`/game/${session.id}`);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar sessão');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nova Sessão de Jogo</CardTitle>
            <CardDescription>
              Selecione os participantes para esta sessão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {isLoading && <p>Carregando conexões...</p>}

            {connections && connections.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem conexões aceitas.
                </p>
                <Button onClick={() => router.push('/connections')}>
                  Adicionar Conexões
                </Button>
              </div>
            )}

            {connections && connections.length > 0 && (
              <>
                <div className="space-y-2 mb-6">
                  {connections.map((connection) => {
                    // Show the OTHER person (not me)
                    const profile = connection.from.id === myProfile?.id
                      ? connection.to
                      : connection.from;

                    const isSelected = selectedParticipants.includes(profile.id);

                    return (
                      <div
                        key={connection.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                          isSelected
                            ? 'bg-purple-50 border-purple-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleParticipant(profile.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={profile.user.image || undefined} />
                            <AvatarFallback>
                              {profile.nickname[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.nickname}</p>
                            <p className="text-sm text-muted-foreground">
                              {profile.user.name}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge className="bg-purple-500">Selecionado</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipants.length} participante(s) selecionado(s)
                  </p>
                  <Button
                    onClick={handleCreateSession}
                    disabled={
                      selectedParticipants.length === 0 || createSession.isPending
                    }
                  >
                    {createSession.isPending
                      ? 'Criando...'
                      : 'Iniciar Sessão'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
