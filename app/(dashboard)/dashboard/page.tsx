'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { useConnections } from '@/hooks/useConnections';
import { useSessionHistory } from '@/hooks/useSessions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, GamepadIcon, Star } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: connections } = useConnections('accepted');
  const { data: sessionHistory } = useSessionHistory();

  // If no profile, redirect to onboarding
  if (!profileLoading && !profile) {
    router.push('/onboarding');
    return null;
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Olá, {profile?.nickname || session?.user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo(a) ao seu painel de controle
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              O que você gostaria de fazer agora?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Link href="/new-session">
              <Button className="w-full h-20" size="lg">
                <GamepadIcon className="mr-2 h-5 w-5" />
                Iniciar Nova Sessão
              </Button>
            </Link>
            <Link href="/connections">
              <Button variant="outline" className="w-full h-20" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Ver Conexões
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
