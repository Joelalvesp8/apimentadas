import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper functions
function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// GET /api/categories - List all categories with subcategories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get('includeSubcategories') !== 'false'; // Default true

    const categories = await prisma.category.findMany({
      where: {
        active: true,
      },
      include: includeSubcategories ? {
        subcategories: {
          where: {
            active: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      } : undefined,
      orderBy: {
        order: 'asc',
      },
    });

    return successResponse(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return errorResponse('Erro ao buscar categorias', 500);
  }
}
