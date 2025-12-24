-- Migration: Reestruturar marketplace para loja única "Pimentinhas"
-- Remove campos de vendedor e adiciona sistema de categorias/subcategorias

-- =============================================================================
-- 1. CRIAR TABELAS DE CATEGORIAS E SUBCATEGORIAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "subcategories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "category_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE,
  UNIQUE("category_id", "slug")
);

-- =============================================================================
-- 2. REMOVER CAMPOS DE VENDEDOR DO PROFILES
-- =============================================================================

ALTER TABLE "profiles" DROP COLUMN IF EXISTS "is_vendor";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "pix_key";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "store_name";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "store_description";

-- =============================================================================
-- 3. ATUALIZAR TABELA PRODUCTS
-- =============================================================================

-- Adicionar coluna de subcategoria (temporariamente nullable)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "subcategory_id" TEXT;

-- Adicionar coluna featured
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

-- Remover constraint da FK antiga seller_id (se existir)
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_seller_id_fkey";

-- Remover colunas antigas
ALTER TABLE "products" DROP COLUMN IF EXISTS "seller_id";
ALTER TABLE "products" DROP COLUMN IF EXISTS "category";

-- Adicionar constraint FK para subcategory (depois de popular os dados)
-- Será adicionada depois de inserir as categorias e atualizar os produtos existentes
-- ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_fkey"
--   FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE RESTRICT;

-- =============================================================================
-- 4. ATUALIZAR TABELA ORDERS
-- =============================================================================

-- Remover constraint FK antiga
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_seller_id_fkey";

-- Remover colunas relacionadas a vendedor
ALTER TABLE "orders" DROP COLUMN IF EXISTS "seller_id";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "pix_key";

-- =============================================================================
-- 5. INSERIR CATEGORIAS E SUBCATEGORIAS "PIMENTINHAS"
-- =============================================================================

-- CATEGORIA 1 — BRINQUEDOS ÍNTIMOS
INSERT INTO "categories" ("id", "name", "slug", "description", "order")
VALUES
  ('cat_brinquedos', 'Brinquedos Íntimos', 'brinquedos-intimos', 'Produtos para prazer e descoberta', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "order")
VALUES
  ('sub_para_ela', 'cat_brinquedos', 'Para ela', 'para-ela', 1),
  ('sub_para_ele', 'cat_brinquedos', 'Para ele', 'para-ele', 2),
  ('sub_casais', 'cat_brinquedos', 'Para casais', 'para-casais', 3),
  ('sub_iniciantes', 'cat_brinquedos', 'Iniciantes', 'iniciantes', 4),
  ('sub_vibracao', 'cat_brinquedos', 'Vibração & estímulo', 'vibracao-estimulo', 5),
  ('sub_anal', 'cat_brinquedos', 'Anal (discreto)', 'anal', 6)
ON CONFLICT (category_id, slug) DO NOTHING;

-- CATEGORIA 2 — ACESSÓRIOS & SENSAÇÕES
INSERT INTO "categories" ("id", "name", "slug", "description", "order")
VALUES
  ('cat_acessorios', 'Acessórios & Sensações', 'acessorios-sensacoes', 'Complementos para experiências inesquecíveis', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "order")
VALUES
  ('sub_lubrificantes', 'cat_acessorios', 'Lubrificantes', 'lubrificantes', 1),
  ('sub_massagem', 'cat_acessorios', 'Massagem & relaxamento', 'massagem-relaxamento', 2),
  ('sub_bdsm', 'cat_acessorios', 'BDSM leve', 'bdsm-leve', 3),
  ('sub_higiene', 'cat_acessorios', 'Higiene & cuidados', 'higiene-cuidados', 4)
ON CONFLICT (category_id, slug) DO NOTHING;

-- CATEGORIA 3 — ROUPAS & FANTASIAS
INSERT INTO "categories" ("id", "name", "slug", "description", "order")
VALUES
  ('cat_roupas', 'Roupas & Fantasias', 'roupas-fantasias', 'Vista-se para seduzir', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "order")
VALUES
  ('sub_lingerie', 'cat_roupas', 'Lingerie sensual', 'lingerie-sensual', 1),
  ('sub_fantasias', 'cat_roupas', 'Fantasias', 'fantasias', 2),
  ('sub_bodys', 'cat_roupas', 'Bodys', 'bodys', 3),
  ('sub_plus_size', 'cat_roupas', 'Plus size', 'plus-size', 4)
ON CONFLICT (category_id, slug) DO NOTHING;

-- =============================================================================
-- 6. ATUALIZAR PRODUTOS EXISTENTES (se houver)
-- =============================================================================

-- Migrar produtos antigos para uma subcategoria padrão
-- Você pode ajustar isso conforme necessário
UPDATE "products"
SET "subcategory_id" = 'sub_iniciantes'
WHERE "subcategory_id" IS NULL;

-- Agora tornar subcategory_id NOT NULL
ALTER TABLE "products" ALTER COLUMN "subcategory_id" SET NOT NULL;

-- Adicionar FK constraint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_fkey"
  FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE RESTRICT;

-- =============================================================================
-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS "idx_subcategories_category_id" ON "subcategories"("category_id");
CREATE INDEX IF NOT EXISTS "idx_products_subcategory_id" ON "products"("subcategory_id");
CREATE INDEX IF NOT EXISTS "idx_products_active" ON "products"("active");
CREATE INDEX IF NOT EXISTS "idx_products_featured" ON "products"("featured");
CREATE INDEX IF NOT EXISTS "idx_categories_active" ON "categories"("active");
CREATE INDEX IF NOT EXISTS "idx_subcategories_active" ON "subcategories"("active");
