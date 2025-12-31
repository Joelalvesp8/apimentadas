'use client';

import { useOrders } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Store, Calendar, AlertCircle, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import Link from 'next/link';
import { STORE_NAME } from '@/lib/constants/store';

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-zinc-800 text-yellow-400 border-zinc-700',
  },
  paid_awaiting_confirmation: {
    label: 'Aguardando Confirmação',
    icon: Clock,
    className: 'bg-zinc-800 text-blue-400 border-zinc-700',
  },
  confirmed: {
    label: 'Confirmado',
    icon: CheckCircle,
    className: 'bg-green-900/40 text-green-300 border-green-700/50',
  },
  shipped: {
    label: 'Enviado',
    icon: Truck,
    className: 'bg-zinc-800 text-purple-400 border-zinc-700',
  },
  delivered: {
    label: 'Entregue',
    icon: CheckCircle,
    className: 'bg-green-900/40 text-green-300 border-green-700/50',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-red-900/40 text-red-300 border-red-700/50',
  },
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders('buyer');

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-gray-400">Carregando pedidos...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
            Meus Pedidos
          </h1>

          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">Você ainda não fez nenhum pedido</p>
              <Link href="/marketplace">
                <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-[0_0_20px_rgba(220,38,38,0.4)] border-2 border-red-600/50">
                  Ir às Compras
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
            Meus Pedidos
          </h1>
          <p className="text-gray-400">
            Acompanhe o status dos seus pedidos
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <Card key={order.id} className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40 hover:border-red-700/50 shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:shadow-[0_0_30px_rgba(220,38,38,0.25)] transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-red-500" />
                      <CardTitle className="text-lg text-white">Pedido #{order.id.slice(-8)}</CardTitle>
                    </div>
                    <Badge className={status.className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Store Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <Store className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Loja:</span>
                      <span className="font-semibold text-gray-200">
                        {STORE_NAME}
                      </span>
                    </div>

                    {/* Order Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Data:</span>
                      <span className="text-gray-300">{new Date(order.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-zinc-700/40 pt-3">
                      <p className="text-sm font-semibold mb-2 text-gray-300">Itens do Pedido:</p>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm bg-zinc-900/40 p-2 rounded border border-zinc-700/30">
                            <span className="text-gray-400">
                              {item.productName} (x{item.quantity})
                            </span>
                            <span className="font-semibold text-gray-200">
                              R$ {Number(item.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-zinc-700/40 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-300">Total:</span>
                      <span className="text-lg font-bold text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
                        R$ {Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    {/* Payment Proof Status */}
                    {order.paymentProof && (
                      <div className="bg-green-950/30 border-2 border-green-700/40 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-green-300">Comprovante Enviado</p>
                          <p className="text-green-400/80">
                            Aguardando confirmação da loja
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cancellation Info */}
                    {order.status === 'cancelled' && order.cancellationReason && (
                      <div className="bg-red-950/30 border-2 border-red-700/40 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-red-300">Pedido Cancelado</p>
                          <p className="text-red-400/80">{order.cancellationReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Confirmed Date */}
                    {order.confirmedAt && (
                      <div className="bg-blue-950/30 border-2 border-blue-700/40 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-300">Pagamento Confirmado</p>
                          <p className="text-blue-400/80">
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
                          <Button variant="outline" size="sm" className="w-full bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-zinc-600">
                            Ver Comprovante
                          </Button>
                        </Link>
                      )}

                      <Link href="/marketplace" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-red-700/50">
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
            <Button variant="outline" className="bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-red-700/50 transition-all duration-300">
              <Store className="w-4 h-4 mr-2" />
              Voltar à Pimentinhas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
