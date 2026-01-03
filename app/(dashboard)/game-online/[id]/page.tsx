'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession as useAuthSession } from 'next-auth/react';
import {
  useSession,
  useCurrentRound,
  useSessionStatus,
  useStartRound,
  useSubmitAnswer,
  useLeaveSession,
} from '@/hooks/useSessions';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OnlineAnswerCounter } from '@/components/online/online-answer-counter';
import { OnlineAnswersDisplay } from '@/components/online/online-answers-display';
import { ArrowLeft, Play, Send, CheckCircle, XCircle } from 'lucide-react';

export default function GameOnlinePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

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

  // Handle start round
  const handleStartRound = async () => {
    try {
      await startRound.mutateAsync();
    } catch (error: any) {
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
      await submitAnswer.mutateAsync({ answer: answerText });
      setAnswerText('');
      alert('Resposta enviada com sucesso!');
    } catch (error: any) {
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

  const isRoundActive = currentRound && currentRound.status === 'waiting';
  const isRoundCompleted = currentRound && currentRound.status === 'completed';
  const canStartNext = status?.canStartNext || false;
  const hasAnswered = currentRound?.metadata?.currentUserAnswered || false;

  // Prepare participants data for counter
  const answeredParticipants = currentRound?.answers?.map((a) => ({
    id: a.profile.id,
    nickname: a.profile.nickname,
    image: a.profile.user?.image || null,
  })) || [];

  const waitingParticipants = currentRound?.metadata?.waitingProfiles || [];

  return (
    <div className="min-h-screen bg-black py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

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

        {/* No active round - show start button */}
        {!currentRound && canStartNext && (
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
            <CardContent className="p-12 text-center">
              <Play className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Pronto para começar?</h2>
              <p className="text-gray-400 mb-6">
                Clique no botão abaixo para sortear a primeira pergunta
              </p>
              <Button
                onClick={handleStartRound}
                disabled={startRound.isPending}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-lg px-8 py-6"
              >
                {startRound.isPending ? 'Sorteando...' : 'Iniciar Primeira Rodada'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current round card */}
        {currentRound && (
          <>
            <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-3xl">❓</span>
                  Pergunta da Rodada #{currentRound.roundNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black/40 border-2 border-red-700/30 rounded-lg p-6 mb-6">
                  <p className="text-xl text-white leading-relaxed">
                    {currentRound.card.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Badge variant="outline" className="border-zinc-600">
                    {currentRound.card.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-zinc-600">
                    {currentRound.card.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Answer counter */}
            <OnlineAnswerCounter
              totalParticipants={currentRound.metadata?.totalParticipants || 0}
              answeredCount={currentRound.metadata?.totalAnswers || 0}
              waitingParticipants={waitingParticipants}
              answeredParticipants={answeredParticipants}
            />

            {/* Answer form (only if round is active and user hasn't answered) */}
            {isRoundActive && !hasAnswered && (
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
            {isRoundCompleted && currentRound?.answers && (
              <>
                <OnlineAnswersDisplay
                  answers={currentRound.answers || []}
                  currentUserId={profile?.id}
                />

                {/* Next round button */}
                {canStartNext && (
                  <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50">
                    <CardContent className="p-6 text-center">
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
                            Próxima Pergunta
                          </>
                        )}
                      </Button>
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
