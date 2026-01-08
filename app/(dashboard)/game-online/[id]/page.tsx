'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession as useAuthSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSession,
  useCurrentRound,
  useSessionStatus,
  useStartRound,
  useSubmitAnswer,
  useLeaveSession,
} from '@/hooks/useSessions';
import { useProfile } from '@/hooks/useProfile';
import { useGameNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OnlineAnswerCounter } from '@/components/online/online-answer-counter';
import { OnlineAnswersDisplay } from '@/components/online/online-answers-display';
import { ArrowLeft, Play, Send, CheckCircle, XCircle, Bell, BellOff } from 'lucide-react';

export default function GameOnlinePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const queryClient = useQueryClient();

  const { data: authSession } = useAuthSession();
  const { data: profile } = useProfile();
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: currentRound, isLoading: roundLoading } = useCurrentRound(sessionId);
  const { data: status } = useSessionStatus(sessionId);

  const startRound = useStartRound(sessionId);
  const submitAnswer = useSubmitAnswer(sessionId, currentRound?.id || '');
  const leaveSession = useLeaveSession();

  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notifications
  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    requestPermission,
    notifyYourTurn,
    notifyQuestionReady,
    notifyRoundCompleted,
  } = useGameNotifications();

  // Track previous state to detect changes
  const prevRoundRef = useRef<typeof currentRound>(null);
  const hasRequestedPermission = useRef(false);

  // Debug logs
  console.log('[GAME-ONLINE] Current round data:', {
    currentRound,
    hasCard: !!currentRound?.card,
    cardId: currentRound?.card?.id,
    cardContent: currentRound?.card?.content?.substring(0, 40),
    roundNumber: currentRound?.roundNumber,
    status: currentRound?.status,
  });

  // Check if current round is corrupted (exists but has no card)
  const isCurrentRoundCorrupted = currentRound && !currentRound.card;

  // Treat corrupted rounds as no round
  const effectiveCurrentRound = isCurrentRoundCorrupted ? null : currentRound;

  if (isCurrentRoundCorrupted) {
    console.error('[GAME-ONLINE] CORRUPTED ROUND DETECTED!', {
      roundId: currentRound.id,
      roundNumber: currentRound.roundNumber,
      hasCard: !!currentRound.card,
    });
  }

  // Request notification permission on mount
  useEffect(() => {
    if (notificationsSupported && notificationPermission === 'default' && !hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      requestPermission();
    }
  }, [notificationsSupported, notificationPermission, requestPermission]);

  // Detect round changes and send notifications
  useEffect(() => {
    if (!effectiveCurrentRound || !profile) return;

    const prevRound = prevRoundRef.current;

    // New round started
    if (!prevRound || prevRound.id !== effectiveCurrentRound.id) {
      const isMyTurn = effectiveCurrentRound.metadata?.isCurrentUserTurn;
      const canSee = effectiveCurrentRound.metadata?.canSeeQuestion;

      // Notify if it's user's turn to flip the card
      if (isMyTurn && !effectiveCurrentRound.metadata?.currentUserAnswered) {
        console.log('[NOTIFICATIONS] Your turn to flip card');
        notifyYourTurn(effectiveCurrentRound.roundNumber);
      }
      // Notify if question became available (someone else flipped)
      else if (!isMyTurn && canSee && prevRound?.metadata?.canSeeQuestion === false) {
        console.log('[NOTIFICATIONS] Question ready');
        notifyQuestionReady(
          effectiveCurrentRound.roundNumber,
          effectiveCurrentRound.metadata?.currentTurnUserNickname || 'Outro jogador'
        );
      }
    }

    // Round completed - all answered
    if (
      effectiveCurrentRound.status === 'completed' &&
      prevRound?.status === 'waiting'
    ) {
      console.log('[NOTIFICATIONS] Round completed');
      notifyRoundCompleted(effectiveCurrentRound.roundNumber);
    }

    // Question became visible (turn player answered)
    if (
      prevRound &&
      prevRound.id === effectiveCurrentRound.id &&
      !prevRound.metadata?.canSeeQuestion &&
      effectiveCurrentRound.metadata?.canSeeQuestion &&
      !effectiveCurrentRound.metadata?.isCurrentUserTurn &&
      !effectiveCurrentRound.metadata?.currentUserAnswered
    ) {
      console.log('[NOTIFICATIONS] Question now visible');
      notifyQuestionReady(
        effectiveCurrentRound.roundNumber,
        effectiveCurrentRound.metadata?.currentTurnUserNickname || 'Outro jogador'
      );
    }

    // Update ref
    prevRoundRef.current = effectiveCurrentRound;
  }, [effectiveCurrentRound, profile, notifyYourTurn, notifyQuestionReady, notifyRoundCompleted]);

  // Handle start round
  const handleStartRound = async () => {
    try {
      console.log('[GAME-ONLINE] Starting round...');
      const result = await startRound.mutateAsync();
      console.log('[GAME-ONLINE] Round started successfully:', result);
    } catch (error: any) {
      console.error('[GAME-ONLINE] Error starting round:', error);
      alert(error.message || 'Erro ao iniciar rodada');
    }
  };

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      alert('Por favor, escreva sua resposta');
      return;
    }

    if (!currentRound?.id) {
      alert('Nenhuma rodada ativa');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[GAME-ONLINE] Submitting answer...');
      await submitAnswer.mutateAsync({ answer: answerText });
      setAnswerText('');
      console.log('[GAME-ONLINE] Answer submitted successfully');

      // Force immediate refetch to show updated state
      // Use longer delay to ensure transaction completes
      console.log('[GAME-ONLINE] Scheduling refetch after answer submission');
      setTimeout(() => {
        console.log('[GAME-ONLINE] First refetch - checking round status');
        queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'rounds', 'current'] });
        queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'status'] });
      }, 1500); // Wait 1.5s for backend to process

      // Double-check after 3 seconds to ensure we catch the update
      setTimeout(() => {
        console.log('[GAME-ONLINE] Second refetch - ensuring status is updated');
        queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'rounds', 'current'] });
        queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'status'] });
      }, 3000);
    } catch (error: any) {
      console.error('[GAME-ONLINE] Error submitting answer:', error);
      alert(error.message || 'Erro ao enviar resposta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle leave session
  const handleLeaveSession = async () => {
    const confirm = window.confirm(
      'Tem certeza que deseja sair da sessão? Os outros participantes serão notificados.'
    );
    if (!confirm) return;

    try {
      await leaveSession.mutateAsync(sessionId);
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Erro ao sair da sessão');
    }
  };

  // Loading state
  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Verify it's an online session
  if (session.mode !== 'online') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sessão Inválida</h2>
            <p className="text-gray-400 mb-4">
              Esta não é uma sessão online. Use a página de jogo presencial.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-red-700 hover:bg-red-600"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRoundActive = effectiveCurrentRound && effectiveCurrentRound.status === 'waiting';
  const isRoundCompleted = effectiveCurrentRound && effectiveCurrentRound.status === 'completed';
  const canStartNext = status?.canStartNext || false;
  const hasAnswered = effectiveCurrentRound?.metadata?.currentUserAnswered || false;

  // Calculate who will have the turn in the NEXT round
  const participants = session.sessionParticipants || [];
  const nextRoundNumber = (effectiveCurrentRound?.roundNumber || 0) + 1;
  const nextTurnIndex = participants.length > 0 ? (nextRoundNumber - 1) % participants.length : 0;
  const nextTurnProfileId = participants.length > 0
    ? participants.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())[nextTurnIndex]?.profileId
    : null;
  const isMyTurnNext = profile?.id === nextTurnProfileId;

  // Debug: Log round status
  console.log('[GAME-ONLINE] Render state:', {
    hasCurrentRound: !!effectiveCurrentRound,
    roundStatus: effectiveCurrentRound?.status,
    roundNumber: effectiveCurrentRound?.roundNumber,
    isRoundActive,
    isRoundCompleted,
    canStartNext,
    hasAnswered,
    answersCount: effectiveCurrentRound?.answers?.length,
    totalParticipants: effectiveCurrentRound?.metadata?.totalParticipants,
  });

  // Prepare participants data for counter
  const answeredParticipants = effectiveCurrentRound?.answers?.map((a) => ({
    id: a.profile.id,
    nickname: a.profile.nickname,
    image: a.profile.user?.image || null,
  })) || [];

  const waitingParticipants = effectiveCurrentRound?.metadata?.waitingProfiles || [];

  return (
    <div className="min-h-screen bg-black py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {/* Notification status */}
            {notificationsSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={requestPermission}
                disabled={notificationPermission === 'granted'}
                className={`border-zinc-700/50 ${
                  notificationPermission === 'granted'
                    ? 'bg-green-900/40 border-green-700/50 text-green-400'
                    : notificationPermission === 'denied'
                    ? 'bg-red-900/40 border-red-700/50 text-red-400'
                    : 'bg-zinc-900/60 text-gray-400 hover:bg-zinc-800'
                }`}
                title={
                  notificationPermission === 'granted'
                    ? 'Notificações habilitadas'
                    : notificationPermission === 'denied'
                    ? 'Notificações bloqueadas - permita nas configurações do navegador'
                    : 'Clique para habilitar notificações'
                }
              >
                {notificationPermission === 'granted' ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              MODO ONLINE
            </Badge>
            <Badge variant="outline" className="border-zinc-600 text-gray-300">
              Rodada {currentRound?.roundNumber || 0}
            </Badge>
          </div>
        </div>

        {/* Session info card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Sessão: {session.sessionType === 'casal' ? 'Casal' : session.sessionType === 'trisal' ? 'Trisal' : 'Grupo'}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLeaveSession}
                disabled={leaveSession.isPending}
                className="bg-red-700 hover:bg-red-600"
              >
                {leaveSession.isPending ? 'Saindo...' : 'Sair da Sessão'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Participantes</p>
                <p className="text-2xl font-bold text-white">{status?.participantCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Rodadas</p>
                <p className="text-2xl font-bold text-white">{status?.completedRounds || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Cartas</p>
                <p className="text-2xl font-bold text-white">{status?.cardsPlayed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No active round - show start button only to first player */}
        {!effectiveCurrentRound && canStartNext && (
          <>
            {isMyTurnNext ? (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-yellow-700/50 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                <CardContent className="p-12 text-center">
                  <Play className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <Badge className="bg-yellow-700 border-yellow-600 mb-4">
                    Sua vez de virar a primeira carta!
                  </Badge>
                  <h2 className="text-2xl font-bold text-white mb-2">Pronto para começar?</h2>
                  <p className="text-gray-400 mb-6">
                    Clique no botão abaixo para sortear a primeira pergunta
                  </p>
                  <Button
                    onClick={handleStartRound}
                    disabled={startRound.isPending}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-lg px-8 py-6"
                  >
                    {startRound.isPending ? 'Sorteando...' : 'Virar Primeira Carta'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/50">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">⏳</div>
                  <h2 className="text-2xl font-bold text-gray-300 mb-2">Aguardando início...</h2>
                  <p className="text-gray-400">
                    {participants.find(p => p.profileId === nextTurnProfileId)?.profile?.nickname || 'Outro jogador'} irá virar a primeira carta
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Current round card */}
        {effectiveCurrentRound && (
          <>
            {/* Show "waiting for turn" message if user can't see question yet */}
            {!effectiveCurrentRound.metadata?.canSeeQuestion && (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-yellow-700/50 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🎴</div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-2">
                    Aguardando {effectiveCurrentRound.metadata?.currentTurnUserNickname} virar a carta...
                  </h3>
                  <p className="text-gray-400">
                    {effectiveCurrentRound.metadata?.currentTurnUserNickname} está virando a carta e responderá primeiro.
                    Quando {effectiveCurrentRound.metadata?.currentTurnUserNickname} responder, a pergunta aparecerá para você.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Show question only if user can see it */}
            {effectiveCurrentRound.metadata?.canSeeQuestion && (
              <>
                <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">❓</span>
                        Pergunta da Rodada #{effectiveCurrentRound.roundNumber}
                      </div>
                      {effectiveCurrentRound.metadata?.isCurrentUserTurn && (
                        <Badge className="bg-yellow-700 border-yellow-600">
                          Sua vez de virar!
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/40 border-2 border-red-700/30 rounded-lg p-6 mb-6">
                      <p className="text-xl text-white leading-relaxed">
                        {effectiveCurrentRound.card?.content || 'Carregando pergunta...'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Badge variant="outline" className="border-zinc-600">
                        {effectiveCurrentRound.card?.difficulty || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="border-zinc-600">
                        {effectiveCurrentRound.card?.category || 'N/A'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Answer counter */}
                <OnlineAnswerCounter
                  totalParticipants={effectiveCurrentRound.metadata?.totalParticipants || 0}
                  answeredCount={effectiveCurrentRound.metadata?.totalAnswers || 0}
                  waitingParticipants={waitingParticipants}
                  answeredParticipants={answeredParticipants}
                />
              </>
            )}

            {/* Answer form (only if round is active, user can see question, and hasn't answered) */}
            {isRoundActive && effectiveCurrentRound.metadata?.canSeeQuestion && !hasAnswered && (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                <CardHeader>
                  <CardTitle className="text-white">Sua Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    rows={5}
                    className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white focus:border-red-600/80 mb-4 resize-none"
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {answerText.length}/1000 caracteres
                    </span>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !answerText.trim()}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      {isSubmitting ? (
                        'Enviando...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Resposta
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User already answered - waiting for others */}
            {isRoundActive && hasAnswered && (
              <Card className="bg-gradient-to-br from-green-950/20 to-green-900/10 border-2 border-green-700/50">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-300 mb-2">Resposta Enviada!</h3>
                  <p className="text-gray-400">
                    Aguardando os outros participantes responderem...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Show all answers when round is completed */}
            {isRoundCompleted && effectiveCurrentRound?.answers && (
              <>
                <OnlineAnswersDisplay
                  answers={effectiveCurrentRound.answers || []}
                  currentUserId={profile?.id}
                />

                {/* Next round button - only show to the player whose turn is next */}
                {canStartNext && isMyTurnNext && (
                  <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-yellow-700/50 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                    <CardContent className="p-6 text-center">
                      <div className="mb-4">
                        <Badge className="bg-yellow-700 border-yellow-600 mb-2">
                          Sua vez de virar a próxima carta!
                        </Badge>
                      </div>
                      <Button
                        onClick={handleStartRound}
                        disabled={startRound.isPending}
                        size="lg"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-lg px-8"
                      >
                        {startRound.isPending ? (
                          'Sorteando...'
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Virar Próxima Carta
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Show waiting message to other players */}
                {canStartNext && !isMyTurnNext && (
                  <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">⏳</div>
                      <h3 className="text-lg font-bold text-gray-300 mb-2">
                        Aguardando próxima rodada...
                      </h3>
                      <p className="text-sm text-gray-400">
                        {participants.find(p => p.profileId === nextTurnProfileId)?.profile?.nickname || 'Outro jogador'} irá virar a próxima carta
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
