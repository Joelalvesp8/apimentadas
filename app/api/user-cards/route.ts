import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/utils/responses';
import { createCardSchema } from '@/lib/validations/card';

// GET /api/user-cards - Get user's cards
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const userCards = await prisma.userCard.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(userCards);
  } catch (error) {
    console.error('Error in GET /api/user-cards:', error);
    return errorResponse('Erro ao buscar cartas do usuário');
  }
}

// POST /api/user-cards - Create user card
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validation = createCardSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return validationErrorResponse(errors);
    }

    const { type, category, difficulty, content } = validation.data;

    // Create user card
    const userCard = await prisma.userCard.create({
      data: {
        userId: user.id,
        type,
        category,
        difficulty,
        content,
        approved: false, // Cards need approval
      },
    });

    return successResponse(userCard, 201);
  } catch (error) {
    console.error('Error in POST /api/user-cards:', error);
    return errorResponse('Erro ao criar carta');
  }
}
