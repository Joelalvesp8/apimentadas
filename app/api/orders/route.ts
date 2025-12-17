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
    const type = searchParams.get('type') || 'buyer'; // 'buyer' | 'seller'
    const status = searchParams.get('status'); // optional filter

    const where: any = type === 'seller'
      ? { sellerId: profile.id }
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
        seller: {
          select: {
            id: true,
            nickname: true,
            storeName: true,
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

    return successResponse(orders);
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

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: profile.id },
      include: {
        product: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return errorResponse('Carrinho vazio', 400);
    }

    // Group items by seller
    const itemsBySeller = cartItems.reduce((acc, item) => {
      const sellerId = item.product.sellerId;
      if (!acc[sellerId]) {
        acc[sellerId] = [];
      }
      acc[sellerId].push(item);
      return acc;
    }, {} as Record<string, typeof cartItems>);

    // Create one order per seller
    const orders = [];

    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      const seller = items[0].product.seller;

      // Check if seller has PIX key
      if (!seller.pixKey) {
        return errorResponse(`Vendedor ${seller.nickname} não configurou chave PIX`, 400);
      }

      // Calculate total
      const totalAmount = items.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0);

      // Check stock for all items
      for (const item of items) {
        if (item.product.stock < item.quantity) {
          return errorResponse(
            `Estoque insuficiente para ${item.product.name}. Disponível: ${item.product.stock}`,
            400
          );
        }
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          buyerId: profile.id,
          sellerId,
          totalAmount,
          pixKey: seller.pixKey,
          paymentProof,
          paymentProofUploadedAt: new Date(),
          status: 'paid_awaiting_confirmation',
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productPrice: item.product.price,
              quantity: item.quantity,
              subtotal: Number(item.product.price) * item.quantity,
            })),
          },
        },
        include: {
          seller: {
            select: {
              id: true,
              nickname: true,
              storeName: true,
            },
          },
          orderItems: true,
        },
      });

      // Update stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      orders.push(order);
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: profile.id },
    });

    return successResponse({ orders, message: 'Pedido(s) criado(s) com sucesso!' }, 201);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return errorResponse('Erro ao criar pedido', 500);
  }
}
