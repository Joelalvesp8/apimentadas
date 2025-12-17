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
  // Marketplace - Seller fields
  isVendor: z.boolean().optional(),
  pixKey: z.string().max(100, 'Chave PIX deve ter no máximo 100 caracteres').optional(),
  storeName: z.string().max(50, 'Nome da loja deve ter no máximo 50 caracteres').optional(),
  storeDescription: z.string().max(1000, 'Descrição da loja deve ter no máximo 1000 caracteres').optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
