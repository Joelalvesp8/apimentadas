'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExploreUsers, useRequestConnection, useSendInvitation } from '@/hooks/useSocial';
import { UserListItem } from '@/components/explore/user-list-item';
import { Search, Loader2, Filter, HelpCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GameTour } from '@/components/tour/game-tour';
import { useTour } from '@/hooks/useTour';
import { exploreTourSteps } from '@/lib/tour-steps';

export default function ExplorePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [orientation, setOrientation] = useState<string>('');

  const { data: users, isLoading, error } = useExploreUsers(search, orientation || undefined);
  const requestConnection = useRequestConnection();
  const sendInvitation = useSendInvitation();

  const { isTourActive, hasCompletedTour, startTour, completeTour, skipTour } = useTour();

  // Iniciar tour automaticamente para novos usuários
  useEffect(() => {
    if (!hasCompletedTour) {
      // Aguardar 1 segundo para garantir que a página está completamente carregada
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour, startTour]);

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
    <div className="min-h-screen bg-black">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3" data-tour="explore-header">
            {/* Search Input */}
            <div className="flex-1 relative" data-tour="search-input">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar @nickname..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-red-700 rounded-lg h-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <Select value={orientation} onValueChange={setOrientation}>
              <SelectTrigger className="w-10 h-10 bg-zinc-900 border-zinc-800 text-white focus:border-red-700 p-0 flex items-center justify-center">
                <Filter className="w-4 h-4" />
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

            {/* Tutorial Button */}
            {hasCompletedTour && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startTour}
                className="w-10 h-10 p-0 text-red-400 hover:bg-red-950/30 hover:text-red-300"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            <span className="ml-3 text-gray-400 text-sm">Carregando usuários...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="m-4 bg-red-950/20 border-red-700/40 p-4 text-center">
            <p className="text-red-400 text-sm">Erro ao carregar usuários. Tente novamente.</p>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && users && users.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Nenhum usuário encontrado</p>
            <p className="text-gray-600 text-xs">
              {search ? 'Tente outro termo de busca' : 'Seja o primeiro a se conectar!'}
            </p>
          </div>
        )}

        {/* Users List */}
        {!isLoading && !error && users && users.length > 0 && (
          <div className="divide-y divide-zinc-800" data-tour="online-users">
            {users.map((user) => (
              <UserListItem
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
          <div className="text-center py-4">
            <p className="text-xs text-gray-600">
              {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
            </p>
          </div>
        )}
      </div>

      {/* Tour Component */}
      {isTourActive && (
        <GameTour
          steps={exploreTourSteps}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
    </div>
  );
}
