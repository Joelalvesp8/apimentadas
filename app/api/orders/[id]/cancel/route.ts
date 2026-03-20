import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';

// Helper functions
function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// POST /api/orders/[id]/cancel - Cancel order (buyer or seller)
export async function POST(
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
    const { reason } = body;

    if (!reason) {
      return errorResponse('Motivo do cancelamento é obrigatório');
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return errorResponse('Pedido não encontrado', 404);
    }

    // Check if user is the buyer
    if (order.buyerId !== profile.id) {
      return errorResponse('Você não tem permissão para cancelar este pedido', 403);
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return errorResponse('Pedido não pode ser cancelado', 400);
    }

    // If order was not yet confirmed, restore stock
    if (['pending', 'paid_awaiting_confirmation'].includes(order.status)) {
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return successResponse({
      order: updatedOrder,
      message: 'Pedido cancelado com sucesso!',
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return errorResponse('Erro ao cancelar pedido', 500);
  }
}
