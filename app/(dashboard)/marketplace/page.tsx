'use client';

import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Store, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { STORE_NAME } from '@/lib/constants/store';

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');

  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    activeOnly: true
  });

  const { data: categories } = useCategories(true);

  // Filter products by subcategory on client side if needed
  const filteredProducts = products?.filter(product =>
    !subcategoryId || product.subcategoryId === subcategoryId
  );

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
                Pimentinhas 🌶️
              </h1>
            </div>
            <Link href="/cart">
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-red-700/50 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
              </Button>
            </Link>
          </div>
          <p className="text-sm md:text-base text-gray-400">
            Descubra produtos sensuais com discrição e qualidade
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-md border-2 border-zinc-700/50 bg-zinc-900/90 px-3 py-2 text-sm text-white focus-visible:border-red-600/80 focus-visible:ring-2 focus-visible:ring-red-600/30"
                >
                  <option value="" className="bg-zinc-900 text-white">Todas as categorias</option>
                  {categories?.map((category) => (
                    <optgroup key={category.id} label={category.name} className="bg-zinc-900 text-white">
                      {category.subcategories?.map((sub) => (
                        <option key={sub.id} value={sub.id} className="bg-zinc-900 text-white">
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando produtos...</p>
          </div>
        ) : !filteredProducts || filteredProducts.length === 0 ? (
          <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50">
            <CardContent className="py-12 text-center">
              <Store className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">
                Nenhum produto encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => {
              // Normalize images to always be an array (defensive programming)
              const images = product.images as string | string[] | null;
              let normalizedImages: string[] = [];

              if (Array.isArray(images)) {
                normalizedImages = images;
              } else if (typeof images === 'string') {
                try {
                  normalizedImages = images.startsWith('[')
                    ? JSON.parse(images)
                    : [images];
                } catch {
                  normalizedImages = [];
                }
              }

              const imageUrl = normalizedImages && normalizedImages.length > 0
                ? normalizedImages[0]
                : '/placeholder-product.png';

              return (
                <Card key={product.id} className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-zinc-700/40 hover:border-red-700/60 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300 cursor-pointer h-full">
                  {/* Se o produto tem link externo, ao clicar na imagem abre o link */}
                  {product.link ? (
                    <a href={product.link} target="_blank" rel="noopener noreferrer">
                      <div className="aspect-square bg-zinc-950 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-t-lg hover:scale-105 transition-transform duration-500"
                        />
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                            <Badge className="bg-red-900/80 text-red-200 border-red-700">Esgotado</Badge>
                          </div>
                        )}
                      </div>
                    </a>
                  ) : (
                    <Link href={`/marketplace/${product.id}`}>
                      <div className="aspect-square bg-zinc-950 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-t-lg hover:scale-105 transition-transform duration-500"
                        />
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                            <Badge className="bg-red-900/80 text-red-200 border-red-700">Esgotado</Badge>
                          </div>
                        )}
                      </div>
                    </Link>
                  )}
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1 text-white">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {STORE_NAME}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-red-500 drop-shadow-[0_0_6px_rgba(220,38,38,0.4)]">
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                      {product.stock > 0 && product.stock <= 5 && (
                        <Badge variant="outline" className="text-xs border-zinc-600 text-gray-400">
                          {product.stock} restantes
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
