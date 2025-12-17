'use client';

import { use } from 'react';
import { useProduct, useAddToCart } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({ productId: id, quantity });
      alert('Produto adicionado ao carrinho!');
      router.push('/cart');
    } catch (error: any) {
      alert(error.message || 'Erro ao adicionar ao carrinho');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4">Produto não encontrado</p>
            <Link href="/marketplace">
              <Button>Voltar ao Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : '/placeholder-product.png';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
                  <Badge>{product.category}</Badge>
                </div>

                <div className="text-3xl font-bold text-purple-600">
                  R$ {Number(product.price).toFixed(2)}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Descrição:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Vendedor:</h3>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>{product.seller.storeName || product.seller.nickname}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {product.stock > 0 ? (
                    <>
                      <div className="flex items-center gap-4">
                        <label className="font-semibold">Quantidade:</label>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                          className="w-20 rounded-md border border-input px-3 py-2"
                        />
                        <span className="text-sm text-muted-foreground">
                          {product.stock} disponíveis
                        </span>
                      </div>

                      <Button
                        onClick={handleAddToCart}
                        disabled={addToCart.isPending}
                        className="w-full"
                        size="lg"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {addToCart.isPending ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                      </Button>
                    </>
                  ) : (
                    <Badge variant="destructive" className="w-full justify-center py-3">
                      Produto Esgotado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
