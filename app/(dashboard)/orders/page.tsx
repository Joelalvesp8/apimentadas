'use client';

import { useOrders } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Store, Calendar, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { STORE_NAME } from '@/lib/constants/store';

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

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders('buyer');

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
          <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido</p>
              <Link href="/marketplace">
                <Button>Ir às Compras</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe o status dos seus pedidos
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
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
                  <div className="space-y-4">
                    {/* Store Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Loja:</span>
                      <span className="font-semibold">
                        {STORE_NAME}
                      </span>
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

                    {/* Order Items */}
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold mb-2">Itens do Pedido:</p>
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
                      <span className="text-lg font-bold text-purple-600">
                        R$ {Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    {/* Payment Proof Status */}
                    {order.paymentProof && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-green-800">Comprovante Enviado</p>
                          <p className="text-green-700">
                            Aguardando confirmação da loja
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cancellation Info */}
                    {order.status === 'cancelled' && order.cancellationReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-red-800">Pedido Cancelado</p>
                          <p className="text-red-700">{order.cancellationReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Confirmed Date */}
                    {order.confirmedAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-800">Pagamento Confirmado</p>
                          <p className="text-blue-700">
                            {new Date(order.confirmedAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {order.paymentProof && (
                        <Link href={order.paymentProof} target="_blank" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Ver Comprovante
                          </Button>
                        </Link>
                      )}

                      <Link href="/marketplace" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Comprar Novamente
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back to Pimentinhas */}
        <div className="mt-6 text-center">
          <Link href="/marketplace">
            <Button variant="outline">
              <Store className="w-4 h-4 mr-2" />
              Voltar à Pimentinhas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
