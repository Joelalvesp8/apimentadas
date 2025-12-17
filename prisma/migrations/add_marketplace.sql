-- Migration: Add Marketplace Tables
-- Created: 2025-12-17
-- Description: Adds marketplace functionality with products, cart, and orders

-- ============================================================================
-- UPDATE PROFILES TABLE - Add Seller Fields
-- ============================================================================

ALTER TABLE "profiles"
ADD COLUMN "is_vendor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pix_key" TEXT,
ADD COLUMN "store_name" TEXT,
ADD COLUMN "store_description" TEXT;

-- ============================================================================
-- CREATE PRODUCTS TABLE
-- ============================================================================

CREATE TABLE "products" (
  "id" TEXT PRIMARY KEY,
  "seller_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "category" TEXT NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "images" JSONB NOT NULL DEFAULT '[]',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "products_seller_id_fkey"
    FOREIGN KEY ("seller_id")
    REFERENCES "profiles"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Index for faster queries
CREATE INDEX "products_seller_id_idx" ON "products"("seller_id");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_active_idx" ON "products"("active");

-- ============================================================================
-- CREATE CART_ITEMS TABLE
-- ============================================================================

CREATE TABLE "cart_items" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "cart_items_user_id_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "profiles"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "cart_items_product_id_fkey"
    FOREIGN KEY ("product_id")
    REFERENCES "products"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "cart_items_user_id_product_id_key"
    UNIQUE("user_id", "product_id")
);

-- Index for faster queries
CREATE INDEX "cart_items_user_id_idx" ON "cart_items"("user_id");

-- ============================================================================
-- CREATE ORDERS TABLE
-- ============================================================================

CREATE TABLE "orders" (
  "id" TEXT PRIMARY KEY,
  "buyer_id" TEXT NOT NULL,
  "seller_id" TEXT NOT NULL,
  "total_amount" DECIMAL(10, 2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "pix_key" TEXT NOT NULL,
  "payment_proof" TEXT,
  "payment_proof_uploaded_at" TIMESTAMP(3),
  "confirmed_at" TIMESTAMP(3),
  "shipped_at" TIMESTAMP(3),
  "delivered_at" TIMESTAMP(3),
  "cancelled_at" TIMESTAMP(3),
  "cancellation_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "orders_buyer_id_fkey"
    FOREIGN KEY ("buyer_id")
    REFERENCES "profiles"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "orders_seller_id_fkey"
    FOREIGN KEY ("seller_id")
    REFERENCES "profiles"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Indexes for faster queries
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");
CREATE INDEX "orders_seller_id_idx" ON "orders"("seller_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- ============================================================================
-- CREATE ORDER_ITEMS TABLE
-- ============================================================================

CREATE TABLE "order_items" (
  "id" TEXT PRIMARY KEY,
  "order_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "product_price" DECIMAL(10, 2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,

  CONSTRAINT "order_items_order_id_fkey"
    FOREIGN KEY ("order_id")
    REFERENCES "orders"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "order_items_product_id_fkey"
    FOREIGN KEY ("product_id")
    REFERENCES "products"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- Index for faster queries
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- ============================================================================
-- COMMENTS (for documentation)
-- ============================================================================

COMMENT ON TABLE "products" IS 'Produtos do marketplace vendidos por usuários vendedores';
COMMENT ON TABLE "cart_items" IS 'Itens no carrinho de compras dos usuários';
COMMENT ON TABLE "orders" IS 'Pedidos realizados no marketplace';
COMMENT ON TABLE "order_items" IS 'Itens individuais de cada pedido';

COMMENT ON COLUMN "profiles"."is_vendor" IS 'Indica se o usuário é um vendedor no marketplace';
COMMENT ON COLUMN "profiles"."pix_key" IS 'Chave PIX do vendedor para receber pagamentos';
COMMENT ON COLUMN "orders"."status" IS 'Status do pedido: pending | paid_awaiting_confirmation | confirmed | shipped | delivered | cancelled';
COMMENT ON COLUMN "products"."category" IS 'Categoria: vibradores | lingerie | acessorios | lubrificantes | fantasias | outros';
