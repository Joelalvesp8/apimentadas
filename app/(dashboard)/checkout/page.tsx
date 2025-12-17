'use client';

import { useState, useRef } from 'react';
import { useCart, useCreateOrder } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CreditCard, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart } = useCart();
  const createOrder = useCreateOrder();
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Tamanho máximo: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProof) {
      alert('Por favor, envie o comprovante de pagamento');
      return;
    }

    try {
      const result = await createOrder.mutateAsync({ paymentProof });
      alert(result.message || 'Pedido criado com sucesso!');
      router.push('/orders');
    } catch (error: any) {
      alert(error.message || 'Erro ao criar pedido');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4">Carrinho vazio</p>
            <Link href="/marketplace">
              <Button>Ir às Compras</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group items by seller
  const itemsBySeller = cart.items.reduce((acc, item) => {
    const sellerId = item.product.sellerId;
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.product.seller,
        items: [],
        total: 0,
      };
    }
    acc[sellerId].items.push(item);
    acc[sellerId].total += Number(item.product.price) * item.quantity;
    return acc;
  }, {} as Record<string, { seller: any; items: typeof cart.items; total: number }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/cart">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Carrinho
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Finalizar Compra</CardTitle>
            <CardDescription>
              Faça o pagamento via PIX e envie o comprovante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resumo do Pedido por Vendedor */}
              <div className="space-y-4">
                <h3 className="font-semibold">Resumo do Pedido:</h3>
                {Object.entries(itemsBySeller).map(([sellerId, { seller, items, total }]) => (
                  <Card key={sellerId} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold">Vendedor: {seller.storeName || seller.nickname}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <CreditCard className="w-4 h-4" />
                            <span>Chave PIX: <span className="font-mono font-semibold text-purple-600">{seller.pixKey}</span></span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.product.name} (x{item.quantity})</span>
                              <span>R$ {(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Subtotal para este vendedor:</span>
                          <span className="text-purple-600">R$ {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="border-t pt-4 flex justify-between text-xl font-bold">
                  <span>Total Geral:</span>
                  <span className="text-purple-600">R$ {cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Instruções de Pagamento */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">📱 Como Pagar:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Copie a(s) chave(s) PIX acima</li>
                    <li>Abra o app do seu banco</li>
                    <li>Faça o PIX para cada vendedor</li>
                    <li>Tire um print do comprovante</li>
                    <li>Envie o comprovante abaixo</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Upload do Comprovante */}
              <div className="space-y-3">
                <Label htmlFor="payment-proof" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Comprovante de Pagamento *
                </Label>

                <input
                  ref={fileInputRef}
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {paymentProof ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={paymentProof}
                      alt="Comprovante"
                      className="max-w-full h-auto rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPaymentProof(null)}
                      className="w-full"
                    >
                      Trocar Comprovante
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher Imagem
                  </Button>
                )}

                <p className="text-sm text-muted-foreground">
                  O vendedor receberá seu comprovante e confirmará o pagamento
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!paymentProof || createOrder.isPending}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {createOrder.isPending ? 'Finalizando...' : 'Finalizar Pedido'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
