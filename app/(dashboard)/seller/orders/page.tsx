'use client';

import { useOrders, useConfirmOrderMutation } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  User,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  MapPin,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'bg-gray-100 text-gray-800',
  },
  paid_awaiting_confirmation: {
    label: 'Aguardando Confirmação',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
  },
  confirmed: {
    label: 'Confirmado',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
  },
  shipped: {
    label: 'Enviado',
    icon: Package,
    color: 'bg-blue-100 text-blue-800',
  },
  delivered: {
    label: 'Entregue',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
  },
};

export default function SellerOrdersPage() {
  const { data: orders, isLoading } = useOrders('seller');
  const confirmOrder = useConfirmOrderMutation();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirmPayment = async (orderId: string) => {
    if (!confirm('Confirmar que você recebeu o pagamento via PIX?')) {
      return;
    }

    setConfirmingId(orderId);

    try {
      await confirmOrder.mutateAsync(orderId);
      alert('Pagamento confirmado com sucesso!');
    } catch (error: any) {
      alert(error.message || 'Erro ao confirmar pagamento');
    } finally {
      setConfirmingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Pedidos Recebidos</h1>

          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Você ainda não recebeu nenhum pedido</p>
              <Link href="/seller">
                <Button variant="outline">Voltar ao Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'paid_awaiting_confirmation');
  const otherOrders = orders.filter(o => o.status !== 'paid_awaiting_confirmation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Pedidos Recebidos</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos dos seus clientes
          </p>
        </div>

        {/* Pending Orders - Priority */}
        {pendingOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Aguardando Confirmação ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="border-yellow-200 border-2">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-yellow-600" />
                        <CardTitle className="text-lg">Pedido #{order.id.slice(-8)}</CardTitle>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Aguardando Confirmação
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Buyer Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="font-semibold">{order.buyer.nickname}</span>
                        <span className="text-muted-foreground">({order.buyer.user.email})</span>
                      </div>

                      {/* Order Date */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Data:</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>

                      {/* PIX Key */}
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Sua Chave PIX:</span>
                        <span className="font-mono text-purple-600">{order.pixKey}</span>
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <p className="text-sm font-semibold text-purple-800">Endereço de Entrega:</p>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>{order.deliveryAddress}</p>
                          <p>{order.deliveryCity} - {order.deliveryState}</p>
                          <p>CEP: {order.deliveryZipCode}</p>
                          {order.deliveryComplement && <p>Complemento: {order.deliveryComplement}</p>}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="border-t pt-3">
                        <p className="text-sm font-semibold mb-2">Itens:</p>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.productName} (x{item.quantity})
                              </span>
                              <span className="font-semibold">
                                R$ {Number(item.subtotal).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          R$ {Number(order.totalAmount).toFixed(2)}
                        </span>
                      </div>

                      {/* Payment Proof */}
                      {order.paymentProof && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-blue-800 mb-2">
                            Comprovante de Pagamento:
                          </p>
                          <div className="flex gap-2">
                            <Link href={order.paymentProof} target="_blank" className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Comprovante
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleConfirmPayment(order.id)}
                          disabled={confirmingId === order.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {confirmingId === order.id ? 'Confirmando...' : 'Confirmar Recebimento'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Orders */}
        {otherOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Outros Pedidos ({otherOrders.length})
            </h2>
            <div className="space-y-4">
              {otherOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-purple-600" />
                          <CardTitle className="text-lg">Pedido #{order.id.slice(-8)}</CardTitle>
                        </div>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cliente:</span>
                          <span className="font-semibold">{order.buyer.nickname}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Data:</span>
                          <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>

                        {/* Delivery Address for other orders */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck className="w-4 h-4 text-gray-600" />
                            <p className="text-xs font-semibold text-gray-700">Endereço de Entrega:</p>
                          </div>
                          <div className="text-xs space-y-0.5 text-gray-600">
                            <p>{order.deliveryAddress}</p>
                            <p>{order.deliveryCity} - {order.deliveryState}, CEP: {order.deliveryZipCode}</p>
                            {order.deliveryComplement && <p>Compl: {order.deliveryComplement}</p>}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-bold">Total:</span>
                          <span className="font-bold text-green-600">
                            R$ {Number(order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link href="/seller">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
