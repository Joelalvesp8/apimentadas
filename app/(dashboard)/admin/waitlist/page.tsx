'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
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

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/admin/waitlist');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEntries(data.data);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
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

      await fetchEntries();
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

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'all') return true;
    return entry.status === filter;
  });

  const stats = {
    total: entries.length,
    pending: entries.filter((e) => e.status === 'pending').length,
    approved: entries.filter((e) => e.status === 'approved').length,
    rejected: entries.filter((e) => e.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]">
            Lista de Espera
          </h1>
          <p className="text-gray-400">
            Gerencie os candidatos para testar o aplicativo
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
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
              <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
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
              <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
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
              <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="bg-zinc-900/90 border-2 border-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-200">
              Todos ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-900/50 data-[state=active]:text-yellow-200">
              Pendentes ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-green-900/50 data-[state=active]:text-green-200">
              Aprovados ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-zinc-900/50 data-[state=active]:text-gray-400">
              Rejeitados ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
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
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Nenhuma entrada encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => (
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
                                  onClick={() => updateStatus(entry.id, 'approved')}
                                  className="bg-green-900/50 hover:bg-green-800 text-green-200 border border-green-700/50"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateStatus(entry.id, 'rejected')}
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
      </div>
    </div>
  );
}
