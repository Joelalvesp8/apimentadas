'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, usePlayCard, useFinishSession } from '@/hooks/useSessions';
import { useRandomCard } from '@/hooks/useCards';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GameCard } from '@/components/game-card';
import { RatingStars } from '@/components/rating-stars';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';

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

  const { data: session, isLoading } = useSession(sessionId);
  const cardCategory = session?.sessionType ? getCardCategory(session.sessionType) : undefined;
  const {
    data: currentCard,
    refetch: fetchCard,
    isLoading: cardLoading,
  } = useRandomCard(undefined, cardCategory);

  const playCard = usePlayCard(sessionId);
  const finishSession = useFinishSession();

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hasPlayedCard, setHasPlayedCard] = useState(false);

  const handleFetchCard = () => {
    setIsCardFlipped(false);
    setRating(0);
    setHasPlayedCard(false);
    fetchCard();
  };

  const handlePlayCard = async () => {
    if (!currentCard) return;

    try {
      await playCard.mutateAsync({
        cardId: currentCard.id,
        rating: rating > 0 ? rating : undefined,
      });
      setHasPlayedCard(true);
    } catch (error) {
      console.error('Error playing card:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
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
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{session.cardsPlayed}</p>
                <p className="text-sm text-muted-foreground">Cartas jogadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {session.sessionParticipants.length}
                </p>
                <p className="text-sm text-muted-foreground">Participantes</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {session.averageRating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-muted-foreground">Rating médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Area */}
        <div className="flex flex-col items-center gap-6">
          {currentCard ? (
            <>
              <GameCard
                card={currentCard}
                onFlip={setIsCardFlipped}
                className="mb-4"
              />

              {isCardFlipped && !hasPlayedCard && (
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Avalie esta experiência</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <RatingStars value={rating} onChange={setRating} />
                    <Button onClick={handlePlayCard} className="w-full">
                      {playCard.isPending ? 'Salvando...' : 'Salvar e Continuar'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {hasPlayedCard && (
                <Button onClick={handleFetchCard} size="lg">
                  Próxima Carta
                </Button>
              )}
            </>
          ) : (
            <Card className="w-full max-w-md">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  Clique no botão abaixo para buscar uma carta
                </p>
                <Button onClick={handleFetchCard} size="lg" disabled={cardLoading}>
                  {cardLoading ? 'Buscando...' : 'Buscar Carta'}
                </Button>
              </CardContent>
            </Card>
          )}

          <Button
            variant="destructive"
            onClick={handleFinishSession}
            disabled={finishSession.isPending}
          >
            {finishSession.isPending ? 'Finalizando...' : 'Finalizar Sessão'}
          </Button>
        </div>
      </div>
    </div>
  );
}
