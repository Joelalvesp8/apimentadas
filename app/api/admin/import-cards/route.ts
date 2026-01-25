import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ImportCard {
  type: string;
  category: string;
  difficulty: string;
  content: string;
}

interface ImportResult {
  success: number;
  errors: number;
  duplicates: number;
  messages: string[];
}

const VALID_TYPES = ['pergunta', 'tarefa'];
const VALID_CATEGORIES = ['casais', 'trios', 'grupos'];
const VALID_DIFFICULTIES = ['facil', 'medio', 'dificil', 'extremo'];

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { cards } = body as { cards: ImportCard[] };

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Nenhuma carta fornecida' }, { status: 400 });
    }

    const result: ImportResult = {
      success: 0,
      errors: 0,
      duplicates: 0,
      messages: [],
    };

    // Get existing cards to check for duplicates
    const existingCards = await prisma.card.findMany({
      select: { content: true },
    });

    const existingContents = new Set(
      existingCards.map(c => c.content.toLowerCase().trim())
    );

    // Process each card
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const lineNumber = i + 2; // +2 because of header and 0-index

      // Validation
      if (!card.type || !card.category || !card.difficulty || !card.content) {
        result.errors++;
        result.messages.push(
          `Linha ${lineNumber}: Campos obrigatórios faltando`
        );
        continue;
      }

      if (!VALID_TYPES.includes(card.type.toLowerCase())) {
        result.errors++;
        result.messages.push(
          `Linha ${lineNumber}: Tipo inválido "${card.type}". Use: pergunta ou tarefa`
        );
        continue;
      }

      if (!VALID_CATEGORIES.includes(card.category.toLowerCase())) {
        result.errors++;
        result.messages.push(
          `Linha ${lineNumber}: Categoria inválida "${card.category}". Use: casais, trios ou grupos`
        );
        continue;
      }

      if (!VALID_DIFFICULTIES.includes(card.difficulty.toLowerCase())) {
        result.errors++;
        result.messages.push(
          `Linha ${lineNumber}: Dificuldade inválida "${card.difficulty}". Use: facil, medio, dificil ou extremo`
        );
        continue;
      }

      // Check for duplicates
      const normalizedContent = card.content.toLowerCase().trim();
      if (existingContents.has(normalizedContent)) {
        result.duplicates++;
        result.messages.push(
          `Linha ${lineNumber}: Carta duplicada (já existe no banco)`
        );
        continue;
      }

      // Create card
      try {
        await prisma.card.create({
          data: {
            type: card.type.toLowerCase(),
            category: card.category.toLowerCase(),
            difficulty: card.difficulty.toLowerCase(),
            content: card.content.trim(),
            isOfficial: true,
          },
        });

        existingContents.add(normalizedContent);
        result.success++;
      } catch (error: any) {
        result.errors++;
        result.messages.push(
          `Linha ${lineNumber}: Erro ao salvar - ${error.message}`
        );
      }
    }

    // Summary message
    if (result.success > 0) {
      result.messages.unshift(
        `✅ ${result.success} carta(s) importada(s) com sucesso`
      );
    }

    if (result.duplicates > 0) {
      result.messages.push(
        `⚠️ ${result.duplicates} carta(s) ignorada(s) por serem duplicadas`
      );
    }

    if (result.errors > 0) {
      result.messages.push(
        `❌ ${result.errors} carta(s) com erro`
      );
    }

    return NextResponse.json({
      result,
      message: `Importação concluída: ${result.success} sucesso, ${result.duplicates} duplicadas, ${result.errors} erros`,
    });
  } catch (error: any) {
    console.error('Error importing cards:', error);
    return NextResponse.json(
      { error: 'Erro ao importar cartas', details: error.message },
      { status: 500 }
    );
  }
}
