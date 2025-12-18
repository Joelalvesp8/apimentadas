'use client';

import { useProfile } from '@/hooks/useProfile';
import { useProducts, useDeleteProduct, useUpdateProductMutation } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SellerProductsPage() {
  const { data: profile } = useProfile();
  const { data: products, isLoading } = useProducts({
    sellerId: profile?.id,
    activeOnly: false
  });
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProductMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProduct.mutateAsync(id);
      alert('Produto excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir produto');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        data: { active: !product.active }
      });
    } catch (error) {
      alert('Erro ao atualizar produto');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meus Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos e estoque
            </p>
          </div>
          <Link href="/seller/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </Link>
        </div>

        {/* Products List */}
        {!products || products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando seu primeiro produto.
              </p>
              <Link href="/seller/products/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className={!product.active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Product Image */}
                  {product.images && product.images.length > 0 && (
                    <div className="mb-3 aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Preço:</span>
                      <span className="font-bold text-green-600">
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estoque:</span>
                      <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Categoria:</span>
                      <span className="text-sm capitalize">{product.category}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/seller/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deletingId === product.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link href="/seller">
            <Button variant="outline">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
