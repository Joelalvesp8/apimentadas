-- Migration: Add link field to products table for external sales links
-- Date: 2026-03-14

ALTER TABLE products
ADD COLUMN IF NOT EXISTS link TEXT;

COMMENT ON COLUMN products.link IS 'Link externo para vendas do produto';
