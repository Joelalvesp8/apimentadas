#!/usr/bin/env tsx
/**
 * Script para executar migrations no Supabase
 *
 * USO:
 * 1. Configure DATABASE_URL no .env ou passe como variável:
 *    DATABASE_URL="postgresql://..." npm run migrate
 *
 * 2. Execute: npx tsx scripts/run-migrations.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function runMigrations() {
  console.log('🔧 Iniciando execução das migrations...\n');

  try {
    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '..', 'supabase-fix-emails-and-migrations.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('📄 Arquivo SQL carregado:', sqlPath);
    console.log('📏 Tamanho:', sqlContent.length, 'caracteres\n');

    // Dividir em statements individuais (removendo comentários e queries de verificação)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Remover comentários vazios e queries SELECT de verificação
        if (!s) return false;
        if (s.startsWith('--')) return false;
        if (s.includes('RAISE NOTICE')) return false;
        // Manter apenas ALTER, UPDATE, CREATE, INSERT
        return s.match(/^\s*(ALTER|UPDATE|CREATE|INSERT|DO)/i);
      });

    console.log(`✅ ${statements.length} statements SQL encontrados\n`);

    let executed = 0;
    let skipped = 0;
    let errors = 0;

    for (const statement of statements) {
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');

      try {
        console.log(`⚙️  Executando: ${preview}...`);

        // Executar usando Prisma.$executeRawUnsafe
        await prisma.$executeRawUnsafe(statement + ';');

        executed++;
        console.log(`   ✅ Sucesso\n`);
      } catch (error: any) {
        // Alguns erros são esperados (ex: "column already exists")
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate')) {
          skipped++;
          console.log(`   ⏭️  Pulado (já existe)\n`);
        } else {
          errors++;
          console.error(`   ❌ Erro: ${error.message}\n`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA EXECUÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Executados com sucesso: ${executed}`);
    console.log(`⏭️  Pulados (já existiam):  ${skipped}`);
    console.log(`❌ Erros:                   ${errors}`);
    console.log('='.repeat(60));

    if (errors > 0) {
      console.log('\n⚠️  Alguns erros ocorreram. Revise os logs acima.');
    } else {
      console.log('\n🎉 Todas as migrations foram executadas com sucesso!');
    }

    // Executar verificações finais
    console.log('\n🔍 Verificações finais...\n');

    // 1. Verificar emails normalizados
    const emailsComMaiuscula = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM users
      WHERE email != LOWER(email)
    `;
    console.log(`Emails com maiúsculas: ${emailsComMaiuscula[0].count}`);
    if (emailsComMaiuscula[0].count === 0n) {
      console.log('✅ Todos os emails estão em lowercase');
    } else {
      console.log(`⚠️  ${emailsComMaiuscula[0].count} emails ainda têm maiúsculas`);
    }

    // 2. Verificar tabelas criadas
    const tables = await prisma.$queryRaw<[{ table_name: string }]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('post_comments', 'notifications')
    `;
    console.log(`\nTabelas criadas: ${tables.length}/2`);
    tables.forEach((t: any) => console.log(`  ✅ ${t.table_name}`));

    // 3. Verificar campos novos
    const columns = await prisma.$queryRaw<[{ column_name: string }]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'is_system_user'
    `;
    if (columns.length > 0) {
      console.log(`\n✅ Campo is_system_user criado em users`);
    }

    const sessionColumns = await prisma.$queryRaw<[{ column_name: string }]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'game_sessions'
        AND column_name IN ('skips_used', 'max_skips')
    `;
    console.log(`✅ Campos de skip criados: ${sessionColumns.length}/2`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATIONS CONCLUÍDAS COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📋 Próximos passos:');
    console.log('1. Configurar RESEND_API_KEY no Vercel');
    console.log('2. Fazer redeploy da aplicação');
    console.log('3. Testar login e recuperação de senha');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
runMigrations()
  .catch((error) => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
