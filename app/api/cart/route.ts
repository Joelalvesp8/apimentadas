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

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: profile.id },
      include: {
        product: {
          include: {
            subcategory: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Normalize cart items data
    const normalizedItems = cartItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        images: Array.isArray(item.product.images)
          ? item.product.images
          : (typeof item.product.images === 'string'
            ? JSON.parse(item.product.images as string)
            : []),
        price: Number(item.product.price),
      },
    }));

    // Calculate total
    const total = normalizedItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    return successResponse({ items: normalizedItems, total });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return errorResponse('Erro ao buscar carrinho', 500);
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
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
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return errorResponse('productId é obrigatório');
    }

    if (quantity < 1) {
      return errorResponse('Quantidade deve ser maior que zero');
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Produto não encontrado', 404);
    }

    if (!product.active) {
      return errorResponse('Produto não está disponível', 400);
    }

    // Check stock
    if (product.stock < quantity) {
      return errorResponse(`Estoque insuficiente. Disponível: ${product.stock}`, 400);
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: profile.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return errorResponse(`Estoque insuficiente. Disponível: ${product.stock}`, 400);
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              subcategory: {
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

      // Normalize images
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
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: profile.id,
        productId,
        quantity,
      },
      include: {
        product: {
          include: {
            subcategory: {
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

    // Normalize images
    const normalizedItem = {
      ...cartItem,
      product: {
        ...cartItem.product,
        images: Array.isArray(cartItem.product.images)
          ? cartItem.product.images
          : (typeof cartItem.product.images === 'string'
            ? JSON.parse(cartItem.product.images as string)
            : []),
        price: Number(cartItem.product.price),
      },
    };

    return successResponse(normalizedItem, 201);
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return errorResponse('Erro ao adicionar ao carrinho', 500);
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    await prisma.cartItem.deleteMany({
      where: { userId: profile.id },
    });

    return successResponse({ message: 'Carrinho limpo com sucesso' });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return errorResponse('Erro ao limpar carrinho', 500);
  }
}
