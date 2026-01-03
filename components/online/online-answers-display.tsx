'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Answer {
  id: string;
  answer: string;
  answeredAt: string;
  profile: {
    id: string;
    nickname: string;
    user: {
      image: string | null;
    };
  };
}

interface OnlineAnswersDisplayProps {
  answers: Answer[];
  currentUserId?: string;
}

export function OnlineAnswersDisplay({
  answers,
  currentUserId,
}: OnlineAnswersDisplayProps) {
  if (answers.length === 0) {
    return null;
  }

  // Sort answers by timestamp (oldest first)
  const sortedAnswers = [...answers].sort(
    (a, b) => new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="text-red-500">💬</span>
        Respostas dos Participantes
      </h3>

      <div className="space-y-3">
        {sortedAnswers.map((answer, index) => {
          const isCurrentUser = currentUserId === answer.profile.id;

          return (
            <Card
              key={answer.id}
              className={`bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 transition-all duration-300 ${
                isCurrentUser
                  ? 'border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                  : 'border-zinc-700/40 hover:border-red-700/30'
              }`}
            >
              <CardContent className="p-4">
                {/* Header with avatar and info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={answer.profile.user?.image || undefined} />
                      <AvatarFallback className="bg-red-900 text-red-200">
                        {answer.profile.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Badge showing answer order */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-700 border-2 border-black rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        {answer.profile.nickname}
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 bg-red-600/30 border border-red-600/50 rounded-full text-red-300">
                            Você
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatDistanceToNow(new Date(answer.answeredAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answer content */}
                <div className="pl-15">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {answer.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
