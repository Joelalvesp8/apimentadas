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

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sellerId = searchParams.get('sellerId');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default true

    const where: any = {};

    if (activeOnly) {
      where.active = true;
    }

    if (category) {
      where.category = category;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return errorResponse('Erro ao buscar produtos', 500);
  }
}

// POST /api/products - Create new product (sellers only)
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Check if user is a seller
    if (!profile.isVendor) {
      return errorResponse('Você precisa ser um vendedor para criar produtos', 403);
    }

    // Check if seller has PIX key
    if (!profile.pixKey) {
      return errorResponse('Configure sua chave PIX antes de adicionar produtos', 400);
    }

    const body = await request.json();
    const { name, description, price, category, stock, images } = body;

    // Validation
    if (!name || !description || !price || !category) {
      return errorResponse('Campos obrigatórios: name, description, price, category');
    }

    if (price <= 0) {
      return errorResponse('O preço deve ser maior que zero');
    }

    if (stock < 0) {
      return errorResponse('O estoque não pode ser negativo');
    }

    const validCategories = ['vibradores', 'lingerie', 'acessorios', 'lubrificantes', 'fantasias', 'outros'];
    if (!validCategories.includes(category)) {
      return errorResponse(`Categoria inválida. Opções: ${validCategories.join(', ')}`);
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        sellerId: profile.id,
        name,
        description,
        price,
        category,
        stock: stock || 0,
        images: images || [],
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

    return successResponse(product, 201);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return errorResponse('Erro ao criar produto', 500);
  }
}
