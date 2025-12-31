'use client';

import { useState } from 'react';
import {
  useAdminUserCards,
  useApproveUserCard,
  useDeleteUserCard,
  useAllCards,
  UserCard,
  AllCard,
} from '@/hooks/useAdmin';
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProductMutation,
  useDeleteProduct,
  useOrders,
  useConfirmOrderMutation,
  Product,
  Order,
} from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Trash2, Shield, List, Package, ShoppingCart, Plus, Edit, Eye } from 'lucide-react';
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

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<'cards' | 'products' | 'orders'>('cards');
  const [activeCardsTab, setActiveCardsTab] = useState<'pending' | 'approved' | 'all' | 'all-cards'>('pending');
  const [deleteDialogCard, setDeleteDialogCard] = useState<UserCard | null>(null);
  const [productDialog, setProductDialog] = useState<{ open: boolean; product?: Product; mode: 'create' | 'edit' | 'view' }>({
    open: false,
    mode: 'create',
  });
  const [deleteProductDialog, setDeleteProductDialog] = useState<Product | null>(null);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState<Order | null>(null);

  // Cards hooks
  const { data: userCards, isLoading: cardsLoading } = useAdminUserCards(activeCardsTab === 'all-cards' ? 'all' : activeCardsTab);
  const { data: allCards, isLoading: allCardsLoading } = useAllCards();
  const approveCard = useApproveUserCard();
  const deleteCard = useDeleteUserCard();

  // Products hooks
  const { data: products, isLoading: productsLoading } = useProducts({ activeOnly: false });
  const { data: categories } = useCategories(true);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProductMutation();
  const deleteProduct = useDeleteProduct();

  // Orders hooks
  const { data: orders, isLoading: ordersLoading } = useOrders('seller');
  const confirmOrder = useConfirmOrderMutation();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    subcategoryId: '',
    images: [] as string[],
    active: true,
  });

  // ========== CARDS HANDLERS ==========
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

  const handleDeleteCard = async (card: UserCard) => {
    setDeleteDialogCard(card);
  };

  const confirmDeleteCard = async () => {
    if (!deleteDialogCard) return;
    try {
      await deleteCard.mutateAsync(deleteDialogCard.id);
      setDeleteDialogCard(null);
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir carta');
    }
  };

  // ========== PRODUCTS HANDLERS ==========
  const openProductDialog = (mode: 'create' | 'edit' | 'view', product?: Product) => {
    if (mode === 'create') {
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        subcategoryId: '',
        images: [],
        active: true,
      });
    } else if (product) {
      setProductForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        stock: String(product.stock),
        subcategoryId: product.subcategoryId,
        images: Array.isArray(product.images) ? product.images : [],
        active: product.active,
      });
    }
    setProductDialog({ open: true, product, mode });
  };

  const handleSaveProduct = async () => {
    try {
      const data = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        subcategoryId: productForm.subcategoryId,
        images: productForm.images,
        active: productForm.active,
      };

      if (productDialog.mode === 'create') {
        await createProduct.mutateAsync({ ...data, category: '' }); // category not used in new structure
      } else if (productDialog.product) {
        await updateProduct.mutateAsync({ id: productDialog.product.id, data });
      }

      setProductDialog({ open: false, mode: 'create' });
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductDialog) return;
    try {
      await deleteProduct.mutateAsync(deleteProductDialog.id);
      setDeleteProductDialog(null);
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir produto');
    }
  };

  // ========== ORDERS HANDLERS ==========
  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder.mutateAsync(orderId);
    } catch (error: any) {
      alert(error.message || 'Erro ao confirmar pedido');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-zinc-800 text-green-400 border-zinc-700';
      case 'medio': return 'bg-zinc-800 text-yellow-400 border-zinc-700';
      case 'dificil': return 'bg-zinc-800 text-orange-400 border-zinc-700';
      case 'extremo': return 'bg-zinc-800 text-red-400 border-zinc-700';
      default: return 'bg-zinc-800 text-gray-400';
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

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-zinc-800 text-yellow-400 border-zinc-700';
      case 'paid_awaiting_confirmation': return 'bg-zinc-800 text-blue-400 border-zinc-700';
      case 'confirmed': return 'bg-zinc-800 text-green-400 border-zinc-700';
      case 'shipped': return 'bg-zinc-800 text-purple-400 border-zinc-700';
      case 'delivered': return 'bg-green-900/40 text-green-300 border-green-700/50';
      case 'cancelled': return 'bg-red-900/40 text-red-300 border-red-700/50';
      default: return 'bg-zinc-800 text-gray-400';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Aguardando Pagamento';
      case 'paid_awaiting_confirmation': return '💳 Pago - Aguardando Confirmação';
      case 'confirmed': return '✓ Confirmado';
      case 'shipped': return '📦 Enviado';
      case 'delivered': return '✅ Entregue';
      case 'cancelled': return '❌ Cancelado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/60 shadow-[0_0_50px_rgba(220,38,38,0.4)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
              <div>
                <CardTitle className="text-3xl text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                  Painel Administrativo
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Gerencie cartas, produtos e pedidos da loja
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Sections Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeSection === 'cards' ? 'default' : 'outline'}
            onClick={() => setActiveSection('cards')}
            className={activeSection === 'cards'
              ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              : 'bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-red-700/50'
            }
          >
            <List className="w-4 h-4 mr-2" />
            Cartas
          </Button>
          <Button
            variant={activeSection === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveSection('products')}
            className={activeSection === 'products'
              ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              : 'bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-red-700/50'
            }
          >
            <Package className="w-4 h-4 mr-2" />
            Produtos
          </Button>
          <Button
            variant={activeSection === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveSection('orders')}
            className={activeSection === 'orders'
              ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              : 'bg-zinc-900/60 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-red-700/50'
            }
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Pedidos
            {orders && orders.filter(o => o.status === 'paid_awaiting_confirmation').length > 0 && (
              <Badge className="ml-2 bg-red-600 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                {orders.filter(o => o.status === 'paid_awaiting_confirmation').length}
              </Badge>
            )}
          </Button>
        </div>

        {/* ========== CARDS SECTION ========== */}
        {activeSection === 'cards' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={activeCardsTab === 'pending' ? 'default' : 'outline'}
                onClick={() => setActiveCardsTab('pending')}
                className={activeCardsTab === 'pending'
                  ? 'bg-red-900/50 border-red-700/50 text-red-200'
                  : 'bg-zinc-900/40 border-zinc-700/40 text-gray-400 hover:bg-zinc-900/60'
                }
              >
                Pendentes
              </Button>
              <Button
                variant={activeCardsTab === 'approved' ? 'default' : 'outline'}
                onClick={() => setActiveCardsTab('approved')}
                className={activeCardsTab === 'approved'
                  ? 'bg-red-900/50 border-red-700/50 text-red-200'
                  : 'bg-zinc-900/40 border-zinc-700/40 text-gray-400 hover:bg-zinc-900/60'
                }
              >
                Aprovadas
              </Button>
              <Button
                variant={activeCardsTab === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveCardsTab('all')}
                className={activeCardsTab === 'all'
                  ? 'bg-red-900/50 border-red-700/50 text-red-200'
                  : 'bg-zinc-900/40 border-zinc-700/40 text-gray-400 hover:bg-zinc-900/60'
                }
              >
                Cartas de Usuários
              </Button>
              <Button
                variant={activeCardsTab === 'all-cards' ? 'default' : 'outline'}
                onClick={() => setActiveCardsTab('all-cards')}
                className={activeCardsTab === 'all-cards'
                  ? 'bg-red-900/50 border-red-700/50 text-red-200'
                  : 'bg-zinc-900/40 border-zinc-700/40 text-gray-400 hover:bg-zinc-900/60'
                }
              >
                <List className="w-4 h-4 mr-2" />
                Todas as Cartas
                {allCards && (
                  <Badge variant="secondary" className="ml-2 bg-zinc-800 border-zinc-700 text-gray-300">
                    {allCards.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Cards Content - Table or List */}
            {activeCardsTab === 'all-cards' ? (
              allCardsLoading ? (
                <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-400">Carregando cartas...</p>
                  </CardContent>
                </Card>
              ) : !allCards || allCards.length === 0 ? (
                <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-400">Nenhuma carta encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-zinc-700/50 hover:bg-zinc-900/40">
                            <TableHead className="text-gray-300 w-[100px]">Origem</TableHead>
                            <TableHead className="text-gray-300 w-[120px]">Tipo</TableHead>
                            <TableHead className="text-gray-300 w-[120px]">Categoria</TableHead>
                            <TableHead className="text-gray-300 w-[120px]">Dificuldade</TableHead>
                            <TableHead className="text-gray-300">Descrição</TableHead>
                            <TableHead className="text-gray-300 w-[150px]">Criado por</TableHead>
                            <TableHead className="text-gray-300 w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allCards.map((card) => (
                            <TableRow key={card.id} className="border-zinc-700/30 hover:bg-zinc-900/40">
                              <TableCell>
                                {card.isOfficial ? (
                                  <Badge variant="secondary" className="bg-blue-900/40 text-blue-300 border-blue-700/50">
                                    Oficial
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-red-900/40 text-red-300 border-red-700/50">
                                    Usuário
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-zinc-600 text-gray-300">
                                  {card.type === 'pergunta' ? '❓ Pergunta' : '✨ Tarefa'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize border-zinc-600 text-gray-300">
                                  {card.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getDifficultyColor(card.difficulty)}>
                                  {getDifficultyLabel(card.difficulty)}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-md text-gray-200">
                                <div className="line-clamp-2 text-sm">
                                  {card.content}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium text-gray-200">{card.createdBy}</div>
                                  {card.createdByEmail && (
                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                      {card.createdByEmail}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {card.approved ? (
                                  <Badge className="bg-green-900/40 text-green-300 border-green-700/50">
                                    <Check className="w-3 h-3 mr-1" />
                                    Aprovada
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-orange-600 text-orange-400">
                                    ⏳ Pendente
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : cardsLoading ? (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">Carregando cartas...</p>
                </CardContent>
              </Card>
            ) : !userCards || userCards.length === 0 ? (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">
                    Nenhuma carta encontrada
                    {activeCardsTab === 'pending' && ' aguardando aprovação'}
                    {activeCardsTab === 'approved' && ' aprovada'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userCards.map((card) => (
                  <Card key={card.id} className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="capitalize bg-zinc-800 border-zinc-700 text-gray-300">
                              {card.type === 'pergunta' ? '❓ Pergunta' : '✨ Tarefa'}
                            </Badge>
                            <Badge variant="secondary" className="capitalize bg-zinc-800 border-zinc-700 text-gray-300">
                              {card.category}
                            </Badge>
                            <Badge className={getDifficultyColor(card.difficulty)}>
                              {getDifficultyLabel(card.difficulty)}
                            </Badge>
                            {card.approved ? (
                              <Badge className="bg-green-900/40 border-green-700/50 text-green-300">
                                <Check className="w-3 h-3 mr-1" />
                                Aprovada
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-orange-600 text-orange-400">
                                ⏳ Pendente
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-3 p-3 bg-zinc-900/60 border border-zinc-700/40 rounded-lg text-gray-200">
                            {card.content}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Criado por:</span>
                            <span className="font-medium text-gray-300">{card.user.name}</span>
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
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          {!card.approved ? (
                            <>
                              <Button
                                onClick={() => handleApprove(card.id)}
                                disabled={approveCard.isPending}
                                className="bg-green-700 hover:bg-green-600 border-2 border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                size="sm"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                onClick={() => handleReject(card.id)}
                                disabled={approveCard.isPending}
                                variant="outline"
                                className="border-2 border-zinc-600 text-gray-300 hover:bg-zinc-800"
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
                              className="border-2 border-zinc-600 text-gray-300 hover:bg-zinc-800"
                              size="sm"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reprovar
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteCard(card)}
                            disabled={deleteCard.isPending}
                            variant="destructive"
                            className="bg-red-700 hover:bg-red-600 border-2 border-red-600"
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
          </>
        )}

        {/* ========== PRODUCTS SECTION ========== */}
        {activeSection === 'products' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Gerenciar Produtos</h2>
              <Button
                onClick={() => openProductDialog('create')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-[0_0_20px_rgba(220,38,38,0.4)] border-2 border-red-600/50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {productsLoading ? (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">Carregando produtos...</p>
                </CardContent>
              </Card>
            ) : !products || products.length === 0 ? (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">Nenhum produto encontrado</p>
                  <Button
                    onClick={() => openProductDialog('create')}
                    className="mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-600/50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Produto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-700/50 hover:bg-zinc-900/40">
                          <TableHead className="text-gray-300 w-[100px]">Status</TableHead>
                          <TableHead className="text-gray-300">Nome</TableHead>
                          <TableHead className="text-gray-300 w-[120px]">Categoria</TableHead>
                          <TableHead className="text-gray-300 w-[100px]">Preço</TableHead>
                          <TableHead className="text-gray-300 w-[100px]">Estoque</TableHead>
                          <TableHead className="text-gray-300 w-[200px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} className="border-zinc-700/30 hover:bg-zinc-900/40">
                            <TableCell>
                              <Badge className={product.active
                                ? 'bg-green-900/40 text-green-300 border-green-700/50'
                                : 'bg-red-900/40 text-red-300 border-red-700/50'
                              }>
                                {product.active ? '✓ Ativo' : '✗ Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-200 font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell className="text-gray-300 text-sm">
                              {product.subcategory?.name || '-'}
                            </TableCell>
                            <TableCell className="text-gray-200 font-semibold">
                              R$ {Number(product.price).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={product.stock > 0
                                ? 'bg-zinc-800 text-gray-300 border-zinc-700'
                                : 'bg-red-900/40 text-red-300 border-red-700/50'
                              }>
                                {product.stock} un
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openProductDialog('view', product)}
                                  className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openProductDialog('edit', product)}
                                  className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteProductDialog(product)}
                                  className="bg-red-700 hover:bg-red-600 border-2 border-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ========== ORDERS SECTION ========== */}
        {activeSection === 'orders' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Gerenciar Pedidos</h2>
              <p className="text-gray-400 text-sm">Visualize e gerencie todos os pedidos da loja</p>
            </div>

            {ordersLoading ? (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">Carregando pedidos...</p>
                </CardContent>
              </Card>
            ) : !orders || orders.length === 0 ? (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">Nenhum pedido encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-700/50 hover:bg-zinc-900/40">
                          <TableHead className="text-gray-300 w-[120px]">Pedido</TableHead>
                          <TableHead className="text-gray-300">Cliente</TableHead>
                          <TableHead className="text-gray-300 w-[100px]">Total</TableHead>
                          <TableHead className="text-gray-300 w-[180px]">Status</TableHead>
                          <TableHead className="text-gray-300 w-[150px]">Data</TableHead>
                          <TableHead className="text-gray-300 w-[200px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-zinc-700/30 hover:bg-zinc-900/40">
                            <TableCell className="text-gray-300 font-mono text-xs">
                              #{order.id.substring(0, 8)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-gray-200 font-medium">{order.buyer.nickname}</p>
                                <p className="text-gray-500 text-xs">{order.buyer.user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-200 font-bold">
                              R$ {Number(order.totalAmount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getOrderStatusColor(order.status)}>
                                {getOrderStatusLabel(order.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setOrderDetailsDialog(order)}
                                  className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                                {order.status === 'paid_awaiting_confirmation' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmOrder(order.id)}
                                    disabled={confirmOrder.isPending}
                                    className="bg-green-700 hover:bg-green-600 border-2 border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Confirmar
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ========== DELETE CARD DIALOG ========== */}
        <Dialog open={!!deleteDialogCard} onOpenChange={(open) => !open && setDeleteDialogCard(null)}>
          <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-red-700/50 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tem certeza que deseja excluir esta carta? Esta ação não pode ser desfeita.
                <div className="mt-4 p-3 bg-zinc-900/60 border border-zinc-700/40 rounded text-gray-200">
                  <p className="text-sm">{deleteDialogCard?.content}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogCard(null)} className="border-zinc-600 text-gray-300 hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button
                onClick={confirmDeleteCard}
                className="bg-red-600 hover:bg-red-500 border-2 border-red-600"
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========== PRODUCT DIALOG (Create/Edit/View) ========== */}
        <Dialog open={productDialog.open} onOpenChange={(open) => setProductDialog({ ...productDialog, open })}>
          <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-red-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {productDialog.mode === 'create' && 'Novo Produto'}
                {productDialog.mode === 'edit' && 'Editar Produto'}
                {productDialog.mode === 'view' && 'Detalhes do Produto'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Nome do Produto *</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  disabled={productDialog.mode === 'view'}
                  className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white focus:border-red-600/80"
                />
              </div>
              <div>
                <Label className="text-gray-300">Descrição *</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  disabled={productDialog.mode === 'view'}
                  rows={4}
                  className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white focus:border-red-600/80"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    disabled={productDialog.mode === 'view'}
                    className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white focus:border-red-600/80"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Estoque *</Label>
                  <Input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    disabled={productDialog.mode === 'view'}
                    className="bg-zinc-900/90 border-2 border-zinc-700/50 text-white focus:border-red-600/80"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Categoria *</Label>
                <select
                  value={productForm.subcategoryId}
                  onChange={(e) => setProductForm({ ...productForm, subcategoryId: e.target.value })}
                  disabled={productDialog.mode === 'view'}
                  className="flex h-10 w-full rounded-md border-2 border-zinc-700/50 bg-zinc-900/90 px-3 py-2 text-sm text-white focus-visible:border-red-600/80 focus-visible:ring-2 focus-visible:ring-red-600/30"
                >
                  <option value="" className="bg-zinc-900 text-white">Selecione uma categoria...</option>
                  {categories?.map((category) => (
                    <optgroup key={category.id} label={category.name} className="bg-zinc-900 text-white">
                      {category.subcategories?.map((sub) => (
                        <option key={sub.id} value={sub.id} className="bg-zinc-900 text-white">
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={productForm.active}
                  onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                  disabled={productDialog.mode === 'view'}
                  className="w-4 h-4 text-red-600 bg-zinc-900 border-zinc-700 rounded focus:ring-red-600"
                />
                <Label htmlFor="active" className="text-gray-300">Produto ativo</Label>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setProductDialog({ open: false, mode: 'create' })} className="border-zinc-600 text-gray-300 hover:bg-zinc-800">
                {productDialog.mode === 'view' ? 'Fechar' : 'Cancelar'}
              </Button>
              {productDialog.mode !== 'view' && (
                <Button
                  onClick={handleSaveProduct}
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  {createProduct.isPending || updateProduct.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========== DELETE PRODUCT DIALOG ========== */}
        <Dialog open={!!deleteProductDialog} onOpenChange={(open) => !open && setDeleteProductDialog(null)}>
          <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-red-700/50 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tem certeza que deseja excluir o produto <span className="font-semibold text-white">{deleteProductDialog?.name}</span>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteProductDialog(null)} className="border-zinc-600 text-gray-300 hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteProduct}
                disabled={deleteProduct.isPending}
                className="bg-red-600 hover:bg-red-500 border-2 border-red-600"
              >
                {deleteProduct.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========== ORDER DETAILS DIALOG ========== */}
        <Dialog open={!!orderDetailsDialog} onOpenChange={(open) => !open && setOrderDetailsDialog(null)}>
          <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-red-700/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Detalhes do Pedido #{orderDetailsDialog?.id.substring(0, 8)}</DialogTitle>
            </DialogHeader>
            {orderDetailsDialog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-xs">Cliente</Label>
                    <p className="text-white font-medium">{orderDetailsDialog.buyer.nickname}</p>
                    <p className="text-gray-400 text-sm">{orderDetailsDialog.buyer.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Status</Label>
                    <Badge className={getOrderStatusColor(orderDetailsDialog.status)}>
                      {getOrderStatusLabel(orderDetailsDialog.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Endereço de Entrega</Label>
                  <p className="text-white text-sm">
                    {orderDetailsDialog.deliveryAddress}, {orderDetailsDialog.deliveryCity} - {orderDetailsDialog.deliveryState}
                    <br />
                    CEP: {orderDetailsDialog.deliveryZipCode}
                    {orderDetailsDialog.deliveryComplement && (
                      <>
                        <br />
                        Complemento: {orderDetailsDialog.deliveryComplement}
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Itens do Pedido</Label>
                  <div className="space-y-2 mt-2">
                    {orderDetailsDialog.orderItems.map((item) => (
                      <div key={item.id} className="p-3 bg-zinc-900/60 border border-zinc-700/40 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-white">{item.productName}</span>
                          <span className="text-gray-400">x{item.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">R$ {Number(item.productPrice).toFixed(2)} cada</span>
                          <span className="text-white font-semibold">R$ {Number(item.subtotal).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-zinc-700/50 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-lg">Total</span>
                    <span className="text-white font-bold text-2xl">R$ {Number(orderDetailsDialog.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
                {orderDetailsDialog.paymentProof && (
                  <div>
                    <Label className="text-gray-400 text-xs">Comprovante de Pagamento</Label>
                    <img
                      src={orderDetailsDialog.paymentProof}
                      alt="Comprovante"
                      className="mt-2 max-w-full h-auto rounded-lg border-2 border-zinc-700/50"
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderDetailsDialog(null)} className="border-zinc-600 text-gray-300 hover:bg-zinc-800">
                Fechar
              </Button>
              {orderDetailsDialog?.status === 'paid_awaiting_confirmation' && (
                <Button
                  onClick={() => {
                    handleConfirmOrder(orderDetailsDialog.id);
                    setOrderDetailsDialog(null);
                  }}
                  disabled={confirmOrder.isPending}
                  className="bg-green-700 hover:bg-green-600 border-2 border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Pedido
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
