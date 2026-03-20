import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';
import { isAdmin } from '@/lib/utils/admin-helper';

// Force dynamic rendering - used by authenticated and public routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper functions
function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
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
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return errorResponse('Produto não encontrado', 404);
    }

    // Normalize images and price
    const normalizedProduct = {
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : (typeof product.images === 'string'
          ? JSON.parse(product.images as string)
          : []),
      price: Number(product.price),
    };

    return successResponse(normalizedProduct);
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

    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem editar produtos.', 403);
    }

    const body = await request.json();
    const { name, description, price, subcategoryId, stock, images, link, active } = body;

    // Validation
    if (price !== undefined && price <= 0) {
      return errorResponse('O preço deve ser maior que zero');
    }

    if (stock !== undefined && stock < 0) {
      return errorResponse('O estoque não pode ser negativo');
    }

    if (subcategoryId) {
      const subcategory = await prisma.subcategory.findUnique({
        where: { id: subcategoryId },
      });
      if (!subcategory) {
        return errorResponse('Subcategoria inválida');
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(subcategoryId && { subcategoryId }),
        ...(stock !== undefined && { stock }),
        ...(images && { images }),
        ...(link !== undefined && { link }),
        ...(active !== undefined && { active }),
      },
      include: {
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem deletar produtos.', 403);
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
