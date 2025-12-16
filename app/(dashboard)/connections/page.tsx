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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Conexões</h1>

        <Tabs defaultValue="accepted" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accepted">
              Aceitas ({acceptedConnections?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pendentes ({pendingConnections?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="search">Buscar</TabsTrigger>
          </TabsList>

          {/* Accepted Connections */}
          <TabsContent value="accepted">
            <Card>
              <CardHeader>
                <CardTitle>Conexões Aceitas</CardTitle>
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
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={profile.user.image || undefined} />
                              <AvatarFallback>
                                {profile.nickname[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.nickname}</p>
                              <p className="text-sm text-muted-foreground">
                                {profile.user.name}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemove(connection.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Você ainda não tem conexões aceitas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Connections */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Pendentes</CardTitle>
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
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={profile.user.image || undefined} />
                              <AvatarFallback>
                                {profile.nickname[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.nickname}</p>
                              <p className="text-sm text-muted-foreground">
                                {profile.user.name}
                              </p>
                              {isReceiver && (
                                <Badge variant="secondary" className="mt-1">
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
                              >
                                Aceitar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(connection.id)}
                              >
                                Rejeitar
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary">Aguardando resposta</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma solicitação pendente
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Digite um nickname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />

                {searchResults && searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={profile.user.image || undefined} />
                            <AvatarFallback>
                              {profile.nickname[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.nickname}</p>
                            <p className="text-sm text-muted-foreground">
                              {profile.user.name}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(profile.id)}
                          disabled={createConnection.isPending}
                        >
                          Conectar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum resultado encontrado
                  </p>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
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
