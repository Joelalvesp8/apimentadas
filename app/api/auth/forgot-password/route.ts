import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

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
        await sendPasswordResetEmail(email, user.name, resetUrl);
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

// Email sending function
async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  // For now, just log the email content
  // In production, integrate with email service (Resend, SendGrid, etc.)
  console.log('='.repeat(80));
  console.log('PASSWORD RESET EMAIL');
  console.log('='.repeat(80));
  console.log(`To: ${to}`);
  console.log(`Name: ${name}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('='.repeat(80));

  // TODO: Integrate with email service
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Apimentadas <noreply@apimentadas.com>',
  //   to,
  //   subject: 'Redefinir sua senha - Apimentadas',
  //   html: getPasswordResetEmailHtml(name, resetUrl),
  // });

  // For development, you can use a service like Ethereal Email
  // or just log the URL to the console
}

function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌶️ APIMENTADAS</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${resetUrl}</p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta alteração, pode ignorar este email com segurança.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Apimentadas. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
