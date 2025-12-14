import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/utils/responses';
import { createProfileSchema, updateProfileSchema } from '@/lib/validations/profile';

// GET /api/profile - Get authenticated user's profile
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    return successResponse(profile);
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return errorResponse('Erro ao buscar perfil');
  }
}

// POST /api/profile - Create profile (onboarding)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return errorResponse('Perfil já existe', 400);
    }

    const body = await request.json();

    // Validate input
    const validation = createProfileSchema.safeParse(body);
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

    const { nickname, bio, orientation } = validation.data;

    // Check if nickname is already taken
    const nicknameExists = await prisma.profile.findUnique({
      where: { nickname },
    });

    if (nicknameExists) {
      return errorResponse('Nickname já está em uso', 400);
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        nickname,
        bio,
        orientation,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return successResponse(profile, 201);
  } catch (error) {
    console.error('Error in POST /api/profile:', error);
    return errorResponse('Erro ao criar perfil');
  }
}

// PUT /api/profile - Update profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);
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

    const { nickname, bio, orientation } = validation.data;

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // If updating nickname, check if it's already taken by another user
    if (nickname && nickname !== existingProfile.nickname) {
      const nicknameExists = await prisma.profile.findUnique({
        where: { nickname },
      });

      if (nicknameExists) {
        return errorResponse('Nickname já está em uso', 400);
      }
    }

    // Update profile
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...(nickname && { nickname }),
        ...(bio !== undefined && { bio }),
        ...(orientation && { orientation }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return successResponse(profile);
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return errorResponse('Erro ao atualizar perfil');
  }
}
