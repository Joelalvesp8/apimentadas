'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Users, Clock, CheckCircle, XCircle, Mail, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WaitlistEntry {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  approved: boolean;
  createdAt: string;
  _count: {
    sessions: number;
    connections: number;
  };
}

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<'waitlist' | 'active' | 'all'>('waitlist');
  const [waitlistFilter, setWaitlistFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Fetch waitlist
  const { data: waitlistData, isLoading: waitlistLoading, refetch: refetchWaitlist } = useQuery({
    queryKey: ['admin-waitlist'],
    queryFn: async () => {
      const res = await fetch('/api/admin/waitlist');
      if (!res.ok) throw new Error('Failed to fetch waitlist');
      const data = await res.json();
      return data.data as WaitlistEntry[];
    },
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      return data.data as User[];
    },
  });

  const updateUserStatus = async (userId: string, approved: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          approved,
        }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      await refetchUsers();
      alert(`Usuário ${approved ? 'aprovado' : 'rejeitado'} com sucesso!`);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  const updateWaitlistStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          notes: notes[id] || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      await refetchWaitlist();
      setNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[id];
        return newNotes;
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const waitlistStats = {
    total: waitlistData?.length || 0,
    pending: waitlistData?.filter((e) => e.status === 'pending').length || 0,
    approved: waitlistData?.filter((e) => e.status === 'approved').length || 0,
    rejected: waitlistData?.filter((e) => e.status === 'rejected').length || 0,
  };

  const usersStats = {
    total: usersData?.length || 0,
    active: usersData?.filter((u) => u.approved).length || 0,
    pending: usersData?.filter((u) => !u.approved).length || 0,
  };

  const filteredWaitlist = waitlistData?.filter((entry) => {
    if (waitlistFilter === 'all') return true;
    return entry.status === waitlistFilter;
  }) || [];

  const isLoading = waitlistLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-400">
          Lista de espera, usuários ativos e estatísticas do sistema
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="bg-zinc-900/90 border border-zinc-800">
          <TabsTrigger
            value="waitlist"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Lista de Espera ({waitlistStats.total})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Usuários Ativos ({usersStats.active})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Todos os Usuários ({usersStats.total})
          </TabsTrigger>
        </TabsList>

        {/* Waitlist Tab */}
        <TabsContent value="waitlist" className="space-y-6">
          {/* Waitlist Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{waitlistStats.total}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500">{waitlistStats.pending}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">{waitlistStats.approved}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Rejeitados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">{waitlistStats.rejected}</p>
              </CardContent>
            </Card>
          </div>

          {/* Waitlist Filters */}
          <Tabs value={waitlistFilter} onValueChange={(v) => setWaitlistFilter(v as any)}>
            <TabsList className="bg-zinc-900/90 border border-zinc-800">
              <TabsTrigger value="pending">Pendentes ({waitlistStats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Aprovados ({waitlistStats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados ({waitlistStats.rejected})</TabsTrigger>
              <TabsTrigger value="all">Todos ({waitlistStats.total})</TabsTrigger>
            </TabsList>

            <TabsContent value={waitlistFilter} className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Data</TableHead>
                        <TableHead className="text-gray-400">Notas</TableHead>
                        <TableHead className="text-gray-400 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWaitlist.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                            Nenhuma entrada encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredWaitlist.map((entry) => (
                          <TableRow key={entry.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="text-white font-medium">{entry.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  entry.status === 'approved'
                                    ? 'bg-green-900/50 text-green-300 border-green-700/50'
                                    : entry.status === 'rejected'
                                    ? 'bg-red-900/50 text-red-300 border-red-700/50'
                                    : 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50'
                                }
                              >
                                {entry.status === 'approved' ? 'Aprovado' : entry.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(entry.createdAt).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {entry.status === 'pending' ? (
                                <Textarea
                                  placeholder="Adicionar nota..."
                                  value={notes[entry.id] || ''}
                                  onChange={(e) => setNotes((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                                  className="bg-zinc-800 border-zinc-700 text-white text-sm h-20 resize-none"
                                />
                              ) : (
                                <p className="text-gray-400 text-sm">{entry.notes || '-'}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {entry.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateWaitlistStatus(entry.id, 'approved')}
                                    className="bg-green-900/50 hover:bg-green-800 text-green-200 border border-green-700/50"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updateWaitlistStatus(entry.id, 'rejected')}
                                    variant="outline"
                                    className="border-red-700/50 text-red-300 hover:bg-red-900/50"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Active Users Tab */}
        <TabsContent value="active" className="space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-gray-400">Nome</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Sessões</TableHead>
                    <TableHead className="text-gray-400">Conexões</TableHead>
                    <TableHead className="text-gray-400">Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.filter((u) => u.approved).map((user) => (
                    <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-400">{user.email}</TableCell>
                      <TableCell className="text-gray-400">{user._count.sessions}</TableCell>
                      <TableCell className="text-gray-400">{user._count.connections}</TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Todos os Usuários</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-gray-400">Nome</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Sessões</TableHead>
                    <TableHead className="text-gray-400">Conexões</TableHead>
                    <TableHead className="text-gray-400">Cadastro</TableHead>
                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.map((user) => (
                    <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-400">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.approved ? 'bg-green-900/50 text-green-300 border-green-700/50' : 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50'}>
                          {user.approved ? 'Aprovado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">{user._count.sessions}</TableCell>
                      <TableCell className="text-gray-400">{user._count.connections}</TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {!user.approved && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateUserStatus(user.id, true)}
                              className="bg-green-900/50 hover:bg-green-800 text-green-200 border border-green-700/50"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateUserStatus(user.id, false)}
                              variant="outline"
                              className="border-red-700/50 text-red-300 hover:bg-red-900/50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
