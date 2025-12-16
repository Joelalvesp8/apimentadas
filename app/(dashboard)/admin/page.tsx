'use client';

import { useState } from 'react';
import { useAdminUserCards, useApproveUserCard, useDeleteUserCard, UserCard } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [deleteDialogCard, setDeleteDialogCard] = useState<UserCard | null>(null);

  const { data: userCards, isLoading } = useAdminUserCards(activeTab);
  const approveCard = useApproveUserCard();
  const deleteCard = useDeleteUserCard();

  const handleApprove = async (id: string) => {
    try {
      await approveCard.mutateAsync({ id, approved: true });
    } catch (error: any) {
      alert(error.message || 'Erro ao aprovar carta');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await approveCard.mutateAsync({ id, approved: false });
    } catch (error: any) {
      alert(error.message || 'Erro ao reprovar carta');
    }
  };

  const handleDelete = async (card: UserCard) => {
    setDeleteDialogCard(card);
  };

  const confirmDelete = async () => {
    if (!deleteDialogCard) return;

    try {
      await deleteCard.mutateAsync(deleteDialogCard.id);
      setDeleteDialogCard(null);
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir carta');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-700 border-green-300';
      case 'medio': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'dificil': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'extremo': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Leve 🌶️';
      case 'medio': return 'Média 🌶️🌶️';
      case 'dificil': return 'Picante 🌶️🌶️🌶️';
      case 'extremo': return 'Infernal 🌶️🌶️🌶️🌶️';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle className="text-3xl">Painel Administrativo</CardTitle>
                <CardDescription>
                  Gerencie cartas criadas pelos usuários
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
            className={activeTab === 'pending' ? 'bg-purple-600' : ''}
          >
            Pendentes
            {userCards && activeTab !== 'pending' && (
              <Badge variant="secondary" className="ml-2">
                {userCards.filter(c => !c.approved).length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'approved' ? 'default' : 'outline'}
            onClick={() => setActiveTab('approved')}
            className={activeTab === 'approved' ? 'bg-purple-600' : ''}
          >
            Aprovadas
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'bg-purple-600' : ''}
          >
            Todas
          </Button>
        </div>

        {/* Cards List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Carregando cartas...</p>
            </CardContent>
          </Card>
        ) : !userCards || userCards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma carta encontrada
                {activeTab === 'pending' && ' aguardando aprovação'}
                {activeTab === 'approved' && ' aprovada'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userCards.map((card) => (
              <Card key={card.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Card Preview */}
                    <div className="flex-1">
                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="capitalize">
                          {card.type === 'pergunta' ? '❓ Pergunta' : '✨ Tarefa'}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {card.category}
                        </Badge>
                        <Badge className={getDifficultyColor(card.difficulty)}>
                          {getDifficultyLabel(card.difficulty)}
                        </Badge>
                        {card.approved ? (
                          <Badge className="bg-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Aprovada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-300 text-orange-700">
                            ⏳ Pendente
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-sm mb-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                        {card.content}
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Criado por:</span>
                        <span className="font-medium text-foreground">{card.user.name}</span>
                        <span className="text-xs">({card.user.email})</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">
                          {new Date(card.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      {!card.approved ? (
                        <>
                          <Button
                            onClick={() => handleApprove(card.id)}
                            disabled={approveCard.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleReject(card.id)}
                            disabled={approveCard.isPending}
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reprovar
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleReject(card.id)}
                          disabled={approveCard.isPending}
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reprovar
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(card)}
                        disabled={deleteCard.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteDialogCard} onOpenChange={(open) => !open && setDeleteDialogCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta carta? Esta ação não pode ser desfeita.
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-foreground">{deleteDialogCard?.content}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogCard(null)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
