'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useApproveUserCard, useDeleteUserCard } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Plus, Eye, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AllCard {
  id: string;
  content: string;
  type: string;
  category: string;
  difficulty: string;
  approved: boolean;
  isOfficial: boolean;
  createdBy: string;
  createdByEmail: string;
  createdAt: string;
  likesCount: number;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function AdminCardsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'official' | 'all'>('official');
  const [deleteDialogCard, setDeleteDialogCard] = useState<AllCard | null>(null);
  const [viewCardDialog, setViewCardDialog] = useState<AllCard | null>(null);
  const queryClient = useQueryClient();

  // Fetch all cards
  const { data: allCards, isLoading: cardsLoading } = useQuery({
    queryKey: ['admin', 'all-cards', activeTab],
    queryFn: () => apiClient.get<AllCard[]>(`/api/admin/all-cards?status=${activeTab}`),
  });

  const approveCard = useApproveUserCard();
  const deleteCard = useDeleteUserCard();

  const handleApprove = async (id: string) => {
    try {
      await approveCard.mutateAsync({ id, approved: true });
    } catch (error) {
      console.error('Error approving card:', error);
      alert('Erro ao aprovar carta');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogCard) return;

    try {
      await deleteCard.mutateAsync(deleteDialogCard.id);
      setDeleteDialogCard(null);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Erro ao excluir carta');
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'PICANTE':
        return 'bg-red-900/50 text-red-300 border-red-700/50';
      case 'LIGHT':
        return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'HARD':
        return 'bg-purple-900/50 text-purple-300 border-purple-700/50';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-700/50';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'truth'
      ? 'bg-green-900/50 text-green-300 border-green-700/50'
      : 'bg-orange-900/50 text-orange-300 border-orange-700/50';
  };

  const stats = {
    pending: allCards?.filter((c) => !c.isOfficial && !c.approved).length || 0,
    approved: allCards?.filter((c) => c.approved).length || 0,
    official: allCards?.filter((c) => c.isOfficial).length || 0,
    total: allCards?.length || 0,
  };

  if (cardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Carregando cartas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gerenciamento de Cartas
          </h1>
          <p className="text-gray-400">
            Aprovar, editar e gerenciar cartas do sistema
          </p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => window.location.href = '/create-card'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Carta Oficial
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal">
              Cartas Oficiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{stats.official}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal">
              Pendentes de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal">
              Cartas Aprovadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal">
              Total de Cartas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-zinc-900/90 border border-zinc-800">
          <TabsTrigger
            value="official"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Oficiais ({stats.official})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Pendentes ({stats.pending})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Aprovadas ({stats.approved})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Todas ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Pergunta</TableHead>
                    <TableHead className="text-gray-400">Categoria</TableHead>
                    <TableHead className="text-gray-400">Tipo</TableHead>
                    <TableHead className="text-gray-400">Criador</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!allCards || allCards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Nenhuma carta encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    allCards.map((card) => (
                      <TableRow key={card.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="text-white font-medium max-w-md truncate">
                          {card.isOfficial && <Shield className="inline w-4 h-4 mr-2 text-blue-500" />}
                          {card.content}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryBadgeColor(card.category)}>
                            {card.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(card.type)}>
                            {card.type === 'truth' ? 'Verdade' : 'Desafio'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {card.createdBy}
                        </TableCell>
                        <TableCell>
                          <Badge className={card.approved ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}>
                            {card.isOfficial ? 'Oficial' : card.approved ? 'Aprovada' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewCardDialog(card)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!card.isOfficial && !card.approved && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(card.id)}
                                className="bg-green-900/50 hover:bg-green-800 text-green-200"
                                disabled={approveCard.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {!card.isOfficial && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteDialogCard(card)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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

      {/* View Card Dialog */}
      <Dialog open={!!viewCardDialog} onOpenChange={() => setViewCardDialog(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Detalhes da Carta</DialogTitle>
          </DialogHeader>
          {viewCardDialog && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Pergunta</label>
                <p className="text-white mt-1">{viewCardDialog.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Categoria</label>
                  <p className="text-white mt-1">{viewCardDialog.category}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Tipo</label>
                  <p className="text-white mt-1">{viewCardDialog.type === 'truth' ? 'Verdade' : 'Desafio'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Dificuldade</label>
                  <p className="text-white mt-1">{viewCardDialog.difficulty}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Criador</label>
                  <p className="text-white mt-1">{viewCardDialog.user?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCardDialog(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogCard} onOpenChange={() => setDeleteDialogCard(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir esta carta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogCard(null)}
              disabled={deleteCard.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteCard.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCard.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
