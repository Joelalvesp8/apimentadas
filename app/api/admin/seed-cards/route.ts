import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/admin/seed-cards - Seed cards in production database
export async function POST() {
  try {
    const cartas = [
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "facil",
        "content": "Qual foi o momento em que você percebeu que estava apaixonado(a) por mim?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "facil",
        "content": "Qual é a sua memória favorita de nós dois juntos?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "facil",
        "content": "O que você mais admira em mim?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "medio",
        "content": "Qual é a sua fantasia sexual mais secreta?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "medio",
        "content": "Há algo que você sempre quis experimentar na cama, mas nunca teve coragem de pedir?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "medio",
        "content": "Descreva a melhor noite de sexo que já tivemos juntos. O que tornou especial?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "medio",
        "content": "Qual parte do meu corpo você mais gosta e por quê?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "dificil",
        "content": "Se pudéssemos incluir uma terceira pessoa em nossa relação íntima, quem seria e por quê?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "dificil",
        "content": "Qual é o seu fetiche mais profundo que você nunca compartilhou comigo?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "dificil",
        "content": "Existe algum lugar público onde você gostaria de fazer amor comigo?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Você já fantasiou com outra pessoa enquanto estávamos juntos? Quem?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Qual é a coisa mais ousada que você já fez sexualmente antes de me conhecer?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Se você pudesse fazer qualquer coisa comigo sem consequências ou julgamentos, o que seria?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Existe alguma prática sexual que você considera um limite absoluto? Por quê?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Você já teve um sonho erótico comigo? Conte todos os detalhes."
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "picante",
        "content": "Qual é a sua posição sexual favorita e por quê?"
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "picante",
        "content": "Me diga exatamente o que você quer que eu faça com você agora."
      },
      {
        "type": "pergunta",
        "category": "casais",
        "difficulty": "picante",
        "content": "Qual foi a última vez que você se tocou pensando em mim? Descreva."
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "facil",
        "content": "Qual foi a coisa mais engraçada que aconteceu hoje com vocês?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "medio",
        "content": "Entre vocês três, quem seria mais propenso a experimentar algo novo na cama?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "dificil",
        "content": "Se vocês pudessem ter uma noite juntos sem regras, o que fariam?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "extremo",
        "content": "Descreva sua fantasia mais secreta envolvendo os outros dois presentes."
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "picante",
        "content": "Quem aqui você beijaria primeiro e por quê?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "facil",
        "content": "Qual é a melhor memória que vocês três compartilham?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "medio",
        "content": "Se vocês pudessem trocar de corpos por um dia, quem escolheria e o que faria?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "dificil",
        "content": "Qual combinação entre vocês teria a melhor química sexual?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "extremo",
        "content": "Você já imaginou como seria estar com os dois ao mesmo tempo?"
      },
      {
        "type": "pergunta",
        "category": "trios",
        "difficulty": "picante",
        "content": "Se vocês fossem começar uma brincadeira agora, quem seria o primeiro a participar?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "facil",
        "content": "Qual é a coisa mais divertida que este grupo já fez junto?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "medio",
        "content": "Quem no grupo você acha mais atraente fisicamente?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "dificil",
        "content": "Se vocês pudessem organizar uma festa sem limites, o que aconteceria?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "extremo",
        "content": "Com quem deste grupo você já fantasiou?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "picante",
        "content": "Qual seria sua contribuição para tornar esta noite inesquecível?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "facil",
        "content": "Qual é o segredo mais engraçado que alguém aqui está escondendo?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "medio",
        "content": "Se vocês jogassem verdade ou desafio, qual seria seu desafio para o grupo?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "dificil",
        "content": "Quem aqui você levaria para uma ilha deserta e por quê?"
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "extremo",
        "content": "Descreva sua fantasia envolvendo alguém ou mais pessoas deste grupo."
      },
      {
        "type": "pergunta",
        "category": "grupos",
        "difficulty": "picante",
        "content": "Se pudesse escolher duas pessoas deste grupo para uma noite especial, quem seriam?"
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "facil",
        "content": "Dê um beijo apaixonado no seu parceiro por 10 segundos."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "facil",
        "content": "Sussurre no ouvido do seu parceiro o que você mais gosta nele(a)."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "facil",
        "content": "Faça uma massagem sensual nos ombros do seu parceiro por 2 minutos."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "medio",
        "content": "Tire uma peça de roupa da sua escolha."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "medio",
        "content": "Beije o pescoço do seu parceiro por 30 segundos."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "medio",
        "content": "Escolha uma parte do corpo do seu parceiro e a acaricie por 1 minuto."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "medio",
        "content": "Conte ao seu parceiro sua fantasia sexual favorita com detalhes."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "dificil",
        "content": "Faça um strip-tease sensual para seu parceiro."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "dificil",
        "content": "Deixe seu parceiro tirar uma peça de roupa sua usando apenas os dentes."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "dificil",
        "content": "Faça uma massagem íntima no seu parceiro por 3 minutos."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Reproduza sua posição sexual favorita (pode ser com roupas)."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Mostre ao seu parceiro como você gosta de ser tocado(a)."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Realize um ato sensual que você nunca fez antes com seu parceiro."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Deixe seu parceiro explorar seu corpo da maneira que ele(a) quiser por 2 minutos."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "extremo",
        "content": "Sussurre no ouvido do seu parceiro exatamente o que você quer que ele(a) faça com você agora."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "picante",
        "content": "Ajoelhe-se e beije lentamente das pernas até o pescoço do seu parceiro."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "picante",
        "content": "Fique em uma posição provocante e deixe seu parceiro admirá-lo(a) por 30 segundos."
      },
      {
        "type": "tarefa",
        "category": "casais",
        "difficulty": "picante",
        "content": "Escolha a próxima peça de roupa que seu parceiro deve tirar e tire você mesmo(a)."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "facil",
        "content": "Todos devem compartilhar um abraço em grupo por 10 segundos."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "medio",
        "content": "Escolha alguém do trio para lhe dar um beijo no rosto."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "dificil",
        "content": "Faça uma massagem simultânea: você massageia uma pessoa enquanto outra massageia você."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "extremo",
        "content": "Todos tiram uma peça de roupa ao mesmo tempo."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "picante",
        "content": "Forme um triângulo e cada um beije o pescoço da pessoa à sua direita."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "facil",
        "content": "Conte uma história engraçada que aconteceu com vocês três."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "medio",
        "content": "Cada um deve sussurrar um segredo no ouvido da pessoa à esquerda."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "dificil",
        "content": "Escolha duas pessoas para fazerem uma dança sensual enquanto você assiste."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "extremo",
        "content": "Vocês três devem ficar em uma posição íntima e confortável por 1 minuto."
      },
      {
        "type": "tarefa",
        "category": "trios",
        "difficulty": "picante",
        "content": "Cada pessoa escolhe uma parte do corpo de outra pessoa para tocar por 30 segundos."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "facil",
        "content": "Todos devem compartilhar algo que admiram na pessoa à sua direita."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "medio",
        "content": "Escolha alguém do grupo para receber um elogio de todos os outros."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "dificil",
        "content": "Todos tiram uma peça de roupa ou bebem uma dose."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "extremo",
        "content": "Organize o grupo em pares e cada par deve trocar um beijo."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "picante",
        "content": "Escolha duas pessoas do grupo para fazerem um desafio sensual de sua escolha."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "facil",
        "content": "Todos devem fazer um brinde e compartilhar algo pelo que são gratos nesta noite."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "medio",
        "content": "Cada pessoa deve contar um segredo que nunca contou ao grupo."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "dificil",
        "content": "Forme uma roda e cada pessoa deve sussurrar uma fantasia no ouvido da pessoa ao lado."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "extremo",
        "content": "Todos devem escolher uma pessoa para massagear sensualmente por 1 minuto."
      },
      {
        "type": "tarefa",
        "category": "grupos",
        "difficulty": "picante",
        "content": "Escolha a pessoa mais atraente do grupo e diga o porquê em detalhes."
      }
    ];

    console.log(`[SEED] Starting to seed ${cartas.length} cards...`);

    // Check if cards already exist
    const existingCount = await prisma.card.count();
    console.log(`[SEED] Existing cards in database: ${existingCount}`);

    // Delete existing official cards
    const deleted = await prisma.card.deleteMany({
      where: { isOfficial: true },
    });
    console.log(`[SEED] Deleted ${deleted.count} official cards`);

    // Insert new cards
    let insertedCount = 0;
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
      insertedCount++;
    }

    console.log(`[SEED] Inserted ${insertedCount} cards successfully`);

    // Get final stats
    const stats = await prisma.card.groupBy({
      by: ['type', 'category'],
      _count: true,
    });

    const totalCards = await prisma.card.count();

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedCount} cards`,
      data: {
        totalCards,
        insertedCount,
        deletedCount: deleted.count,
        stats,
      },
    });
  } catch (error: any) {
    console.error('[SEED] Error seeding cards:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
