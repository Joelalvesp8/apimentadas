'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExploreUsers, useRequestConnection, useSendInvitation } from '@/hooks/useSocial';
import { UserCard } from '@/components/explore/user-card';
import { Search, Users, Loader2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ExplorePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [orientation, setOrientation] = useState<string>('');

  const { data: users, isLoading, error } = useExploreUsers(search, orientation || undefined);
  const requestConnection = useRequestConnection();
  const sendInvitation = useSendInvitation();

  const handleConnect = async (userId: string) => {
    try {
      await requestConnection.mutateAsync(userId);
      toast({
        title: 'Solicitação enviada!',
        description: 'A solicitação de conexão foi enviada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao conectar',
        description: error.message || 'Não foi possível enviar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const handleInvite = async (userId: string) => {
    try {
      // For now, default to 'casal' type - you can add a modal to select type later
      await sendInvitation.mutateAsync({
        receiverId: userId,
        sessionType: 'casal',
        message: 'Vamos jogar juntos?',
      });
      toast({
        title: 'Convite enviado!',
        description: 'O convite para sessão foi enviado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao convidar',
        description: error.message || 'Não foi possível enviar o convite.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-black py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-900/40 rounded-lg">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                  Explorar Usuários
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Descubra pessoas ativas na comunidade
                </p>
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
                  placeholder="Buscar por apelido ou biografia..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-700"
                />
              </div>

              {/* Orientation filter */}
              <div className="w-full md:w-64">
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:border-red-700">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Todas as orientações" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="all" className="text-white hover:bg-zinc-800">
                      Todas as orientações
                    </SelectItem>
                    <SelectItem value="heterosexual" className="text-white hover:bg-zinc-800">
                      Heterossexual
                    </SelectItem>
                    <SelectItem value="homosexual" className="text-white hover:bg-zinc-800">
                      Homossexual
                    </SelectItem>
                    <SelectItem value="bisexual" className="text-white hover:bg-zinc-800">
                      Bissexual
                    </SelectItem>
                    <SelectItem value="other" className="text-white hover:bg-zinc-800">
                      Outro
                    </SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Users grid with UserCard component */}
        {!isLoading && !error && users && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onConnect={handleConnect}
                onInvite={handleInvite}
              />
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
