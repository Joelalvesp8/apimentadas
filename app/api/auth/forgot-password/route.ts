import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email é obrigatório', 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user && user.provider === 'credentials') {
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Build reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

      // Send email
      try {
        const emailResult = await sendPasswordResetEmail(email, user.name, resetUrl);
        if (!emailResult.success) {
          console.error('Failed to send password reset email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't throw error to user, still return success
      }
    }

    // Always return success (even if user doesn't exist)
    return successResponse({
      message: 'Se existe uma conta com este email, você receberá um link de recuperação',
    });
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    return errorResponse('Erro ao processar solicitação', 500);
  }
}
