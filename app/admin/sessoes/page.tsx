'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Gamepad2,
  PlayCircle,
  CheckCircle,
  Trophy,
  AlertCircle,
  Users,
  Clock,
} from 'lucide-react';

interface UserStat {
  profileId: string;
  nickname: string;
  email: string;
  sessionsCount: number;
}

interface RecentSession {
  id: string;
  sessionType: string;
  mode: string;
  status: string;
  cardsPlayed: number;
  createdAt: string;
  finishedAt: string | null;
  participants: { profileId: string; nickname: string }[];
}

interface SessionsData {
  totalSessions: number;
  activeSessions: number;
  finishedSessions: number;
  neverPlayedCount: number;
  userStats: UserStat[];
  recentSessions: RecentSession[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const sessionTypeLabels: Record<string, string> = {
  casal: 'Casal',
  trisal: 'Trisal',
  grupo: 'Grupo',
};

const modeLabels: Record<string, string> = {
  local: 'Local',
  online: 'Online',
};

export default function SessoesPage() {
  const { data, isLoading, error } = useQuery<SessionsData>({
    queryKey: ['admin-sessions-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/sessions-stats');
      if (!res.ok) throw new Error('Erro ao carregar dados');
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-lg">Carregando sessões...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-400 text-lg">Erro ao carregar dados de sessões.</div>
      </div>
    );
  }

  const neverPlayed = data.userStats.filter((u) => u.sessionsCount === 0);
  const activePlayers = data.userStats.filter((u) => u.sessionsCount > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Painel de Sessões</h1>
        <p className="text-gray-400 text-sm">Histórico e engajamento dos jogadores</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="bg-zinc-900/80 border-red-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gamepad2 className="h-4 w-4 text-red-400" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.totalSessions}</div>
            <p className="text-xs text-gray-500 mt-0.5">sessões criadas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-green-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="h-4 w-4 text-green-400" />
              <span className="text-xs text-gray-400">Ativas</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.activeSessions}</div>
            <p className="text-xs text-gray-500 mt-0.5">em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-blue-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-gray-400">Finalizadas</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.finishedSessions}</div>
            <p className="text-xs text-gray-500 mt-0.5">concluídas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-yellow-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Sem jogo</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.neverPlayedCount}</div>
            <p className="text-xs text-gray-500 mt-0.5">nunca jogaram</p>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking dos jogadores */}
        <Card className="bg-zinc-900/80 border-zinc-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              Ranking de Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activePlayers.length === 0 ? (
              <div className="px-4 pb-4 text-gray-500 text-sm">Nenhum jogador ainda.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {activePlayers.map((user, index) => (
                  <div key={user.profileId} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={`text-sm font-bold w-6 text-center ${
                        index === 0
                          ? 'text-yellow-400'
                          : index === 1
                            ? 'text-gray-300'
                            : index === 2
                              ? 'text-amber-600'
                              : 'text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        @{user.nickname}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-red-700/50 text-red-400 text-xs shrink-0"
                    >
                      {user.sessionsCount} {user.sessionsCount === 1 ? 'sessão' : 'sessões'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nunca jogaram */}
        <Card className="bg-zinc-900/80 border-zinc-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              Nunca Jogaram ({neverPlayed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {neverPlayed.length === 0 ? (
              <div className="px-4 pb-4 text-green-400 text-sm">
                Todos os usuários já jogaram!
              </div>
            ) : (
              <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                {neverPlayed.map((user) => (
                  <div key={user.profileId} className="flex items-center gap-3 px-4 py-2.5">
                    <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        @{user.nickname}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-yellow-700/50 text-yellow-600 text-xs shrink-0"
                    >
                      0 sessões
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessões recentes */}
      <Card className="bg-zinc-900/80 border-zinc-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            Sessões Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentSessions.length === 0 ? (
            <div className="px-4 pb-4 text-gray-500 text-sm">Nenhuma sessão registrada.</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {data.recentSessions.map((session) => (
                <div key={session.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            session.status === 'active'
                              ? 'border-green-700/50 text-green-400'
                              : 'border-zinc-600 text-gray-400'
                          }`}
                        >
                          {session.status === 'active' ? '● Ativa' : '✓ Finalizada'}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          {sessionTypeLabels[session.sessionType] || session.sessionType}
                          {' · '}
                          {modeLabels[session.mode] || session.mode}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {session.cardsPlayed} cartas
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <Users className="h-3 w-3 text-gray-500 shrink-0" />
                        <span className="text-gray-400 text-xs">
                          {session.participants.map((p) => `@${p.nickname}`).join(', ') ||
                            'Sem participantes'}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs shrink-0 mt-0.5">
                      {formatDate(session.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
