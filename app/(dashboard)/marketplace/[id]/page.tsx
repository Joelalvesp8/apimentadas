'use client';

import { useProduct, useAddToCart } from '@/hooks/useMarketplace';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Store, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { STORE_NAME } from '@/lib/constants/store';

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: product, isLoading, error } = useProduct(id);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  // Debug logging
  useEffect(() => {
    if (product) {
      console.log('=== PRODUCT DEBUG ===');
      console.log('Product data:', product);
      console.log('Product.subcategory:', product.subcategory);
      console.log('Product.images:', product.images);
      console.log('Product.images type:', typeof product.images);
      console.log('Product.price:', product.price);
      console.log('=====================');
    }
  }, [product]);

  // Global error handler
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return;

    const errorHandler = (event: ErrorEvent) => {
      console.error('=== GLOBAL ERROR ===');
      console.error('Error:', event.error);
      console.error('Message:', event.message);
      console.error('Stack:', event.error?.stack);
      console.error('====================');
    };

    window.addEventListener('error', errorHandler);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', errorHandler);
      }
    };
  }, []);

  const handleAddToCart = async () => {
    // Check if user has a profile with delivery address
    if (!profile) {
      if (confirm('Você precisa completar seu perfil antes de comprar. Deseja completar agora?')) {
        router.push('/onboarding');
      }
      return;
    }

    // Check if user has delivery address
    const hasAddress = profile.deliveryAddress && profile.deliveryCity && 
                       profile.deliveryState && profile.deliveryZipCode;
    
    if (!hasAddress) {
      if (confirm('Você precisa cadastrar seu endereço de entrega antes de comprar. Deseja cadastrar agora?')) {
        router.push('/complete-profile');
      }
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: id, quantity });
      alert('Produto adicionado ao carrinho!');
      router.push('/cart');
    } catch (error: any) {
      alert(error.message || 'Erro ao adicionar ao carrinho');
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    console.error('Error loading product:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-red-600">Erro ao carregar produto</p>
            <p className="mb-4 text-sm text-gray-600">{String(error)}</p>
            <Link href="/marketplace">
              <Button>Voltar ao Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
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

  // Normalize images to always be an array (defensive programming)
  let normalizedImages: string[] = [];
  try {
    const images = product.images as string | string[] | null;

    if (Array.isArray(images)) {
      normalizedImages = images;
    } else if (typeof images === 'string') {
      normalizedImages = images.startsWith('[')
        ? JSON.parse(images)
        : [images];
    }
  } catch (err) {
    console.error('Error normalizing images:', err);
    normalizedImages = [];
  }

  const imageUrl = normalizedImages && normalizedImages.length > 0
    ? normalizedImages[0]
    : '/placeholder-product.png';

  // Defensive price access
  const productPrice = product.price != null ? Number(product.price) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        {/* Warning if no profile or missing address */}
        {!profile && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Complete seu perfil</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Você precisa completar seu perfil antes de fazer compras no marketplace.
                </p>
                <Link href="/onboarding">
                  <Button size="sm" variant="default">
                    Criar Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Warning if profile exists but missing address */}
        {profile && !(profile.deliveryAddress && profile.deliveryCity && profile.deliveryState && profile.deliveryZipCode) && (
          <Card className="mb-4 border-purple-200 bg-purple-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">Cadastre seu endereço de entrega</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Você precisa cadastrar seu endereço para receber as entregas do marketplace.
                </p>
                <Link href="/complete-profile">
                  <Button size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700">
                    Cadastrar Endereço
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {product.subcategory && (
                    <Badge>{product.subcategory.name}</Badge>
                  )}
                </div>

                <div className="text-3xl font-bold text-purple-600">
                  R$ {productPrice.toFixed(2)}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Descrição:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Loja:</h3>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>{STORE_NAME}</span>
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
