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
import { ThumbsDown, Meh, ThumbsUp, Users, Heart, HeartOff, SkipForward, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const [difficulty, setDifficulty] = useState<string>('');
  const cardCategory = session?.sessionType ? getCardCategory(session.sessionType) : undefined;
  const {
    data: currentCard,
    refetch: fetchCard,
    isLoading: cardLoading,
  } = useRandomCard(undefined, cardCategory, sessionId, difficulty || undefined);

  const playCard = usePlayCard(sessionId);
  const finishSession = useFinishSession();

  const { toast } = useToast();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showRatingScreen, setShowRatingScreen] = useState(false);
  const [cardRatings, setCardRatings] = useState<Record<string, boolean>>({});
  const [isSkipping, setIsSkipping] = useState(false);

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

  const handleSkipCard = async () => {
    if (!selectedCard || isCardFlipped) return;
    setIsSkipping(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/skip`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: json.error ?? 'Erro ao pular carta', variant: 'destructive' });
        return;
      }
      const { remaining, maxSkips } = json.data;
      setSelectedCard(null);
      setIsCardFlipped(false);
      await refetchSession();
      toast({
        title: `Carta pulada! Skips restantes: ${remaining}/${maxSkips}`,
        variant: remaining === 0 ? 'destructive' : 'default',
      });
    } finally {
      setIsSkipping(false);
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
      // Show rating screen instead of redirecting immediately
      setShowRatingScreen(true);
    } catch (error) {
      console.error('Error finishing session:', error);
    }
  };

  const handleCardLike = async (cardId: string, liked: boolean) => {
    try {
      // If clicking the same rating again, remove it
      const currentRating = cardRatings[cardId];
      if (currentRating === liked) {
        // Remove rating
        const response = await fetch(`/api/cards/${cardId}/like`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao remover avaliação');
        }

        setCardRatings((prev) => {
          const newRatings = { ...prev };
          delete newRatings[cardId];
          return newRatings;
        });
      } else {
        // Add/change rating
        const response = await fetch(`/api/cards/${cardId}/like`, {
          method: liked ? 'POST' : 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao avaliar carta');
        }

        setCardRatings((prev) => ({ ...prev, [cardId]: liked }));
      }
    } catch (error: any) {
      console.error('Error rating card:', error);
      alert(error.message || 'Erro ao avaliar carta');
    }
  };

  const handleFinishRating = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Carregando sessão...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Sessão não encontrada</p>
      </div>
    );
  }

  // Rating Screen - shown after finishing session
  if (showRatingScreen) {
    return (
      <div className="min-h-screen p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20">
          <Card className="mb-6 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
                🎉 Sessão Finalizada!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-300 mb-6">
                Avalie as cartas que apareceram durante o jogo. Sua opinião ajuda a melhorar a experiência!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-zinc-900/80 border-2 border-zinc-700/40 rounded-lg shadow-inner">
                  <p className="text-3xl font-bold text-red-500">{session.cardsPlayed}</p>
                  <p className="text-sm text-gray-400">Cartas jogadas</p>
                </div>
                <div className="text-center p-4 bg-zinc-900/80 border-2 border-zinc-700/40 rounded-lg shadow-inner">
                  <p className="text-3xl font-bold text-red-500">
                    {session.averageRating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-sm text-gray-400">Rating médio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards Rating */}
          <Card className="mb-6 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
            <CardHeader>
              <CardTitle className="text-white">Avalie as Cartas</CardTitle>
              <p className="text-sm text-gray-400">
                Toque no coração para curtir uma carta ou no X para descurtir
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {session.playedCards && session.playedCards.length > 0 ? (
                  session.playedCards.map((playedCard: any) => {
                    const isLiked = cardRatings[playedCard.card.id];
                    return (
                      <Card key={playedCard.id} className="bg-zinc-900/60 border-2 border-zinc-700/40 hover:border-red-700/50 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={playedCard.card.type === 'pergunta' ? 'default' : 'secondary'} className="bg-red-900/40 border-red-700/50 text-red-200">
                                  {playedCard.card.type === 'pergunta' ? '❓ Pergunta' : '🎯 Tarefa'}
                                </Badge>
                                <Badge variant="outline" className="border-zinc-600 text-gray-300">
                                  {playedCard.card.difficulty === 'facil' && '🟢 Fácil'}
                                  {playedCard.card.difficulty === 'medio' && '🟡 Médio'}
                                  {playedCard.card.difficulty === 'dificil' && '🟠 Difícil'}
                                  {playedCard.card.difficulty === 'extremo' && '🔴 Extremo'}
                                </Badge>
                              </div>
                              <p className="text-sm mb-2 text-gray-200">{playedCard.card.content}</p>
                              {playedCard.qualitativeRating && (
                                <Badge variant="outline" className="text-xs border-zinc-600 text-gray-400">
                                  Execução: {playedCard.qualitativeRating === 'ruim' && '👎 Ruim'}
                                  {playedCard.qualitativeRating === 'satisfatoria' && '😐 Satisfatória'}
                                  {playedCard.qualitativeRating === 'excelente' && '👍 Excelente'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={isLiked === true ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleCardLike(playedCard.card.id, true)}
                                className={`h-10 w-10 p-0 ${isLiked === true ? 'bg-red-600 hover:bg-red-500 border-red-600' : 'border-zinc-600 hover:bg-zinc-800'}`}
                              >
                                <Heart className={`w-5 h-5 ${isLiked === true ? 'fill-current text-white' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant={isLiked === false ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => handleCardLike(playedCard.card.id, false)}
                                className={`h-10 w-10 p-0 ${isLiked === false ? 'bg-zinc-700 hover:bg-zinc-600 border-zinc-600' : 'border-zinc-600 hover:bg-zinc-800'}`}
                              >
                                <HeartOff className={`w-5 h-5 ${isLiked === false ? 'text-white' : 'text-gray-400'}`} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    Nenhuma carta foi jogada nesta sessão
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleFinishRating}
              size="lg"
              className="min-w-[200px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50"
            >
              Finalizar e Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-20">
        {/* Turn Banner */}
        <Card className={`mb-6 ${isMyTurn ? 'bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/60 shadow-[0_0_40px_rgba(220,38,38,0.4)]' : 'bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border-2 border-zinc-700/50 shadow-[0_0_20px_rgba(120,120,120,0.2)]'}`}>
          <CardContent className="py-6">
            <div className="text-center">
              {isMyTurn ? (
                <>
                  <h2 className="text-3xl font-bold text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]">
                    🎯 SUA VEZ!
                  </h2>
                  <p className="text-lg text-gray-300">
                    Pegue uma carta para {getAnswererName()} responder/executar
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-300 mb-2">
                    ⏳ Aguarde...
                  </h2>
                  <p className="text-lg text-gray-400">
                    {currentTurnParticipant?.profile.user.name} está pegando uma carta
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="mb-6 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Sessão de Jogo</span>
              <Badge className="text-lg bg-red-900/50 border-red-700/50 text-red-200">
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
              <div className="text-center p-3 bg-zinc-900/60 border border-zinc-700/40 rounded-lg">
                <p className="text-2xl font-bold text-red-500">{session.cardsPlayed}</p>
                <p className="text-sm text-gray-400">Cartas jogadas</p>
              </div>
              <div className="text-center p-3 bg-zinc-900/60 border border-zinc-700/40 rounded-lg">
                <p className="text-2xl font-bold text-red-500">
                  {session.averageRating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-gray-400">Rating médio</p>
              </div>
            </div>

            {/* Intensity Filter */}
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm text-gray-400 shrink-0">Intensidade:</span>
              <Select value={difficulty || 'all'} onValueChange={(v) => setDifficulty(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-8 bg-zinc-900/60 border-zinc-700 text-white text-xs focus:border-red-700/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all" className="text-white text-xs">Todas</SelectItem>
                  <SelectItem value="facil" className="text-white text-xs">🟢 Fácil</SelectItem>
                  <SelectItem value="medio" className="text-white text-xs">🟡 Médio</SelectItem>
                  <SelectItem value="dificil" className="text-white text-xs">🟠 Difícil</SelectItem>
                  <SelectItem value="extremo" className="text-white text-xs">🔴 Extremo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Participants */}
            <div className="border-t border-zinc-700/40 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-white">Participantes</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.sessionParticipants.map((participant) => (
                  <Badge
                    key={participant.id}
                    variant={participant.profileId === session.currentTurnProfileId ? 'default' : 'outline'}
                    className={participant.profileId === session.currentTurnProfileId
                      ? 'px-3 py-1 bg-red-900/50 border-red-700/50 text-red-200'
                      : 'px-3 py-1 border-zinc-600 text-gray-300'}
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

              {/* Skip button — only before flipping and on my turn */}
              {!isCardFlipped && isMyTurn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipCard}
                  disabled={isSkipping || (session.skipsUsed ?? 0) >= (session.maxSkips ?? 3)}
                  className="flex items-center gap-2 border-zinc-700 text-gray-400 hover:text-yellow-400 hover:border-yellow-700/60"
                >
                  <SkipForward className="h-4 w-4" />
                  Pular ({(session.maxSkips ?? 3) - (session.skipsUsed ?? 0)} restantes)
                </Button>
              )}

              {isCardFlipped && isMyTurn && (
                <Card className="w-full max-w-md bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                  <CardHeader>
                    <CardTitle className="text-center text-white">
                      Como {getAnswererName()} se saiu?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-sm text-gray-400 mb-4">
                      Avalie a resposta ou execução da tarefa:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => handleRateCard('ruim')}
                        disabled={playCard.isPending}
                        variant="outline"
                        className="flex-col h-24 gap-2 bg-zinc-900/60 border-2 border-red-800/50 hover:bg-red-950/50 hover:border-red-700/70 text-gray-300 hover:text-white transition-all duration-300"
                      >
                        <ThumbsDown className="w-8 h-8 text-red-500" />
                        <span className="text-sm">Ruim</span>
                      </Button>
                      <Button
                        onClick={() => handleRateCard('satisfatoria')}
                        disabled={playCard.isPending}
                        variant="outline"
                        className="flex-col h-24 gap-2 bg-zinc-900/60 border-2 border-zinc-700/50 hover:bg-zinc-800/70 hover:border-zinc-600/70 text-gray-300 hover:text-white transition-all duration-300"
                      >
                        <Meh className="w-8 h-8 text-gray-400" />
                        <span className="text-sm">Satisfatória</span>
                      </Button>
                      <Button
                        onClick={() => handleRateCard('excelente')}
                        disabled={playCard.isPending}
                        variant="outline"
                        className="flex-col h-24 gap-2 bg-zinc-900/60 border-2 border-red-700/50 hover:bg-red-950/50 hover:border-red-600/70 text-gray-300 hover:text-white transition-all duration-300"
                      >
                        <ThumbsUp className="w-8 h-8 text-red-500" />
                        <span className="text-sm">Excelente</span>
                      </Button>
                    </div>
                    {playCard.isPending && (
                      <p className="text-center text-sm text-gray-400 mt-4">
                        Salvando avaliação...
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {isCardFlipped && !isMyTurn && (
                <Card className="w-full max-w-md bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-zinc-700/50">
                  <CardContent className="py-6 text-center">
                    <p className="text-gray-400">
                      Aguarde {currentTurnParticipant?.profile.user.name} avaliar sua resposta...
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="w-full max-w-md bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <CardContent className="py-12 text-center">
                {isMyTurn ? (
                  <>
                    <p className="mb-4 text-gray-300">
                      É sua vez! Clique no botão abaixo para pegar uma carta
                    </p>
                    <Button
                      onClick={handleFetchCard}
                      size="lg"
                      disabled={cardLoading}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50"
                    >
                      {cardLoading ? 'Buscando...' : '🎴 Buscar Carta'}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-gray-300">
                      Aguarde {currentTurnParticipant?.profile.user.name} pegar uma carta
                    </p>
                    <Button
                      size="lg"
                      disabled
                      variant="outline"
                      className="border-zinc-700 text-gray-500 cursor-not-allowed"
                    >
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
            className="mb-8 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-gray-300 hover:text-white border-2 border-zinc-700/50 hover:border-red-700/50 shadow-[0_0_15px_rgba(120,120,120,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all duration-500"
            size="lg"
          >
            {finishSession.isPending ? 'Finalizando...' : 'Finalizar Sessão'}
          </Button>
        </div>
      </div>
    </div>
  );
}
