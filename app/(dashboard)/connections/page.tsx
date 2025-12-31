'use client';

import { useState } from 'react';
import { useConnections, useUpdateConnection, useDeleteConnection } from '@/hooks/useConnections';
import { useSearchProfiles, useProfile } from '@/hooks/useProfile';
import { useCreateConnection } from '@/hooks/useConnections';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: myProfile } = useProfile();
  const { data: acceptedConnections } = useConnections('accepted');
  const { data: pendingConnections } = useConnections('pending');
  const { data: searchResults } = useSearchProfiles(searchQuery);
  const createConnection = useCreateConnection();
  const updateConnection = useUpdateConnection();
  const deleteConnection = useDeleteConnection();

  const handleSendRequest = async (profileId: string) => {
    try {
      await createConnection.mutateAsync(profileId);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await updateConnection.mutateAsync({ id: connectionId, status: 'accepted' });
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await updateConnection.mutateAsync({ id: connectionId, status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting connection:', error);
    }
  };

  const handleRemove = async (connectionId: string) => {
    try {
      await deleteConnection.mutateAsync(connectionId);
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]">Conexões</h1>

        <Tabs defaultValue="accepted" className="space-y-4">
          <TabsList className="bg-zinc-900/90 border-2 border-zinc-700/50">
            <TabsTrigger
              value="accepted"
              className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-200 data-[state=active]:border-red-700/50 text-gray-400 hover:text-gray-200"
            >
              Aceitas ({acceptedConnections?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-200 data-[state=active]:border-red-700/50 text-gray-400 hover:text-gray-200"
            >
              Pendentes ({pendingConnections?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-200 data-[state=active]:border-red-700/50 text-gray-400 hover:text-gray-200"
            >
              Buscar
            </TabsTrigger>
          </TabsList>

          {/* Accepted Connections */}
          <TabsContent value="accepted">
            <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <CardHeader>
                <CardTitle className="text-white">Conexões Aceitas</CardTitle>
              </CardHeader>
              <CardContent>
                {acceptedConnections && acceptedConnections.length > 0 ? (
                  <div className="space-y-2">
                    {acceptedConnections.map((connection) => {
                      // Show the OTHER person (not me)
                      const profile = connection.from.id === myProfile?.id
                        ? connection.to
                        : connection.from;

                      return (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-4 bg-zinc-900/60 border-2 border-zinc-700/40 rounded-lg hover:border-red-700/50 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="border-2 border-zinc-700">
                              <AvatarImage src={profile.user.image || undefined} />
                              <AvatarFallback className="bg-zinc-800 text-gray-300">
                                {profile.nickname[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white">{profile.nickname}</p>
                              <p className="text-sm text-gray-400">
                                {profile.user.name}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemove(connection.id)}
                            className="bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 text-gray-300 hover:text-white transition-all duration-300"
                          >
                            Remover
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    Você ainda não tem conexões aceitas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Connections */}
          <TabsContent value="pending">
            <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <CardHeader>
                <CardTitle className="text-white">Solicitações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingConnections && pendingConnections.length > 0 ? (
                  <div className="space-y-2">
                    {pendingConnections.map((connection) => {
                      // Am I the receiver (to) or sender (from)?
                      const isReceiver = connection.to.id === myProfile?.id;
                      // Show the OTHER person
                      const profile = isReceiver ? connection.from : connection.to;

                      return (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-4 bg-zinc-900/60 border-2 border-zinc-700/40 rounded-lg hover:border-red-700/50 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="border-2 border-zinc-700">
                              <AvatarImage src={profile.user.image || undefined} />
                              <AvatarFallback className="bg-zinc-800 text-gray-300">
                                {profile.nickname[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white">{profile.nickname}</p>
                              <p className="text-sm text-gray-400">
                                {profile.user.name}
                              </p>
                              {isReceiver && (
                                <Badge variant="secondary" className="mt-1 bg-red-900/40 border-red-700/50 text-red-200">
                                  Quer se conectar com você
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isReceiver ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(connection.id)}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-2 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all duration-300"
                              >
                                Aceitar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(connection.id)}
                                className="bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 text-gray-300 hover:text-white transition-all duration-300"
                              >
                                Rejeitar
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="bg-zinc-800 border-zinc-700 text-gray-400">Aguardando resposta</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    Nenhuma solicitação pendente
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search */}
          <TabsContent value="search">
            <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <CardHeader>
                <CardTitle className="text-white">Buscar Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Digite um nickname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4 bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300"
                />

                {searchResults && searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-4 bg-zinc-900/60 border-2 border-zinc-700/40 rounded-lg hover:border-red-700/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-zinc-700">
                            <AvatarImage src={profile.user.image || undefined} />
                            <AvatarFallback className="bg-zinc-800 text-gray-300">
                              {profile.nickname[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{profile.nickname}</p>
                            <p className="text-sm text-gray-400">
                              {profile.user.name}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(profile.id)}
                          disabled={createConnection.isPending}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-2 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all duration-300"
                        >
                          Conectar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <p className="text-center text-gray-400 py-8">
                    Nenhum resultado encontrado
                  </p>
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    Digite pelo menos 2 caracteres para buscar
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
