import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint temporário para adicionar coluna is_system_user que está no schema
// Prisma mas faltando no banco de dados Supabase.
// Safe: usa IF NOT EXISTS, é idempotente, pode ser chamado várias vezes.
// TODO: remover este endpoint após confirmar que a migration foi aplicada.

export async function GET() {
  try {
    await prisma.$executeRaw`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "is_system_user" BOOLEAN NOT NULL DEFAULT FALSE
    `;

    // Verificar se a coluna foi criada
    const result = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'is_system_user'
    `;

    return NextResponse.json({
      success: true,
      message: 'Migration aplicada com sucesso',
      column_exists: result.length > 0,
    });
  } catch (error: any) {
    console.error('[MIGRATION] Erro:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
