import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/connections?status=accepted
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;

    // Get connections
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { fromId: profile.id, ...(status && { status }) },
          { toId: profile.id, ...(status && { status }) },
        ],
      },
      include: {
        from: {
          include: {
            user: {
              select: {
                id: true,
                image: true,
              },
            },
          },
        },
        to: {
          include: {
            user: {
              select: {
                id: true,
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

    return successResponse(connections);
  } catch (error) {
    console.error('Error in GET /api/connections:', error);
    return errorResponse('Erro ao buscar conexões');
  }
}

// POST /api/connections - Create connection request
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { toProfileId } = body;

    if (!toProfileId) {
      return errorResponse('toProfileId é obrigatório', 400);
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Check if target profile exists
    const targetProfile = await prisma.profile.findUnique({
      where: { id: toProfileId },
    });

    if (!targetProfile) {
      return errorResponse('Perfil de destino não encontrado', 404);
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromId: profile.id, toId: toProfileId },
          { fromId: toProfileId, toId: profile.id },
        ],
      },
    });

    if (existingConnection) {
      return errorResponse('Conexão já existe', 400);
    }

    // Create connection
    const connection = await prisma.connection.create({
      data: {
        fromId: profile.id,
        toId: toProfileId,
        status: 'pending',
      },
      include: {
        from: {
          include: {
            user: {
              select: {
                id: true,
                image: true,
              },
            },
          },
        },
        to: {
          include: {
            user: {
              select: {
                id: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return successResponse(connection, 201);
  } catch (error) {
    console.error('Error in POST /api/connections:', error);
    return errorResponse('Erro ao criar conexão');
  }
}
