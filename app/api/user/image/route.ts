import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// PATCH /api/user/image - Update user profile image
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return errorResponse('Imagem é obrigatória', 400);
    }

    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      return errorResponse('Formato de imagem inválido', 400);
    }

    // Check image size (limit to 5MB in base64)
    const base64Size = image.length * 0.75; // Approximate size in bytes
    if (base64Size > 5 * 1024 * 1024) {
      return errorResponse('Imagem muito grande. Tamanho máximo: 5MB', 400);
    }

    // Update user image
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { image },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error('Error in PATCH /api/user/image:', error);
    return errorResponse('Erro ao atualizar imagem');
  }
}
