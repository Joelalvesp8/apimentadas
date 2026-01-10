import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// GET /api/auth/reset-password/validate?token=xxx - Validate reset token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Token não fornecido', 400);
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
      select: {
        id: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      return errorResponse('Token inválido', 400);
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      // Clean up expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return errorResponse('Token expirado', 400);
    }

    return successResponse({ valid: true });
  } catch (error: any) {
    console.error('Error validating reset token:', error);
    return errorResponse('Erro ao validar token', 500);
  }
}
