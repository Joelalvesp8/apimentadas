import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/cards/random?type=&category=
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;

    // Build where clause for official cards
    const whereOfficial: any = {
      isOfficial: true,
    };

    if (type) {
      whereOfficial.type = type;
    }

    if (category) {
      whereOfficial.category = category;
    }

    // Build where clause for approved user cards
    const whereUserCards: any = {
      approved: true,
    };

    if (type) {
      whereUserCards.type = type;
    }

    if (category) {
      whereUserCards.category = category;
    }

    // Get total count of both official and approved user cards
    const totalOfficial = await prisma.card.count({ where: whereOfficial });
    const totalUserCards = await prisma.userCard.count({ where: whereUserCards });
    const total = totalOfficial + totalUserCards;

    if (total === 0) {
      return errorResponse('Nenhuma carta encontrada com esses filtros', 404);
    }

    // Randomly decide if we pick official or user card (weighted by availability)
    const randomIndex = Math.floor(Math.random() * total);

    let card;
    if (randomIndex < totalOfficial) {
      // Pick from official cards
      const skip = Math.floor(Math.random() * totalOfficial);
      card = await prisma.card.findFirst({
        where: whereOfficial,
        skip,
      });
    } else {
      // Pick from user cards
      const skip = Math.floor(Math.random() * totalUserCards);
      const userCard = await prisma.userCard.findFirst({
        where: whereUserCards,
        skip,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      // Transform userCard to look like a regular card
      if (userCard) {
        card = {
          id: userCard.id,
          type: userCard.type,
          category: userCard.category,
          difficulty: userCard.difficulty,
          content: userCard.content,
          isOfficial: false,
          createdAt: userCard.createdAt,
          updatedAt: userCard.updatedAt,
          createdBy: userCard.user.name, // Extra field to show who created it
        };
      }
    }

    return successResponse(card);
  } catch (error) {
    console.error('Error in GET /api/cards/random:', error);
    return errorResponse('Erro ao buscar carta aleatória');
  }
}
