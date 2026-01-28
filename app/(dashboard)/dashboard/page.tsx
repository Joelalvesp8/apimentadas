'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useConnections } from '@/hooks/useConnections';
import { useSessionHistory, useActiveSessions } from '@/hooks/useSessions';
import { useIsAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, GamepadIcon, Star, Clock, Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: connections } = useConnections('accepted');
  const { data: sessionHistory } = useSessionHistory();
  const { data: activeSessions, isLoading: activeSessionsLoading } = useActiveSessions();
  const { data: adminData } = useIsAdmin();

  // Redirect admin to admin panel - admins don't participate in the game
  useEffect(() => {
    if (adminData?.isAdmin) {
      console.log('[DEBUG] Dashboard - User is admin, redirecting to admin panel');
      router.push('/admin');
    }
  }, [adminData, router]);

  // Only redirect to onboarding if profile truly doesn't exist (404 error)
  useEffect(() => {
    if (!profileLoading && !profile && profileError) {
      const errorMessage = String(profileError);
      console.log('[DEBUG] Dashboard - Profile check failed:', {
        profileLoading,
        hasProfile: !!profile,
        errorMessage
      });

      if (errorMessage.includes('404') || errorMessage.includes('não encontrado')) {
        console.log('[DEBUG] Dashboard - Redirecting to onboarding (404 error)');
        router.push('/onboarding');
      } else {
        console.log('[DEBUG] Dashboard - NOT redirecting, error is not 404');
      }
    } else {
      console.log('[DEBUG] Dashboard - Profile status:', {
        profileLoading,
        hasProfile: !!profile,
        nickname: profile?.nickname
      });
    }
  }, [profileLoading, profile, profileError, router]);

  const totalConnections = connections?.length || 0;
  const totalSessions = sessionHistory?.length || 0;
  const averageRating =
    sessionHistory && sessionHistory.length > 0
      ? (
          sessionHistory.reduce(
            (sum, s) => sum + (s.averageRating || 0),
            0
          ) / sessionHistory.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen p-3 md:p-4 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.3)]">
            Olá, {profile?.nickname || session?.user?.name}!
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Bem-vindo(a) ao seu painel de controle
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Conexões</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalConnections}</div>
              <p className="text-xs text-gray-500">
                Amigos conectados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Sessões Jogadas
              </CardTitle>
              <GamepadIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalSessions}</div>
              <p className="text-xs text-gray-500">
                Sessões completadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Rating Médio
              </CardTitle>
              <Star className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{averageRating}</div>
              <p className="text-xs text-gray-500">De 5 estrelas</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        {activeSessions && activeSessions.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-red-500" />
                    Sessões Ativas
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Você foi convidado para {activeSessions.length} sessão(ões)
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-red-900/50 border-red-700/50 text-red-200">
                  {activeSessions.length} {activeSessions.length === 1 ? 'sessão' : 'sessões'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSessions.map((gameSession) => {
                  const isMyTurn = gameSession.currentTurnProfileId === profile?.id;
                  const gameUrl = gameSession.mode === 'online' ? `/game-online/${gameSession.id}` : `/game/${gameSession.id}`;
                  return (
                    <Link key={gameSession.id} href={gameUrl}>
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        isMyTurn
                          ? 'border-red-700/60 bg-zinc-900/60 shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:shadow-[0_0_35px_rgba(220,38,38,0.4)]'
                          : 'border-zinc-700/50 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-600/60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isMyTurn ? 'default' : 'secondary'} className={isMyTurn ? 'bg-red-900/50 border-red-700/50 text-red-200' : 'bg-zinc-800 border-zinc-700 text-gray-300'}>
                                {gameSession.sessionType === 'casal' ? 'Casal' : gameSession.sessionType === 'trisal' ? 'Trisal' : 'Grupo'}
                              </Badge>
                              <Badge variant="outline" className={gameSession.mode === 'online' ? 'border-blue-700/50 text-blue-300 bg-blue-950/20' : 'border-zinc-600 text-gray-400 bg-zinc-900/20'}>
                                {gameSession.mode === 'online' ? '🌐 Online' : '📍 Local'}
                              </Badge>
                              {isMyTurn && (
                                <Badge className="bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">🎯 Sua vez!</Badge>
                              )}
                              <span className="text-sm text-gray-400">
                                {gameSession.cardsPlayed} cartas jogadas
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-300">Participantes:</p>
                              <div className="flex -space-x-2">
                                {gameSession.sessionParticipants.slice(0, 3).map((participant) => (
                                  <Avatar key={participant.id} className="w-8 h-8 border-2 border-zinc-900">
                                    <AvatarImage src={participant.profile.user.image || undefined} />
                                    <AvatarFallback className="text-xs bg-zinc-800 text-gray-300">
                                      {participant.profile.nickname[0].toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {gameSession.sessionParticipants.length > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-300">+{gameSession.sessionParticipants.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={isMyTurn ? "default" : "outline"}
                            className={isMyTurn
                              ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                              : "border-zinc-600 text-gray-300 hover:bg-zinc-800"
                            }
                          >
                            {isMyTurn ? 'Jogar Agora' : 'Entrar'}
                          </Button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Panel */}
        {adminData?.isAdmin && (
          <Card className="mb-8 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/60 shadow-[0_0_50px_rgba(220,38,38,0.4)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
                    <Shield className="h-6 w-6 text-red-500" />
                    Painel Administrativo
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie cartas criadas pelos usuários
                  </CardDescription>
                </div>
                <Badge className="bg-red-900/50 border-red-700/50 text-red-200">Admin</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50" size="lg">
                  <Shield className="mr-2 h-5 w-5" />
                  Acessar Painel Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
            <CardDescription className="text-gray-400">
              O que você gostaria de fazer agora?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Link href="/new-session" className="w-full">
              <Button className="w-full h-24 md:h-20 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-500 border-2 border-red-600/50">
                <GamepadIcon className="h-5 w-5 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm text-center leading-tight">Iniciar Nova Sessão</span>
              </Button>
            </Link>
            <Link href="/connections" className="w-full">
              <Button variant="outline" className="w-full h-24 md:h-20 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300">
                <Users className="h-5 w-5 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm text-center leading-tight">Ver Conexões</span>
              </Button>
            </Link>
            <Link href="/create-card" className="w-full" data-tour="create-card">
              <Button variant="outline" className="w-full h-24 md:h-20 bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-red-700/50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all duration-300">
                <span className="text-xl md:text-xl">🎴</span>
                <span className="text-xs md:text-sm text-center leading-tight">Criar Carta</span>
              </Button>
            </Link>
            <Link href="/profile" className="w-full">
              <Button variant="outline" className="w-full h-24 md:h-20 bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-zinc-600 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all duration-300">
                <User className="h-5 w-5 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm text-center leading-tight">Meu Perfil</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
