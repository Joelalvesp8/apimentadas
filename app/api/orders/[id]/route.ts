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

// GET /api/orders/[id] - Get order details
export async function GET(
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
            user: {
              select: {
                image: true,
                email: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse('Pedido não encontrado', 404);
    }

    // Check if user is the buyer
    if (order.buyerId !== profile.id) {
      return errorResponse('Você não tem permissão para ver este pedido', 403);
    }

    // Normalize order data
    const normalizedOrder = {
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map(item => ({
        ...item,
        productPrice: Number(item.productPrice),
        subtotal: Number(item.subtotal),
        product: item.product ? {
          ...item.product,
          images: Array.isArray(item.product.images)
            ? item.product.images
            : (typeof item.product.images === 'string'
              ? JSON.parse(item.product.images as string)
              : []),
        } : null,
      })),
    };

    return successResponse(normalizedOrder);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return errorResponse('Erro ao buscar pedido', 500);
  }
}
