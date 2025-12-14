import { z } from 'zod';

export const createProfileSchema = z.object({
  nickname: z
    .string()
    .min(3, 'Nickname deve ter no mínimo 3 caracteres')
    .max(20, 'Nickname deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nickname deve conter apenas letras, números e underscores'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  orientation: z.enum(['heterosexual', 'homosexual', 'bisexual', 'other']).optional(),
});

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(3, 'Nickname deve ter no mínimo 3 caracteres')
    .max(20, 'Nickname deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nickname deve conter apenas letras, números e underscores')
    .optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  orientation: z.enum(['heterosexual', 'homosexual', 'bisexual', 'other']).optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
