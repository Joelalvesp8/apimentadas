'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnections } from '@/hooks/useConnections';
import { useProfile } from '@/hooks/useProfile';
import { useCreateSession, useCreateOnlineSession } from '@/hooks/useSessions';
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
import { Users, Wifi, MapPin } from 'lucide-react';

export default function NewSessionPage() {
  const router = useRouter();
  const { data: myProfile } = useProfile();
  const { data: connections, isLoading } = useConnections('accepted');
  const createSession = useCreateSession();
  const createOnlineSession = useCreateOnlineSession();

  const [sessionMode, setSessionMode] = useState<'local' | 'online'>('local');
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
    // Validate participants (creator is already counted as 1 participant)
    const minParticipants = 1; // Need at least 1 more person (creator + 1 = 2 total)
    if (selectedParticipants.length < minParticipants) {
      setError('Selecione pelo menos 1 participante adicional para jogar com você');
      return;
    }

    try {
      if (sessionMode === 'online') {
        // Create online session
        const session = await createOnlineSession.mutateAsync({
          participantIds: selectedParticipants,
        });
        router.push(`/game-online/${session.id}`);
      } else {
        // Create local session
        const session = await createSession.mutateAsync({
          participantIds: selectedParticipants,
        });
        router.push(`/game/${session.id}`);
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao criar sessão');
    }
  };

  const isCreating = createSession.isPending || createOnlineSession.isPending;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Mode selector */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
              Escolha o Modo de Jogo
            </CardTitle>
            <CardDescription className="text-gray-400">
              Selecione como vocês vão jogar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local mode */}
              <div
                onClick={() => setSessionMode('local')}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  sessionMode === 'local'
                    ? 'bg-red-950/20 border-red-700/60 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                    : 'bg-zinc-900/40 border-zinc-700/40 hover:bg-zinc-900/60 hover:border-zinc-600/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${sessionMode === 'local' ? 'bg-red-900/40' : 'bg-zinc-800'}`}>
                    <MapPin className={`w-6 h-6 ${sessionMode === 'local' ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Modo Presencial</h3>
                    <Badge variant="outline" className="border-zinc-600 text-gray-400 mb-2">
                      LOCAL
                    </Badge>
                  </div>
                  {sessionMode === 'local' && (
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Jogadores no mesmo ambiente físico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Cartas de perguntas e tarefas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Carta visível apenas para quem tem a vez</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Sistema de turnos e avaliações</span>
                  </li>
                </ul>
              </div>

              {/* Online mode */}
              <div
                onClick={() => setSessionMode('online')}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  sessionMode === 'online'
                    ? 'bg-red-950/20 border-red-700/60 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                    : 'bg-zinc-900/40 border-zinc-700/40 hover:bg-zinc-900/60 hover:border-zinc-600/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${sessionMode === 'online' ? 'bg-red-900/40' : 'bg-zinc-800'}`}>
                    <Wifi className={`w-6 h-6 ${sessionMode === 'online' ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Modo Online</h3>
                    <Badge variant="outline" className="border-zinc-600 text-gray-400 mb-2">
                      À DISTÂNCIA
                    </Badge>
                  </div>
                  {sessionMode === 'online' && (
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Jogadores remotos (cada um em sua casa)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Apenas perguntas (sem tarefas físicas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Todos veem a mesma pergunta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Todos devem responder para avançar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Respostas visíveis para todos</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Info alert for online mode */}
            {sessionMode === 'online' && (
              <div className="mt-4 p-4 bg-blue-950/20 border-2 border-blue-700/40 rounded-lg">
                <p className="text-sm text-blue-300 flex items-start gap-2">
                  <span className="text-lg">ℹ️</span>
                  <span>
                    <strong>Modo Online:</strong> Adicione pelo menos 1 pessoa para jogar com você (total mínimo: 2 jogadores). Todos precisam estar conectados simultaneamente.
                    A rodada só avança quando todos responderem.
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants selection */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)] flex items-center gap-2">
              <Users className="w-6 h-6" />
              Selecione os Participantes
            </CardTitle>
            <CardDescription className="text-gray-400">
              Escolha quem vai jogar com você (você já está incluído)
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
                            {profile.bio && (
                              <p className="text-sm text-gray-400 truncate max-w-[200px]">
                                {profile.bio}
                              </p>
                            )}
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
                    {selectedParticipants.length} participante(s) selecionado(s) + você = {selectedParticipants.length + 1} total
                  </p>
                  <Button
                    onClick={handleCreateSession}
                    disabled={
                      selectedParticipants.length === 0 || isCreating
                    }
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating
                      ? 'Criando...'
                      : sessionMode === 'online'
                      ? 'Iniciar Sessão Online'
                      : 'Iniciar Sessão Presencial'}
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
