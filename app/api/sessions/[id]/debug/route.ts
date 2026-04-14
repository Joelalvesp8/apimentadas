import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/sessions/:id/debug - Debug session state
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        sessionParticipants: {
          include: {
            profile: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        onlineRounds: {
          include: {
            card: true,
            answers: true,
          },
          orderBy: {
            roundNumber: 'desc',
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find current round if exists
    let currentRound = null;
    if (session.currentRoundId) {
      currentRound = session.onlineRounds.find((r) => r.id === session.currentRoundId);
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          mode: session.mode,
          sessionType: session.sessionType,
          status: session.status,
          currentRoundId: session.currentRoundId,
          cardsPlayed: session.cardsPlayed,
        },
        participants: session.sessionParticipants.map((p) => ({
          id: p.id,
          profileId: p.profileId,
          nickname: p.profile.nickname,
        })),
        rounds: session.onlineRounds.map((r) => ({
          id: r.id,
          roundNumber: r.roundNumber,
          status: r.status,
          cardId: r.cardId,
          hasCard: !!r.card,
          cardContent: r.card?.content?.substring(0, 50),
          answersCount: r.answers.length,
        })),
        currentRound: currentRound ? {
          id: currentRound.id,
          roundNumber: currentRound.roundNumber,
          status: currentRound.status,
          cardId: currentRound.cardId,
          hasCard: !!currentRound.card,
          cardContent: currentRound.card?.content,
          cardCategory: currentRound.card?.category,
          cardDifficulty: currentRound.card?.difficulty,
          answersCount: currentRound.answers.length,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
