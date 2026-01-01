'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePublicProfile } from '@/hooks/useSocial';
import {
  ArrowLeft,
  Users,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  Loader2,
  MapPin,
  Wifi,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const nickname = params.nickname as string;

  const { data: profile, isLoading, error } = usePublicProfile(nickname);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <span className="text-gray-400 text-lg">Carregando perfil...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-950/20 border-2 border-red-700/40">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-red-400 mb-4">Usuário não encontrado</p>
              <Button
                onClick={() => router.push('/explore')}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Explorar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Profile header */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <Avatar className="w-32 h-32 border-4 border-red-700/50">
                <AvatarImage src={profile.image || undefined} />
                <AvatarFallback className="bg-red-900 text-red-200 text-4xl">
                  {profile.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      @{profile.nickname}
                    </h1>
                  </div>

                  {profile.isConnected && (
                    <Badge className="bg-green-900/40 border-green-700/50 text-green-300">
                      ✓ Conectado
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-300 mb-4 leading-relaxed">{profile.bio}</p>
                )}

                {/* Orientation */}
                {profile.orientation && (
                  <div className="mb-4">
                    <Badge
                      variant="outline"
                      className="bg-zinc-800/50 border-zinc-700 text-gray-300"
                    >
                      {profile.orientation}
                    </Badge>
                  </div>
                )}

                {/* Member since */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Membro desde{' '}
                    {format(new Date(profile.memberSince), "d 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sessions played */}
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-900/40 rounded-lg">
                  <Users className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Sessões Jogadas</p>
                  <p className="text-3xl font-bold text-white">
                    {profile.sessionsPlayed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average rating */}
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-900/40 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Avaliação Média</p>
                  <p className="text-3xl font-bold text-white">
                    {profile.averageRating
                      ? profile.averageRating.toFixed(1)
                      : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last active */}
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/40 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Última Atividade</p>
                  <p className="text-lg font-bold text-white">
                    {formatDistanceToNow(new Date(profile.lastActiveAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent sessions */}
        {profile.recentSessions && profile.recentSessions.length > 0 && (
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-red-500" />
                Sessões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {profile.recentSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="bg-zinc-800/40 border-zinc-700/40 hover:border-red-700/30 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Session type icon */}
                          <div className="p-2 bg-red-900/30 rounded-lg">
                            {session.mode === 'online' ? (
                              <Wifi className="w-5 h-5 text-red-400" />
                            ) : (
                              <MapPin className="w-5 h-5 text-red-400" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white capitalize">
                                {session.sessionType}
                              </h4>
                              <Badge
                                variant="outline"
                                className="bg-zinc-900/50 border-zinc-700 text-gray-300 text-xs"
                              >
                                {session.mode === 'online' ? 'Online' : 'Presencial'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {session.finishedAt
                                ? format(
                                    new Date(session.finishedAt),
                                    "d 'de' MMM 'de' yyyy",
                                    { locale: ptBR }
                                  )
                                : format(
                                    new Date(session.createdAt),
                                    "d 'de' MMM 'de' yyyy",
                                    { locale: ptBR }
                                  )}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        {session.averageRating && (
                          <div className="flex items-center gap-1 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-yellow-400">
                              {session.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Session stats */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{session.participantCount} participantes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{session.cardsPlayed} cartas</span>
                        </div>
                      </div>

                      {/* Participants avatars */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Participantes:</span>
                        <div className="flex -space-x-2">
                          {session.participants.slice(0, 5).map((participant) => (
                            <Avatar
                              key={participant.id}
                              className="w-8 h-8 border-2 border-zinc-900"
                            >
                              <AvatarImage src={participant.image || undefined} />
                              <AvatarFallback className="bg-zinc-700 text-gray-300 text-xs">
                                {participant.nickname.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {session.participants.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center">
                              <span className="text-xs text-gray-300">
                                +{session.participants.length - 5}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No sessions */}
        {profile.recentSessions && profile.recentSessions.length === 0 && (
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-2">Nenhuma sessão concluída ainda</p>
              <p className="text-sm text-gray-500">
                Este usuário ainda não completou nenhuma sessão.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
