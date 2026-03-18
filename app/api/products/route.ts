import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

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

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // Legacy parameter - not used with new structure
    const subcategoryId = searchParams.get('subcategoryId');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default true

    const where: any = {};

    if (activeOnly) {
      where.active = true;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Normalize products data
    const normalizedProducts = products.map(product => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : (typeof product.images === 'string'
          ? JSON.parse(product.images as string)
          : []),
      price: Number(product.price),
    }));

    return successResponse(normalizedProducts);
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

    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem criar produtos.', 403);
    }

    const body = await request.json();
    const { name, description, price, subcategoryId, stock, images, link } = body;

    // Validation
    if (!name || !description || !price || !subcategoryId) {
      return errorResponse('Campos obrigatórios: name, description, price, subcategoryId');
    }

    if (price <= 0) {
      return errorResponse('O preço deve ser maior que zero');
    }

    if (stock < 0) {
      return errorResponse('O estoque não pode ser negativo');
    }

    // Validate subcategory exists
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
    });

    if (!subcategory) {
      return errorResponse('Subcategoria inválida');
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        subcategoryId,
        name,
        description,
        price,
        stock: stock || 0,
        images: images || [],
        link: link || null,
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

    // Normalize product data
    const normalizedProduct = {
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : (typeof product.images === 'string'
          ? JSON.parse(product.images as string)
          : []),
      price: Number(product.price),
    };

    return successResponse(normalizedProduct, 201);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return errorResponse('Erro ao criar produto', 500);
  }
}
