'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useProducts,
  useOrders,
  useConfirmOrderMutation,
  useCancelOrderMutation,
  Product,
  Order,
} from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Package, ShoppingCart, DollarSign, CheckCircle } from 'lucide-react';
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

export default function AdminSalesPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orderDetailsDialog, setOrderDetailsDialog] = useState<Order | null>(null);

  // Hooks
  const { data: products, isLoading: productsLoading } = useProducts({ activeOnly: false });
  const { data: orders, isLoading: ordersLoading } = useOrders('seller');
  const confirmOrder = useConfirmOrderMutation();
  const cancelOrder = useCancelOrderMutation();

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder.mutateAsync(orderId);
      setOrderDetailsDialog(null);
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Erro ao confirmar pedido');
    }
  };

  const productsStats = {
    total: products?.length || 0,
    active: products?.filter((p) => p.active).length || 0,
    outOfStock: products?.filter((p) => p.stock === 0).length || 0,
  };

  const ordersStats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === 'pending').length || 0,
    confirmed: orders?.filter((o) => o.status === 'confirmed').length || 0,
    completed: orders?.filter((o) => o.status === 'completed').length || 0,
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-900/50 text-yellow-300">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-900/50 text-blue-300">Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-green-900/50 text-green-300">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-900/50 text-red-300">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isLoading = productsLoading || ordersLoading;

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
          Gerenciamento de Vendas
        </h1>
        <p className="text-gray-400">
          Produtos e pedidos do marketplace
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{productsStats.active}</p>
            <p className="text-xs text-gray-500 mt-1">{productsStats.total} total</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Pedidos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{ordersStats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">{ordersStats.total} total</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Pedidos Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{ordersStats.confirmed}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pedidos Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{ordersStats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-zinc-900/90 border border-zinc-800">
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Produtos ({productsStats.total})
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Pedidos ({ordersStats.total})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-end">
            <Link href="/seller/products/new">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </Button>
            </Link>
          </div>

          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Produto</TableHead>
                    <TableHead className="text-gray-400">Preço</TableHead>
                    <TableHead className="text-gray-400">Estoque</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!products || products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        Nenhum produto cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="text-white font-medium">{product.name}</TableCell>
                        <TableCell className="text-gray-400">
                          R$ {product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-400">{product.stock} un.</TableCell>
                        <TableCell>
                          <Badge className={product.active ? 'bg-green-900/50 text-green-300' : 'bg-gray-900/50 text-gray-400'}>
                            {product.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/marketplace/${product.id}`}>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Pedido</TableHead>
                    <TableHead className="text-gray-400">Cliente</TableHead>
                    <TableHead className="text-gray-400">Produto</TableHead>
                    <TableHead className="text-gray-400">Total</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!orders || orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Nenhum pedido encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="text-white font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-gray-400">{order.buyer.nickname}</TableCell>
                        <TableCell className="text-gray-400">
                          {order.orderItems.length > 0 ? order.orderItems[0].productName : '-'}
                          {order.orderItems.length > 1 && ` +${order.orderItems.length - 1}`}
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          R$ {order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderDetailsDialog(order)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Ver Detalhes
                          </Button>
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

      {/* Order Details Dialog */}
      <Dialog open={!!orderDetailsDialog} onOpenChange={() => setOrderDetailsDialog(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pedido #{orderDetailsDialog?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {orderDetailsDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Cliente</label>
                  <p className="text-white mt-1">{orderDetailsDialog.buyer.nickname}</p>
                  <p className="text-sm text-gray-500">{orderDetailsDialog.buyer.user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="mt-1">{getOrderStatusBadge(orderDetailsDialog.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Itens do Pedido</label>
                <div className="space-y-2">
                  {orderDetailsDialog.orderItems.map((item, index) => (
                    <div key={item.id} className="bg-zinc-800/50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-400">
                            {item.quantity}x R$ {item.productPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-white font-semibold">R$ {item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-400">Total do Pedido</label>
                  <p className="text-white text-xl font-bold">R$ {orderDetailsDialog.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Endereço de Entrega</label>
                <p className="text-white mt-1">
                  {orderDetailsDialog.deliveryAddress}
                  {orderDetailsDialog.deliveryComplement && `, ${orderDetailsDialog.deliveryComplement}`}
                </p>
                <p className="text-gray-400 text-sm">
                  {orderDetailsDialog.deliveryCity} - {orderDetailsDialog.deliveryState}
                </p>
                <p className="text-gray-400 text-sm">CEP: {orderDetailsDialog.deliveryZipCode}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Data do Pedido</label>
                <p className="text-white mt-1">
                  {new Date(orderDetailsDialog.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {orderDetailsDialog?.status === 'pending' && (
              <Button
                onClick={() => handleConfirmOrder(orderDetailsDialog.id)}
                disabled={confirmOrder.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {confirmOrder.isPending ? 'Confirmando...' : 'Confirmar Pedido'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setOrderDetailsDialog(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
