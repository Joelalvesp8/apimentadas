import { z } from 'zod';

export const createCardSchema = z.object({
  type: z.enum(['pergunta', 'tarefa'], {
    errorMap: () => ({ message: 'Tipo deve ser "pergunta" ou "tarefa"' }),
  }),
  category: z.enum(['casais', 'trios', 'grupos', 'solteiros'], {
    errorMap: () => ({ message: 'Categoria deve ser "casais", "trios", "grupos" ou "solteiros"' }),
  }),
  difficulty: z.enum(['facil', 'medio', 'dificil', 'extremo'], {
    errorMap: () => ({
      message: 'Dificuldade deve ser "facil", "medio", "dificil" ou "extremo"',
    }),
  }),
  content: z
    .string()
    .min(10, 'Conteúdo deve ter no mínimo 10 caracteres')
    .max(1000, 'Conteúdo deve ter no máximo 1000 caracteres'),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
