import { PrismaClient } from '@prisma/client';

// Fallback: se DIRECT_URL não estiver configurada, usa DATABASE_URL.
// O Prisma exige DIRECT_URL quando o schema define directUrl, e sem ela
// o client falha na inicialização e bloqueia todas as operações no banco.
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
