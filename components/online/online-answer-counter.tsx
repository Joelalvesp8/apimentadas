'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock } from 'lucide-react';

interface Participant {
  id: string;
  nickname: string;
  image: string | null;
}

interface OnlineAnswerCounterProps {
  totalParticipants: number;
  answeredCount: number;
  waitingParticipants: Participant[];
  answeredParticipants?: Participant[];
}

export function OnlineAnswerCounter({
  totalParticipants,
  answeredCount,
  waitingParticipants,
  answeredParticipants = [],
}: OnlineAnswerCounterProps) {
  const allAnswered = answeredCount === totalParticipants;

  return (
    <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${allAnswered ? 'bg-green-900/40' : 'bg-yellow-900/40'}`}>
              {allAnswered ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {allAnswered ? 'Todos responderam!' : 'Aguardando respostas'}
              </h3>
              <p className="text-sm text-gray-400">
                {answeredCount}/{totalParticipants} participantes
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  allAnswered ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${(answeredCount / totalParticipants) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-white">
              {Math.round((answeredCount / totalParticipants) * 100)}%
            </span>
          </div>
        </div>

        {/* Participants list */}
        <div className="grid grid-cols-2 gap-3">
          {/* Answered participants */}
          {answeredParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-green-950/20 border border-green-700/30"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={participant.image || undefined} />
                <AvatarFallback className="bg-green-900 text-green-200">
                  {participant.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-green-300 flex-1 truncate">
                {participant.nickname}
              </span>
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            </div>
          ))}

          {/* Waiting participants */}
          {waitingParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-700/30"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={participant.image || undefined} />
                <AvatarFallback className="bg-zinc-800 text-gray-300">
                  {participant.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-400 flex-1 truncate">
                {participant.nickname}
              </span>
              <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
