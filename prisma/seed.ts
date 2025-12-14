import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Ler arquivo de cartas
  const cartasPath = path.join(process.cwd(), 'data', 'cartas_iniciais.json');
  const cartasData = fs.readFileSync(cartasPath, 'utf-8');
  const cartas = JSON.parse(cartasData);

  console.log(`📦 Encontradas ${cartas.length} cartas para inserir...`);

  // Limpar cartas existentes (apenas cartas oficiais)
  await prisma.card.deleteMany({
    where: {
      isOfficial: true,
    },
  });

  console.log('🗑️  Cartas oficiais antigas removidas...');

  // Inserir cartas
  let count = 0;
  for (const carta of cartas) {
    await prisma.card.create({
      data: {
        type: carta.type,
        category: carta.category,
        difficulty: carta.difficulty,
        content: carta.content,
        isOfficial: true,
      },
    });
    count++;
  }

  console.log(`✅ ${count} cartas oficiais inseridas com sucesso!`);

  // Estatísticas
  const stats = await prisma.card.groupBy({
    by: ['type', 'category', 'difficulty'],
    _count: true,
  });

  console.log('\n📊 Estatísticas das cartas inseridas:');
  console.log('=====================================');
  stats.forEach((stat) => {
    console.log(
      `${stat.type.padEnd(10)} | ${stat.category.padEnd(10)} | ${stat.difficulty.padEnd(10)} | ${stat._count} cartas`
    );
  });

  const totalCards = await prisma.card.count();
  console.log(`\n🎉 Total de cartas no banco: ${totalCards}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
