import { z } from 'zod';

export const createSessionSchema = z.object({
  participantIds: z
    .array(z.string())
    .min(1, 'Deve haver pelo menos 1 participante')
    .max(10, 'Máximo de 10 participantes'),
});

export const playCardSchema = z.object({
  cardId: z.string().min(1, 'Card ID é obrigatório'),
  qualitativeRating: z.enum(['ruim', 'satisfatoria', 'excelente']).optional(),
  rating: z
    .number()
    .int('Rating deve ser um número inteiro')
    .min(0, 'Rating mínimo é 0')
    .max(5, 'Rating máximo é 5')
    .optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type PlayCardInput = z.infer<typeof playCardSchema>;
