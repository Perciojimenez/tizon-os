-- ============================================================================
-- HITO #7 — Sistema de Pedidos & Comandas — Tizón OS (Tizón Meats)
-- ============================================================================
-- Ejecutar este script COMPLETO en el SQL Editor de Supabase:
--   https://supabase.com  →  Proyecto tizon-os  →  SQL Editor  →  pegar y Run
--
-- Es idempotente: se puede correr varias veces sin romper nada
-- (usa IF NOT EXISTS y ON CONFLICT DO NOTHING).
-- ============================================================================

-- ── 1. Tabla: menu_items (carta del restaurante) ───────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre              TEXT NOT NULL,
  descripcion         TEXT,
  precio              DECIMAL(10,2) NOT NULL,
  categoria           TEXT NOT NULL CHECK (categoria IN ('entrada','principal','bebida','postre','guarnicion')),
  disponible          BOOLEAN DEFAULT true,
  imagen_url          TEXT,
  tiempo_preparacion  INTEGER DEFAULT 15,   -- minutos
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Tabla: pedidos (una cuenta abierta por mesa) ─────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mesa_id        UUID REFERENCES mesas(id),
  mesa_numero    INTEGER NOT NULL,
  estado         TEXT NOT NULL DEFAULT 'abierto'
                   CHECK (estado IN ('abierto','en_cocina','listo','cerrado','cancelado')),
  mesero_nombre  TEXT DEFAULT 'Personal',
  total          DECIMAL(10,2) DEFAULT 0,
  notas          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Tabla: comandas (líneas/items de cada pedido) ────────────────────────
CREATE TABLE IF NOT EXISTS comandas (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id        UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  menu_item_id     UUID REFERENCES menu_items(id),
  nombre_item      TEXT NOT NULL,
  precio_unitario  DECIMAL(10,2) NOT NULL,
  cantidad         INTEGER NOT NULL DEFAULT 1,
  estado           TEXT NOT NULL DEFAULT 'pendiente'
                     CHECK (estado IN ('pendiente','en_preparacion','listo','entregado','cancelado')),
  notas            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Índices para consultas frecuentes ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pedidos_estado       ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa_numero  ON pedidos(mesa_numero);
CREATE INDEX IF NOT EXISTS idx_comandas_pedido      ON comandas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_comandas_estado      ON comandas(estado);
CREATE INDEX IF NOT EXISTS idx_menu_categoria       ON menu_items(categoria);

-- ── 5. Row Level Security ───────────────────────────────────────────────────
-- El backend usa la service_role key (omite RLS), pero activamos RLS y
-- permitimos a cualquier usuario autenticado operar sobre estas tablas para
-- que también funcione desde el cliente si hiciera falta.
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas   ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menu_items' AND policyname = 'menu_items_all_auth') THEN
    CREATE POLICY menu_items_all_auth ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'pedidos_all_auth') THEN
    CREATE POLICY pedidos_all_auth ON pedidos FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comandas' AND policyname = 'comandas_all_auth') THEN
    CREATE POLICY comandas_all_auth ON comandas FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 6. Datos iniciales del menú de Tizón Meats ──────────────────────────────
-- Solo inserta si la carta está vacía (evita duplicados al re-ejecutar).
INSERT INTO menu_items (nombre, descripcion, precio, categoria, tiempo_preparacion)
SELECT * FROM (VALUES
  ('Corte Ribeye 12oz',    'Corte premium con marmoleo perfecto',        45.00, 'principal',   20),
  ('New York Strip 10oz',  'Corte clásico de tira',                      38.00, 'principal',   18),
  ('T-Bone 16oz',          'El clásico con solomillo y tira',            52.00, 'principal',   25),
  ('Filete Mignon 8oz',    'Lo más suave de la res',                     48.00, 'principal',   15),
  ('Costillas BBQ',        'Parrilla lenta con salsa especial',          35.00, 'principal',   30),
  ('Ensalada César',       'Lechuga romana, crutones, parmesano',        12.00, 'entrada',      8),
  ('Ceviche de Camarón',   'Camarón fresco con limón y cilantro',        15.00, 'entrada',     10),
  ('Sopa del Día',         'Consultar al mesero',                         9.00, 'entrada',     12),
  ('Papa a la Francesa',   'Papas fritas crujientes',                     6.00, 'guarnicion',   8),
  ('Puré de Papa',         'Con mantequilla y crema',                     7.00, 'guarnicion',  10),
  ('Vegetales Asados',     'Calabacín, pimiento y cebolla',               8.00, 'guarnicion',  10),
  ('Agua Mineral',         '500ml',                                       3.00, 'bebida',       2),
  ('Refresco',             'Coca-Cola, Sprite, Fanta',                    4.00, 'bebida',       2),
  ('Limonada Natural',     'Fresca y artesanal',                          5.00, 'bebida',       5),
  ('Cerveza Nacional',     'Botella 355ml',                               5.00, 'bebida',       2),
  ('Vino Copa',            'Tinto o blanco de la casa',                  10.00, 'bebida',       3),
  ('Pastel de Chocolate',  'Húmedo con salsa de caramelo',                8.00, 'postre',       5),
  ('Flan de Vainilla',     'Cremoso con cajeta',                          7.00, 'postre',       5)
) AS nuevos(nombre, descripcion, precio, categoria, tiempo_preparacion)
WHERE NOT EXISTS (SELECT 1 FROM menu_items);

-- ── 7. Verificación (opcional) ──────────────────────────────────────────────
-- SELECT categoria, COUNT(*) FROM menu_items GROUP BY categoria;
-- SELECT * FROM pedidos ORDER BY created_at DESC;

-- ✅ Listo. Tablas menu_items, pedidos y comandas creadas + menú cargado.
