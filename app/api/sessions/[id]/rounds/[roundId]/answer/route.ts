import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { submitAnswerSchema } from '@/lib/validations/session';
import { ZodError } from 'zod';

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

// POST /api/sessions/:id/rounds/:roundId/answer - Submit answer to round
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; roundId: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    // Validate request
    const validatedData = submitAnswerSchema.parse(body);
    const { answer } = validatedData;

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get round and verify it exists
    const round = await prisma.onlineRound.findUnique({
      where: { id: params.roundId },
      include: {
        session: {
          include: {
            sessionParticipants: true,
          },
        },
        answers: true,
      },
    });

    if (!round) {
      return errorResponse('Rodada não encontrada', 404);
    }

    // Verify session ID matches
    if (round.sessionId !== params.id) {
      return errorResponse('Rodada não pertence a esta sessão', 400);
    }

    // Verify round is waiting for answers
    if (round.status !== 'waiting') {
      return errorResponse('Esta rodada já foi concluída', 400);
    }

    // Verify user is participant
    const isParticipant = round.session.sessionParticipants.some(
      (p) => p.profileId === profile.id
    );

    if (!isParticipant) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    // Check if user already answered
    const existingAnswer = round.answers.find(
      (a) => a.profileId === profile.id
    );

    if (existingAnswer) {
      return errorResponse('Você já respondeu esta rodada', 400);
    }

    // Create answer
    const newAnswer = await prisma.onlineAnswer.create({
      data: {
        roundId: round.id,
        profileId: profile.id,
        answer,
      },
      include: {
        profile: {
          select: {
            id: true,
            nickname: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
    });

    // Check if all participants have answered
    const totalParticipants = round.session.sessionParticipants.length;
    const totalAnswers = round.answers.length + 1; // +1 for the new answer

    if (totalAnswers >= totalParticipants) {
      // Mark round as completed
      await prisma.onlineRound.update({
        where: { id: round.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Increment cards played in session
      await prisma.gameSession.update({
        where: { id: round.sessionId },
        data: {
          cardsPlayed: { increment: 1 },
        },
      });
    }

    return successResponse(newAnswer, 201);
  } catch (error: any) {
    console.error('Error submitting answer:', error);

    if (error instanceof ZodError) {
      return errorResponse(error.errors[0].message, 400);
    }

    // Handle unique constraint violation (duplicate answer)
    if (error.code === 'P2002') {
      return errorResponse('Você já respondeu esta rodada', 400);
    }

    return errorResponse('Erro ao enviar resposta', 500);
  }
}
