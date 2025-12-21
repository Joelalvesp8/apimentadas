import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

// PATCH /api/cart/[id] - Update cart item quantity
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

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return errorResponse('Quantidade deve ser maior que zero');
    }

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { product: true },
    });

    if (!cartItem) {
      return errorResponse('Item não encontrado no carrinho', 404);
    }

    // Check if cart item belongs to user
    if (cartItem.userId !== profile.id) {
      return errorResponse('Você só pode editar itens do seu próprio carrinho', 403);
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return errorResponse(`Estoque insuficiente. Disponível: ${cartItem.product.stock}`, 400);
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                nickname: true,
                storeName: true,
              },
            },
          },
        },
      },
    });

    // Normalize cart item data
    const normalizedItem = {
      ...updatedItem,
      product: {
        ...updatedItem.product,
        images: Array.isArray(updatedItem.product.images)
          ? updatedItem.product.images
          : (typeof updatedItem.product.images === 'string'
            ? JSON.parse(updatedItem.product.images as string)
            : []),
        price: Number(updatedItem.product.price),
      },
    };

    return successResponse(normalizedItem);
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return errorResponse('Erro ao atualizar item do carrinho', 500);
  }
}

// DELETE /api/cart/[id] - Remove item from cart
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

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
    });

    if (!cartItem) {
      return errorResponse('Item não encontrado no carrinho', 404);
    }

    // Check if cart item belongs to user
    if (cartItem.userId !== profile.id) {
      return errorResponse('Você só pode remover itens do seu próprio carrinho', 403);
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Item removido do carrinho' });
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    return errorResponse('Erro ao remover item do carrinho', 500);
  }
}
