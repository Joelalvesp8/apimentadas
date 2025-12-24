// Constantes da Loja Pimentinhas

export const STORE_NAME = 'Pimentinhas';

export const STORE_DESCRIPTION = 'Sua loja de produtos adultos com discrição e qualidade';

// Chave PIX da loja - IMPORTANTE: Alterar para a chave PIX real
export const STORE_PIX_KEY = process.env.NEXT_PUBLIC_STORE_PIX_KEY || 'pimentinhas@exemplo.com';

// Informações de contato
export const STORE_EMAIL = 'contato@pimentinhas.com.br';
export const STORE_WHATSAPP = '+55 (11) 99999-9999';

// Configurações de entrega
export const SHIPPING_INFO = {
  estimatedDays: '5-10 dias úteis',
  freeShippingMinAmount: 200, // R$ 200,00
  shippingCost: 15, // R$ 15,00
};

// Status de pedidos
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID_AWAITING_CONFIRMATION: 'paid_awaiting_confirmation',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando Pagamento',
  paid_awaiting_confirmation: 'Pago - Aguardando Confirmação',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};
