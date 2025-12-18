'use client';

import { useProfile } from '@/hooks/useProfile';
import { useProducts, useOrders } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  ShoppingBag,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: products } = useProducts({ sellerId: profile?.id, activeOnly: false });
  const { data: orders } = useOrders('seller');

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // Check if user is a vendor
  if (!profile?.isVendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                Modo Vendedor Não Ativado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Você precisa ativar o modo vendedor no seu perfil para acessar o dashboard de vendas.
              </p>
              <Link href="/profile">
                <Button>
                  Ir para Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter(p => p.active).length || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'paid_awaiting_confirmation').length || 0;
  const confirmedOrders = orders?.filter(o => o.status === 'confirmed').length || 0;
  const totalRevenue = orders
    ?.filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.totalAmount), 0) || 0;
  const pendingRevenue = orders
    ?.filter(o => o.status === 'paid_awaiting_confirmation')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard do Vendedor</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile.storeName || profile.nickname}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Pendente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    R$ {pendingRevenue.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {activeProducts}/{totalProducts}
                  </p>
                  <p className="text-xs text-muted-foreground">ativos/total</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pedidos</p>
                  <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingOrders} pendentes
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Gerenciar Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione novos produtos, edite preços e gerencie seu estoque.
              </p>
              <div className="flex gap-2">
                <Link href="/seller/products/new" className="flex-1">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </Link>
                <Link href="/seller/products" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Pedidos Recebidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Confirme pagamentos e gerencie os pedidos dos seus clientes.
              </p>
              <Link href="/seller/orders">
                <Button variant="outline" className="w-full">
                  Ver Pedidos
                  {pendingOrders > 0 && (
                    <Badge className="ml-2 bg-yellow-500">
                      {pendingOrders}
                    </Badge>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        {orders && orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          Pedido #{order.id.slice(-8)}
                        </span>
                        {order.status === 'paid_awaiting_confirmation' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Aguardando Confirmação
                          </Badge>
                        )}
                        {order.status === 'confirmed' && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirmado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cliente: {order.buyer.nickname} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {orders.length > 5 && (
                <div className="mt-4 text-center">
                  <Link href="/seller/orders">
                    <Button variant="ghost" size="sm">
                      Ver Todos os Pedidos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {totalProducts === 0 && (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Comece a vender!</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não tem produtos cadastrados. Adicione seu primeiro produto para começar a vender.
              </p>
              <Link href="/seller/products/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
