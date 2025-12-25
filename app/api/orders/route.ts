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

// GET /api/orders - List user's orders (as buyer or seller)
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'buyer'; // 'buyer' | 'seller' (kept for backwards compatibility, but seller mode shows all orders)
    const status = searchParams.get('status'); // optional filter

    // For seller type (admin view), show all orders; for buyer, show only user's orders
    const where: any = type === 'seller'
      ? {} // Show all orders for admin
      : { buyerId: profile.id };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
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
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Normalize orders data
    const normalizedOrders = orders.map(order => ({
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
    }));

    return successResponse(normalizedOrders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return errorResponse('Erro ao buscar pedidos', 500);
  }
}

// POST /api/orders - Create order (checkout)
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
    const { paymentProof } = body; // Comprovante PIX base64

    // Validation
    if (!paymentProof || !paymentProof.startsWith('data:image/')) {
      return errorResponse('Comprovante de pagamento (imagem) é obrigatório');
    }

    // Validate delivery address
    if (!profile.deliveryAddress || !profile.deliveryCity || !profile.deliveryState || !profile.deliveryZipCode) {
      return errorResponse('Endereço de entrega incompleto. Por favor, preencha todos os campos obrigatórios no checkout.');
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: profile.id },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return errorResponse('Carrinho vazio', 400);
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Check stock for all items
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return errorResponse(
          `Estoque insuficiente para ${item.product.name}. Disponível: ${item.product.stock}`,
          400
        );
      }
    }

    // Create single order
    const order = await prisma.order.create({
      data: {
        buyerId: profile.id,
        totalAmount,
        // Delivery address (snapshot from buyer's profile)
        deliveryAddress: profile.deliveryAddress,
        deliveryCity: profile.deliveryCity,
        deliveryState: profile.deliveryState,
        deliveryZipCode: profile.deliveryZipCode,
        deliveryComplement: profile.deliveryComplement || undefined,
        paymentProof,
        paymentProofUploadedAt: new Date(),
        status: 'paid_awaiting_confirmation',
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productPrice: item.product.price,
            quantity: item.quantity,
            subtotal: Number(item.product.price) * item.quantity,
          })),
        },
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

    // Update stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: profile.id },
    });

    return successResponse({ order, message: 'Pedido criado com sucesso!' }, 201);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return errorResponse('Erro ao criar pedido', 500);
  }
}
