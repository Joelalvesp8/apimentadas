'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnlineRound } from '@/hooks/useSessions';
import { ChevronLeft, ChevronRight, History, X, HelpCircle, Clock } from 'lucide-react';
import { OnlineAnswersDisplay } from './online-answers-display';

interface RoundHistoryViewerProps {
  rounds: OnlineRound[];
  currentRoundNumber: number | null;
  currentUserId?: string;
  onClose: () => void;
}

export function RoundHistoryViewer({
  rounds,
  currentRoundNumber,
  currentUserId,
  onClose,
}: RoundHistoryViewerProps) {
  // Começar com a última rodada completada ou primeira rodada
  const completedRounds = rounds.filter((r) => r.status === 'completed');
  const initialIndex = completedRounds.length > 0 ? completedRounds.length - 1 : 0;

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Filtrar apenas rodadas visíveis (onde o usuário pode ver a pergunta)
  const visibleRounds = rounds.filter((r) => r.metadata?.canSeeQuestion);

  if (visibleRounds.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/50">
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma rodada anterior disponível ainda.</p>
          <Button
            variant="outline"
            onClick={onClose}
            className="mt-4 bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800"
          >
            Fechar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedRound = visibleRounds[selectedIndex];
  const isCurrentRound = selectedRound?.roundNumber === currentRoundNumber;

  const goToPrevious = () => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => Math.min(visibleRounds.length - 1, prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-purple-700/50 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-white">
                Histórico de Rodadas
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={selectedIndex === 0}
              className="bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`border-zinc-600 ${
                  isCurrentRound ? 'bg-purple-700/20 border-purple-600 text-purple-300' : ''
                }`}
              >
                Rodada {selectedRound.roundNumber} de {visibleRounds.length}
              </Badge>
              {isCurrentRound && (
                <Badge className="bg-purple-700 border-purple-600">
                  Atual
                </Badge>
              )}
              {selectedRound.status === 'completed' && (
                <Badge className="bg-green-700 border-green-600">
                  Completa
                </Badge>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={selectedIndex === visibleRounds.length - 1}
              className="bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 disabled:opacity-50"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pergunta da rodada selecionada */}
      {selectedRound && (
        <>
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-purple-700/50 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HelpCircle className="w-8 h-8 text-purple-400 shrink-0" aria-hidden="true" />
                Pergunta da Rodada #{selectedRound.roundNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 border-2 border-purple-700/30 rounded-lg p-6 mb-4">
                <p className="text-xl text-white leading-relaxed">
                  {selectedRound.card?.content || 'Carregando pergunta...'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Badge variant="outline" className="border-zinc-600">
                  {selectedRound.card?.difficulty || 'N/A'}
                </Badge>
                <Badge variant="outline" className="border-zinc-600">
                  {selectedRound.card?.category || 'N/A'}
                </Badge>
                {selectedRound.metadata?.isCurrentUserTurn && (
                  <Badge className="bg-yellow-700 border-yellow-600">
                    Você virou esta carta
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Respostas (apenas para rodadas completadas) */}
          {selectedRound.status === 'completed' && selectedRound.answers && selectedRound.answers.length > 0 && (
            <OnlineAnswersDisplay
              answers={selectedRound.answers}
              currentUserId={currentUserId}
            />
          )}

          {/* Rodada em andamento */}
          {selectedRound.status === 'waiting' && (
            <Card className="bg-gradient-to-br from-yellow-950/20 to-yellow-900/10 border-2 border-yellow-700/50">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 text-yellow-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-yellow-300 font-semibold">
                  Rodada em andamento
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedRound.metadata?.totalAnswers || 0} de{' '}
                  {selectedRound.metadata?.totalParticipants || 0} participantes responderam
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
