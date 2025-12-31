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
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">Nova Sessão de Jogo</CardTitle>
            <CardDescription className="text-gray-400">
              Selecione os participantes para esta sessão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 mb-4 text-sm text-red-200 bg-red-950/80 border-2 border-red-700/60 rounded-md shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                {error}
              </div>
            )}

            {isLoading && <p className="text-gray-400">Carregando conexões...</p>}

            {connections && connections.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Você ainda não tem conexões aceitas.
                </p>
                <Button
                  onClick={() => router.push('/connections')}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-500 border-2 border-red-600/50"
                >
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
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-zinc-900/70 border-red-700/60 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                            : 'bg-zinc-900/40 border-zinc-700/40 hover:bg-zinc-900/60 hover:border-zinc-600/60'
                        }`}
                        onClick={() => toggleParticipant(profile.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-zinc-700">
                            <AvatarImage src={profile.user.image || undefined} />
                            <AvatarFallback className="bg-zinc-800 text-gray-300">
                              {profile.nickname[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{profile.nickname}</p>
                            <p className="text-sm text-gray-400">
                              {profile.user.name}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge className="bg-red-900/50 border-red-700/50 text-red-200 shadow-[0_0_15px_rgba(220,38,38,0.4)]">Selecionado</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    {selectedParticipants.length} participante(s) selecionado(s)
                  </p>
                  <Button
                    onClick={handleCreateSession}
                    disabled={
                      selectedParticipants.length === 0 || createSession.isPending
                    }
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
