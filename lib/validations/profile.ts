import { z } from 'zod';

export const createProfileSchema = z.object({
  nickname: z
    .string()
    .min(3, 'Nickname deve ter no mínimo 3 caracteres')
    .max(20, 'Nickname deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nickname deve conter apenas letras, números e underscores'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  sex: z.enum(['male', 'female']).optional(),
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
  sex: z.enum(['male', 'female']).optional(),
  orientation: z.enum(['heterosexual', 'homosexual', 'bisexual', 'other']).optional(),
  // Marketplace - Seller fields
  isVendor: z.boolean().optional(),
  pixKey: z.string().max(100, 'Chave PIX deve ter no máximo 100 caracteres').optional(),
  storeName: z.string().max(50, 'Nome da loja deve ter no máximo 50 caracteres').optional(),
  storeDescription: z.string().max(1000, 'Descrição da loja deve ter no máximo 1000 caracteres').optional(),
  // Delivery address fields
  deliveryAddress: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional(),
  deliveryCity: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional(),
  deliveryState: z.string().length(2, 'Estado deve ter 2 caracteres (UF)').optional(),
  deliveryZipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional(),
  deliveryComplement: z.string().max(200, 'Complemento deve ter no máximo 200 caracteres').optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
