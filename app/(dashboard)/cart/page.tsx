'use client';

import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const removeItem = useRemoveCartItem();

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) return;
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p>Carregando carrinho...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continuar Comprando
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <CardTitle>Carrinho de Compras</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
                <Link href="/marketplace">
                  <Button>Ir às Compras</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group items by seller */}
                {Object.entries(
                  cart.items.reduce((acc, item) => {
                    const sellerId = item.product.sellerId;
                    if (!acc[sellerId]) {
                      acc[sellerId] = {
                        seller: item.product.seller,
                        items: [],
                      };
                    }
                    acc[sellerId].items.push(item);
                    return acc;
                  }, {} as Record<string, { seller: any; items: typeof cart.items }>)
                ).map(([sellerId, { seller, items }]) => (
                  <div key={sellerId} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">
                      Vendedor: {seller.storeName || seller.nickname}
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => {
                        // Normalize images to always be an array (defensive programming)
                        let normalizedImages: string[] = [];
                        if (Array.isArray(item.product.images)) {
                          normalizedImages = item.product.images;
                        } else if (typeof item.product.images === 'string') {
                          try {
                            normalizedImages = item.product.images.startsWith('[')
                              ? JSON.parse(item.product.images)
                              : [item.product.images];
                          } catch {
                            normalizedImages = [item.product.images];
                          }
                        }

                        const imageUrl = normalizedImages?.[0] || '/placeholder-product.png';
                        const subtotal = Number(item.product.price) * item.quantity;

                        return (
                          <div key={item.id} className="flex gap-3 border-b pb-3 last:border-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                R$ {Number(item.product.price).toFixed(2)} x {item.quantity}
                              </p>
                              <p className="font-semibold text-purple-600">
                                Subtotal: R$ {subtotal.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem.mutate(item.id)}
                              disabled={removeItem.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-purple-600">
                      R$ {cart.total.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                  >
                    Finalizar Compra
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
