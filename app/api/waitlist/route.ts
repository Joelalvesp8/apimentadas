import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWaitlistConfirmation } from '@/lib/email-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// POST /api/waitlist - Add email to waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email é obrigatório', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Email inválido', 400);
    }

    // Check if email already exists in waitlist
    const existing = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return errorResponse('Este email já está na lista de espera', 400);
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: email.toLowerCase(),
        status: 'pending',
      },
    });

    // Send confirmation email (async, don't wait for it)
    sendWaitlistConfirmation(email.toLowerCase()).catch((error) => {
      console.error('Failed to send waitlist confirmation email:', error);
    });

    return successResponse({
      message: 'Email adicionado à lista de espera com sucesso',
      id: waitlistEntry.id,
    }, 201);
  } catch (error: any) {
    console.error('Error adding to waitlist:', error);
    return errorResponse('Erro ao adicionar à lista de espera', 500);
  }
}
