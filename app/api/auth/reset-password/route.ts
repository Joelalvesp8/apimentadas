import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit('auth-reset-password', getClientIp(request));
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate input
    if (!token || !password) {
      return errorResponse('Token e senha são obrigatórios', 400);
    }

    if (password.length < 8) {
      return errorResponse('A senha deve ter no mínimo 8 caracteres', 400);
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
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

      return errorResponse('Token expirado. Solicite um novo link de recuperação', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return successResponse({
      message: 'Senha redefinida com sucesso',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return errorResponse('Erro ao redefinir senha', 500);
  }
}
