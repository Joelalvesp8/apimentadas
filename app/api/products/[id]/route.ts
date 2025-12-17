import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// Helper functions
function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}

// GET /api/products/[id] - Get product details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            storeName: true,
            storeDescription: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return errorResponse('Produto não encontrado', 404);
    }

    return successResponse(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return errorResponse('Erro ao buscar produto', 500);
  }
}

// PATCH /api/products/[id] - Update product (seller only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return errorResponse('Produto não encontrado', 404);
    }

    // Check if user is the seller
    if (product.sellerId !== profile.id) {
      return errorResponse('Você só pode editar seus próprios produtos', 403);
    }

    const body = await request.json();
    const { name, description, price, category, stock, images, active } = body;

    // Validation
    if (price !== undefined && price <= 0) {
      return errorResponse('O preço deve ser maior que zero');
    }

    if (stock !== undefined && stock < 0) {
      return errorResponse('O estoque não pode ser negativo');
    }

    if (category) {
      const validCategories = ['vibradores', 'lingerie', 'acessorios', 'lubrificantes', 'fantasias', 'outros'];
      if (!validCategories.includes(category)) {
        return errorResponse(`Categoria inválida. Opções: ${validCategories.join(', ')}`);
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(category && { category }),
        ...(stock !== undefined && { stock }),
        ...(images && { images }),
        ...(active !== undefined && { active }),
      },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            storeName: true,
          },
        },
      },
    });

    return successResponse(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return errorResponse('Erro ao atualizar produto', 500);
  }
}

// DELETE /api/products/[id] - Delete product (seller only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return errorResponse('Produto não encontrado', 404);
    }

    // Check if user is the seller
    if (product.sellerId !== profile.id) {
      return errorResponse('Você só pode deletar seus próprios produtos', 403);
    }

    // Check if product has pending orders
    const pendingOrders = await prisma.orderItem.count({
      where: {
        productId: params.id,
        order: {
          status: {
            in: ['pending', 'paid_awaiting_confirmation', 'confirmed', 'shipped'],
          },
        },
      },
    });

    if (pendingOrders > 0) {
      return errorResponse(
        'Não é possível deletar produto com pedidos pendentes. Desative o produto ao invés de deletá-lo.',
        400
      );
    }

    // Delete product
    await prisma.product.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Produto deletado com sucesso' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return errorResponse('Erro ao deletar produto', 500);
  }
}
