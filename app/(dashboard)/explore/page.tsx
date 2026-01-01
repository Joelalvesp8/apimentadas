'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useExploreUsers } from '@/hooks/useSocial';
import { Search, Users, TrendingUp, Clock, Star, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ExplorePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'activity' | 'rating'>('activity');

  const { data: users, isLoading, error } = useExploreUsers(search, sortBy);

  return (
    <div className="min-h-screen bg-black py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-900/40 rounded-lg">
                  <Users className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                    <span className="text-red-500">🔥</span>
                    Explorar Usuários
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    Descubra pessoas ativas na comunidade
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search and filters */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por @apelido..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-700"
                />
              </div>

              {/* Sort buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setSortBy('activity')}
                  variant={sortBy === 'activity' ? 'default' : 'outline'}
                  className={
                    sortBy === 'activity'
                      ? 'bg-red-700 hover:bg-red-800 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700'
                  }
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Atividade
                </Button>
                <Button
                  onClick={() => setSortBy('rating')}
                  variant={sortBy === 'rating' ? 'default' : 'outline'}
                  className={
                    sortBy === 'rating'
                      ? 'bg-red-700 hover:bg-red-800 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700'
                  }
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Avaliação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="ml-3 text-gray-400">Carregando usuários...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="bg-red-950/20 border-2 border-red-700/40">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">Erro ao carregar usuários. Tente novamente.</p>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && users && users.length === 0 && (
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-2">Nenhum usuário encontrado</p>
              <p className="text-sm text-gray-500">
                {search ? 'Tente outro termo de busca' : 'Seja o primeiro a se conectar!'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Users grid */}
        {!isLoading && !error && users && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card
                key={user.id}
                onClick={() => router.push(`/users/${user.nickname}`)}
                className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6">
                  {/* Avatar and info */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-red-700/30 group-hover:border-red-700/60 transition-colors">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-red-900 text-red-200 text-xl">
                        {user.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-red-400 transition-colors">
                        @{user.nickname}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{user.name}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4 min-h-[40px]">
                      {user.bio}
                    </p>
                  )}

                  {/* Orientation badge */}
                  {user.orientation && (
                    <div className="mb-4">
                      <Badge
                        variant="outline"
                        className="bg-zinc-800/50 border-zinc-700 text-gray-300"
                      >
                        {user.orientation}
                      </Badge>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-gray-400">Sessões</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {user.sessionsPlayed}
                      </p>
                    </div>

                    <div className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-400">Avaliação</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {user.averageRating
                          ? user.averageRating.toFixed(1)
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Last active */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      Ativo{' '}
                      {formatDistanceToNow(new Date(user.lastActiveAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && !error && users && users.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Mostrando {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
