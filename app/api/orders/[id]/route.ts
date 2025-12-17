import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

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

    // Check if user is buyer or seller
    if (order.buyerId !== profile.id && order.sellerId !== profile.id) {
      return errorResponse('Você não tem permissão para ver este pedido', 403);
    }

    return successResponse(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return errorResponse('Erro ao buscar pedido', 500);
  }
}
