'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useMarketplace';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Store, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function MarketplacePage() {
  const { data: profile } = useProfile();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    category: category || undefined,
    activeOnly: true
  });

  const categories = [
    { value: '', label: 'Todas' },
    { value: 'vibradores', label: 'Vibradores' },
    { value: 'lingerie', label: 'Lingerie' },
    { value: 'acessorios', label: 'Acessórios' },
    { value: 'lubrificantes', label: 'Lubrificantes' },
    { value: 'fantasias', label: 'Fantasias' },
    { value: 'outros', label: 'Outros' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl md:text-3xl font-bold">Marketplace 🛍️</h1>
            </div>
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
              </Button>
            </Link>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Produtos sensuais vendidos pela comunidade
          </p>
        </div>

        {/* Vendor Banner */}
        {profile && !profile.isVendor && (
          <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-purple-700">Quer vender aqui?</CardTitle>
              <CardDescription>
                Ative o modo vendedor e comece a vender seus produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Tornar-se Vendedor
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-48">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : !products || products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                Nenhum produto encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => {
              // Normalize images to always be an array (defensive programming)
              let normalizedImages: string[] = [];
              if (Array.isArray(product.images)) {
                normalizedImages = product.images;
              } else if (typeof product.images === 'string') {
                try {
                  normalizedImages = product.images.startsWith('[')
                    ? JSON.parse(product.images)
                    : [product.images];
                } catch {
                  normalizedImages = [product.images];
                }
              }

              const imageUrl = normalizedImages && normalizedImages.length > 0
                ? normalizedImages[0]
                : '/placeholder-product.png';

              return (
                <Link key={product.id} href={`/marketplace/${product.id}`}>
                  <Card className="hover:shadow-lg transition cursor-pointer h-full">
                    <div className="aspect-square bg-gray-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Badge variant="destructive">Esgotado</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.seller.storeName || product.seller.nickname}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          R$ {Number(product.price).toFixed(2)}
                        </span>
                        {product.stock > 0 && product.stock <= 5 && (
                          <Badge variant="outline" className="text-xs">
                            {product.stock} restantes
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
