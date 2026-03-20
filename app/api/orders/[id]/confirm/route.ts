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

// POST /api/orders/[id]/confirm - Seller confirms payment received
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return errorResponse('Pedido não encontrado', 404);
    }

    // TODO: Add admin authorization check here
    // For now, any authenticated user can confirm (should be restricted to admins only)

    // Check if order is awaiting confirmation
    if (order.status !== 'paid_awaiting_confirmation') {
      return errorResponse('Pedido não está aguardando confirmação', 400);
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
          },
        },
        orderItems: true,
      },
    });

    return successResponse({
      order: updatedOrder,
      message: 'Pagamento confirmado com sucesso!',
    });
  } catch (error: any) {
    console.error('Error confirming order:', error);
    return errorResponse('Erro ao confirmar pagamento', 500);
  }
}
