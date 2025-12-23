'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

  // Only redirect to onboarding if profile truly doesn't exist (404 error)
  // Don't redirect if there's a temporary error or if profile has nickname
  if (!profileLoading && !profile && profileError) {
    // Check if it's a 404 error (profile doesn't exist)
    const errorMessage = String(profileError);
    if (errorMessage.includes('404') || errorMessage.includes('não encontrado')) {
      router.push('/onboarding');
      return null;
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            Olá, {profile?.nickname || session?.user?.name}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Bem-vindo(a) ao seu painel de controle
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conexões</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConnections}</div>
              <p className="text-xs text-muted-foreground">
                Amigos conectados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sessões Jogadas
              </CardTitle>
              <GamepadIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Sessões completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rating Médio
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating}</div>
              <p className="text-xs text-muted-foreground">De 5 estrelas</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        {activeSessions && activeSessions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    Sessões Ativas
                  </CardTitle>
                  <CardDescription>
                    Você foi convidado para {activeSessions.length} sessão(ões)
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-purple-500">
                  {activeSessions.length} {activeSessions.length === 1 ? 'sessão' : 'sessões'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSessions.map((gameSession) => {
                  const isMyTurn = gameSession.currentTurnProfileId === profile?.id;
                  return (
                    <Link key={gameSession.id} href={`/game/${gameSession.id}`}>
                      <div className={`p-4 border rounded-lg cursor-pointer transition hover:shadow-md ${
                        isMyTurn ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isMyTurn ? 'default' : 'secondary'} className={isMyTurn ? 'bg-green-600' : ''}>
                                {gameSession.sessionType === 'casal' ? 'Casal' : gameSession.sessionType === 'trisal' ? 'Trisal' : 'Grupo'}
                              </Badge>
                              {isMyTurn && (
                                <Badge className="bg-green-600">🎯 Sua vez!</Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {gameSession.cardsPlayed} cartas jogadas
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Participantes:</p>
                              <div className="flex -space-x-2">
                                {gameSession.sessionParticipants.slice(0, 3).map((participant) => (
                                  <Avatar key={participant.id} className="w-8 h-8 border-2 border-white">
                                    <AvatarImage src={participant.profile.user.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {participant.profile.nickname[0].toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {gameSession.sessionParticipants.length > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                    <span className="text-xs font-medium">+{gameSession.sessionParticipants.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant={isMyTurn ? "default" : "outline"} className={isMyTurn ? "bg-green-600 hover:bg-green-700" : ""}>
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
          <Card className="mb-8 border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Shield className="h-6 w-6" />
                    Painel Administrativo
                  </CardTitle>
                  <CardDescription>
                    Gerencie cartas criadas pelos usuários
                  </CardDescription>
                </div>
                <Badge className="bg-purple-600">Admin</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                  <Shield className="mr-2 h-5 w-5" />
                  Acessar Painel Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              O que você gostaria de fazer agora?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Link href="/new-session" className="w-full">
              <Button className="w-full h-24 md:h-20 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                <GamepadIcon className="h-5 w-5 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm text-center leading-tight">Iniciar Nova Sessão</span>
              </Button>
            </Link>
            <Link href="/connections" className="w-full">
              <Button variant="outline" className="w-full h-24 md:h-20 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                <Users className="h-5 w-5 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm text-center leading-tight">Ver Conexões</span>
              </Button>
            </Link>
            <Link href="/create-card" className="w-full">
              <Button variant="outline" className="w-full h-24 md:h-20 border-purple-300 hover:bg-purple-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                <span className="text-xl md:text-xl">🎴</span>
                <span className="text-xs md:text-sm text-center leading-tight">Criar Carta</span>
              </Button>
            </Link>
            <Link href="/profile" className="w-full">
              <Button variant="outline" className="w-full h-24 md:h-20 border-blue-300 hover:bg-blue-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
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
