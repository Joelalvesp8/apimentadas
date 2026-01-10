import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { sendApprovalEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}

// GET /api/admin/waitlist - Get all waitlist entries
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Check if user is admin
    if (user.email !== 'joelalvesp8@gmail.com') {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }

    // Get all waitlist entries
    const entries = await prisma.waitlist.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(entries);
  } catch (error: any) {
    console.error('Error fetching waitlist:', error);
    return errorResponse('Erro ao buscar lista de espera', 500);
  }
}

// PATCH /api/admin/waitlist - Update waitlist entry status
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Check if user is admin
    if (user.email !== 'joelalvesp8@gmail.com') {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return errorResponse('ID e status são obrigatórios', 400);
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return errorResponse('Status inválido', 400);
    }

    // Update waitlist entry
    const updated = await prisma.waitlist.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
      },
    });

    // If approved, check if user exists and approve them
    if (status === 'approved') {
      const existingUser = await prisma.user.findUnique({
        where: { email: updated.email },
      });

      if (existingUser) {
        await prisma.user.update({
          where: { email: updated.email },
          data: { approved: true },
        });
      }

      // Send approval email with registration instructions (async, don't wait for it)
      sendApprovalEmail(updated.email).catch((error) => {
        console.error('Failed to send approval email:', error);
      });
    }

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating waitlist:', error);
    return errorResponse('Erro ao atualizar entrada', 500);
  }
}
