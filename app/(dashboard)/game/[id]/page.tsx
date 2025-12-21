'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, usePlayCard, useFinishSession } from '@/hooks/useSessions';
import { useRandomCard } from '@/hooks/useCards';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GameCard } from '@/components/game-card';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { ThumbsDown, Meh, ThumbsUp, Users } from 'lucide-react';

// Map sessionType to card category
function getCardCategory(sessionType: string): string {
  const mapping: Record<string, string> = {
    'casal': 'casais',
    'trisal': 'trios',
    'grupo': 'grupos',
  };
  return mapping[sessionType] || sessionType;
}

export default function GamePage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();

  const { data: myProfile } = useProfile();
  const { data: session, isLoading, refetch: refetchSession } = useSession(sessionId);

  // Auto-refresh session every 3 seconds to see turn changes
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(() => {
      refetchSession();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [session, refetchSession]);

  const cardCategory = session?.sessionType ? getCardCategory(session.sessionType) : undefined;
  const {
    data: currentCard,
    refetch: fetchCard,
    isLoading: cardLoading,
  } = useRandomCard(undefined, cardCategory, sessionId);

  const playCard = usePlayCard(sessionId);
  const finishSession = useFinishSession();

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Check if it's my turn
  const isMyTurn = myProfile && session?.currentTurnProfileId === myProfile.id;

  // Get current turn participant
  const currentTurnParticipant = session?.sessionParticipants.find(
    (p) => p.profileId === session.currentTurnProfileId
  );

  // Get who should answer (next person after current turn)
  const getAnswererName = () => {
    if (!session || !currentTurnParticipant) return '';
    const currentIndex = session.sessionParticipants.findIndex(
      (p) => p.profileId === session.currentTurnProfileId
    );
    const nextIndex = (currentIndex + 1) % session.sessionParticipants.length;
    return session.sessionParticipants[nextIndex].profile.user.name;
  };

  const handleFetchCard = async () => {
    const result = await fetchCard();
    if (result.data) {
      setSelectedCard(result.data);
      setIsCardFlipped(false);
    }
  };

  const handleRateCard = async (rating: 'ruim' | 'satisfatoria' | 'excelente') => {
    if (!selectedCard) return;

    try {
      // Play card and get updated session
      const result = await playCard.mutateAsync({
        cardId: selectedCard.id,
        qualitativeRating: rating,
      });

      // Reset state immediately
      setSelectedCard(null);
      setIsCardFlipped(false);

      // Force refetch to ensure UI updates
      setTimeout(() => {
        refetchSession();
      }, 100);
    } catch (error: any) {
      console.error('Error playing card:', error);
      alert(error.message || 'Erro ao avaliar resposta');
    }
  };

  const handleFinishSession = async () => {
    try {
      await finishSession.mutateAsync(sessionId);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error finishing session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando sessão...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Sessão não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-20">
        {/* Turn Banner */}
        <Card className={`mb-6 ${isMyTurn ? 'border-4 border-green-500 bg-green-50' : 'border-2 border-orange-300 bg-orange-50'}`}>
          <CardContent className="py-6">
            <div className="text-center">
              {isMyTurn ? (
                <>
                  <h2 className="text-3xl font-bold text-green-700 mb-2">
                    🎯 SUA VEZ!
                  </h2>
                  <p className="text-lg text-green-600">
                    Pegue uma carta para {getAnswererName()} responder/executar
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-orange-700 mb-2">
                    ⏳ Aguarde...
                  </h2>
                  <p className="text-lg text-orange-600">
                    {currentTurnParticipant?.profile.user.name} está pegando uma carta
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sessão de Jogo</span>
              <Badge className="text-lg">
                {session.sessionType === 'casal'
                  ? 'Casal'
                  : session.sessionType === 'trisal'
                  ? 'Trisal'
                  : 'Grupo'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{session.cardsPlayed}</p>
                <p className="text-sm text-muted-foreground">Cartas jogadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {session.averageRating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-muted-foreground">Rating médio</p>
              </div>
            </div>

            {/* Participants */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">Participantes</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.sessionParticipants.map((participant) => (
                  <Badge
                    key={participant.id}
                    variant={participant.profileId === session.currentTurnProfileId ? 'default' : 'outline'}
                    className="px-3 py-1"
                  >
                    {participant.profile.nickname}
                    {participant.profileId === session.currentTurnProfileId && ' 🎯'}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Area */}
        <div className="flex flex-col items-center gap-6">
          {selectedCard ? (
            <>
              <GameCard
                card={selectedCard}
                onFlip={setIsCardFlipped}
                className="mb-4"
              />

              {isCardFlipped && isMyTurn && (
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-center">
                      Como {getAnswererName()} se saiu?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Avalie a resposta ou execução da tarefa:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => handleRateCard('ruim')}
                        disabled={playCard.isPending}
                        variant="outline"
                        className="flex-col h-24 gap-2 border-red-300 hover:bg-red-50"
                      >
                        <ThumbsDown className="w-8 h-8 text-red-500" />
                        <span className="text-sm">Ruim</span>
                      </Button>
                      <Button
                        onClick={() => handleRateCard('satisfatoria')}
                        disabled={playCard.isPending}
                        variant="outline"
                        className="flex-col h-24 gap-2 border-yellow-300 hover:bg-yellow-50"
                      >
                        <Meh className="w-8 h-8 text-yellow-500" />
                        <span className="text-sm">Satisfatória</span>
                      </Button>
                      <Button
                        onClick={() => handleRateCard('excelente')}
                        disabled={playCard.isPending}
                        variant="outline"
                        className="flex-col h-24 gap-2 border-green-300 hover:bg-green-50"
                      >
                        <ThumbsUp className="w-8 h-8 text-green-500" />
                        <span className="text-sm">Excelente</span>
                      </Button>
                    </div>
                    {playCard.isPending && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Salvando avaliação...
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {isCardFlipped && !isMyTurn && (
                <Card className="w-full max-w-md">
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground">
                      Aguarde {currentTurnParticipant?.profile.user.name} avaliar sua resposta...
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="w-full max-w-md">
              <CardContent className="py-12 text-center">
                {isMyTurn ? (
                  <>
                    <p className="mb-4 text-muted-foreground">
                      É sua vez! Clique no botão abaixo para pegar uma carta
                    </p>
                    <Button onClick={handleFetchCard} size="lg" disabled={cardLoading}>
                      {cardLoading ? 'Buscando...' : '🎴 Buscar Carta'}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-muted-foreground">
                      Aguarde {currentTurnParticipant?.profile.user.name} pegar uma carta
                    </p>
                    <Button size="lg" disabled variant="outline">
                      ⏳ Não é sua vez
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Button
            variant="destructive"
            onClick={handleFinishSession}
            disabled={finishSession.isPending}
            className="mb-8"
            size="lg"
          >
            {finishSession.isPending ? 'Finalizando...' : 'Finalizar Sessão'}
          </Button>
        </div>
      </div>
    </div>
  );
}
