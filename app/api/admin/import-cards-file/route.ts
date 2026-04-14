import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TYPES = ['pergunta', 'tarefa'];
const VALID_CATEGORIES = ['casais', 'trios', 'grupos', 'solteiros'];
const VALID_DIFFICULTIES = ['facil', 'medio', 'dificil', 'extremo'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 5MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.toLowerCase();

    let rows: any[] = [];

    // CSV
    if (filename.endsWith('.csv')) {
      rows = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        encoding: 'utf-8',
      });
      console.log('[IMPORT-FILE] Parsed CSV:', rows.length, 'rows');
    }
    // XLSX
    else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const sheet = workbook.worksheets[0];
      if (sheet && sheet.rowCount > 1) {
        const headers = (sheet.getRow(1).values as any[]).slice(1).map((h: any) => String(h).trim());
        for (let i = 2; i <= sheet.rowCount; i++) {
          const values = (sheet.getRow(i).values as any[]).slice(1);
          const row: Record<string, any> = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] != null ? String(values[idx]).trim() : '';
          });
          if (Object.values(row).some((v) => v !== '')) {
            rows.push(row);
          }
        }
      }
      console.log('[IMPORT-FILE] Parsed XLSX:', rows.length, 'rows');
    } else {
      return NextResponse.json(
        { error: 'Formato não suportado. Use CSV, XLS ou XLSX.' },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou sem dados válidos' },
        { status: 400 }
      );
    }

    const validCards: Array<{
      type: string;
      category: string;
      difficulty: string;
      content: string;
      isOfficial: boolean;
    }> = [];
    const errors: any[] = [];

    rows.forEach((row, index) => {
      const lineNumber = index + 2; // +1 for 0-index, +1 for header
      const { type, category, difficulty, content } = row;

      // Validações detalhadas
      const validationErrors = [];

      if (!type || !VALID_TYPES.includes(type)) {
        validationErrors.push(`type deve ser "pergunta" ou "tarefa", recebido: "${type}"`);
      }

      if (!category || !VALID_CATEGORIES.includes(category)) {
        validationErrors.push(`category deve ser "casais", "trios", "grupos" ou "solteiros", recebido: "${category}"`);
      }

      if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
        validationErrors.push(`difficulty deve ser "facil", "leve", "medio", "dificil", "picante" ou "extremo", recebido: "${difficulty}"`);
      }

      if (!content || content.trim().length === 0) {
        validationErrors.push('content não pode estar vazio');
      }

      if (content && content.length > 1000) {
        validationErrors.push(`content muito longo (${content.length} caracteres, máximo 1000)`);
      }

      if (validationErrors.length > 0) {
        errors.push({
          line: lineNumber,
          row: {
            type: type || '(vazio)',
            category: category || '(vazio)',
            difficulty: difficulty || '(vazio)',
            content: content ? content.substring(0, 50) + '...' : '(vazio)',
          },
          errors: validationErrors,
        });
        return;
      }

      validCards.push({
        type,
        category,
        difficulty,
        content: content.trim(),
        isOfficial: true,
      });
    });

    console.log('[IMPORT-FILE] Validation results:', {
      totalRows: rows.length,
      validCards: validCards.length,
      errors: errors.length,
    });

    if (validCards.length === 0) {
      return NextResponse.json(
        {
          error: 'Nenhuma carta válida encontrada',
          totalLinhas: rows.length,
          errosEncontrados: errors.length,
          detalhesErros: errors,
        },
        { status: 400 }
      );
    }

    // Inserir cartas válidas
    const inserted = await prisma.card.createMany({
      data: validCards,
      skipDuplicates: true,
    });

    console.log('[IMPORT-FILE] Inserted:', inserted.count, 'cards');

    // Estatísticas finais
    const stats = await prisma.card.groupBy({
      by: ['type', 'category', 'difficulty'],
      _count: true,
    });

    const totalCards = await prisma.card.count();

    return NextResponse.json({
      success: true,
      message: `${inserted.count} cartas importadas com sucesso!`,
      data: {
        totalLinhasLidas: rows.length,
        cartasValidas: validCards.length,
        cartasInseridas: inserted.count,
        errosEncontrados: errors.length,
        totalCartasNoBanco: totalCards,
      },
      stats: stats.map((s) => ({
        type: s.type,
        category: s.category,
        difficulty: s.difficulty,
        count: s._count,
      })),
      detalhesErros: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('[IMPORT-FILE] Error:', err);
    return NextResponse.json(
      {
        error: 'Erro ao importar arquivo',
      },
      { status: 500 }
    );
  }
}

// GET - Show upload form instructions
export async function GET() {
  return NextResponse.json({
    message: 'Upload de cartas via CSV ou XLSX',
    endpoint: '/api/admin/import-cards-file',
    method: 'POST',
    contentType: 'multipart/form-data',
    fields: {
      file: 'Arquivo CSV ou XLSX',
    },
    formato: {
      colunas: ['type', 'category', 'difficulty', 'content'],
      exemplo: [
        {
          type: 'pergunta',
          category: 'casais',
          difficulty: 'medio',
          content: 'Qual foi a primeira vez que você sentiu ciúmes?',
        },
        {
          type: 'tarefa',
          category: 'casais',
          difficulty: 'picante',
          content: 'Mostre sua zona erógena favorita',
        },
      ],
    },
    valoresPermitidos: {
      type: VALID_TYPES,
      category: VALID_CATEGORIES,
      difficulty: VALID_DIFFICULTIES,
    },
  });
}
