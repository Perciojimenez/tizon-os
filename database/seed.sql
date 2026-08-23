-- =====================================================================
-- Tizón OS v2.0 — Datos Semilla (Seed)
-- Restaurante: Tizón Meats
-- Datos de ejemplo realistas en español.
-- Idempotente: usa ON CONFLICT para poder re-ejecutarse.
-- =====================================================================

-- ---------------------------------------------------------------------
-- CONFIGURACIÓN INICIAL DEL SISTEMA
-- ---------------------------------------------------------------------
INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
    ('max_personas_15min',      '30',  'Máximo de comensales que pueden ser sentados en una ventana de 15 minutos (motor de pacing).'),
    ('duracion_turno_default',  '90',  'Duración por defecto de un turno de mesa, en minutos.'),
    ('duracion_turno_grupo',    '120', 'Duración de turno para grupos grandes (6+ personas), en minutos.'),
    ('tiempo_espera_default',   '20',  'Tiempo de espera estimado por defecto para la lista de espera, en minutos.'),
    ('nombre_restaurante',      'Tizón Meats', 'Nombre oficial del restaurante.'),
    ('sms_recordatorio_horas',  '3',   'Horas antes de la reserva para enviar el SMS de recordatorio.')
ON CONFLICT (clave) DO UPDATE
    SET valor = EXCLUDED.valor, descripcion = EXCLUDED.descripcion;

-- ---------------------------------------------------------------------
-- STAFF (1 gerente, 2 hostess, 2 meseros)
-- ---------------------------------------------------------------------
INSERT INTO public.staff (id, nombre, email, rol, pin_acceso, activo) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Laura Menéndez',   'laura.menendez@tizonmeats.com',   'gerencia', '4821', TRUE),
    ('11111111-1111-1111-1111-111111111102', 'Sofía Ramírez',    'sofia.ramirez@tizonmeats.com',    'hostess',  '1930', TRUE),
    ('11111111-1111-1111-1111-111111111103', 'Diego Castillo',   'diego.castillo@tizonmeats.com',   'hostess',  '7654', TRUE),
    ('11111111-1111-1111-1111-111111111104', 'Mateo Fuentes',    'mateo.fuentes@tizonmeats.com',    'mesero',   '3312', TRUE),
    ('11111111-1111-1111-1111-111111111105', 'Valentina Ortega', 'valentina.ortega@tizonmeats.com', 'mesero',   '5589', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- MESAS (Mesa 01 a Mesa 20) con distintas capacidades y zonas
--   01-10: salón principal | 11-16: terraza | 17-20: privado
-- ---------------------------------------------------------------------
INSERT INTO public.mesas (id, numero, capacidad, zona, estado, activa) VALUES
    ('a0000000-0000-0000-0000-000000000001',  1, 2, 'salon_principal', 'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000002',  2, 2, 'salon_principal', 'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000003',  3, 4, 'salon_principal', 'ocupada',   TRUE),
    ('a0000000-0000-0000-0000-000000000004',  4, 4, 'salon_principal', 'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000005',  5, 4, 'salon_principal', 'reservada', TRUE),
    ('a0000000-0000-0000-0000-000000000006',  6, 6, 'salon_principal', 'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000007',  7, 6, 'salon_principal', 'ocupada',   TRUE),
    ('a0000000-0000-0000-0000-000000000008',  8, 2, 'salon_principal', 'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000009',  9, 4, 'salon_principal', 'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000010', 10, 8, 'salon_principal', 'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000011', 11, 2, 'terraza',         'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000012', 12, 4, 'terraza',         'reservada', TRUE),
    ('a0000000-0000-0000-0000-000000000013', 13, 4, 'terraza',         'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000014', 14, 6, 'terraza',         'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000015', 15, 6, 'terraza',         'por_salir', TRUE),
    ('a0000000-0000-0000-0000-000000000016', 16, 8, 'terraza',         'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000017', 17, 4, 'privado',         'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000018', 18, 6, 'privado',         'libre',     TRUE),
    ('a0000000-0000-0000-0000-000000000019', 19, 10,'privado',         'reservada', TRUE),
    ('a0000000-0000-0000-0000-000000000020', 20, 12,'privado',         'libre',     TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- CLIENTES (10 ejemplos con términos de carne, alergias y etiquetas)
-- ---------------------------------------------------------------------
INSERT INTO public.clientes
    (id, nombre, telefono, email, termino_carne_preferido, alergias, mesa_favorita_id, total_visitas, total_gastado, etiquetas, notas) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Ricardo Salazar',   '+525512345001', 'ricardo.salazar@email.com', 'tres_cuartos',    '{}',                    'a0000000-0000-0000-0000-000000000019', 24, 48250.00, '{VIP,corporativo}',   'Prefiere el privado. Siempre pide corte tomahawk.'),
    ('c0000000-0000-0000-0000-000000000002', 'Ana Lucía Moreno',  '+525512345002', 'analucia.moreno@email.com', 'medio',           '{mariscos}',            'a0000000-0000-0000-0000-000000000012', 12, 18600.00, '{VIP}',               'Alérgica a mariscos, avisar a cocina.'),
    ('c0000000-0000-0000-0000-000000000003', 'Jorge Villanueva',  '+525512345003', 'jorge.villanueva@email.com','bien_cocido',     '{}',                    NULL,                                    3,  4200.00,  '{}',                  'Le gusta la carne bien cocida.'),
    ('c0000000-0000-0000-0000-000000000004', 'María Fernanda Ruiz','+525512345004','mafer.ruiz@email.com',      'vuelta_y_vuelta', '{gluten}',              'a0000000-0000-0000-0000-000000000005', 8,  11750.00, '{cumpleanos}',        'Celebra su cumpleaños en septiembre. Sin gluten.'),
    ('c0000000-0000-0000-0000-000000000005', 'Emilio Cárdenas',   '+525512345005', 'emilio.cardenas@email.com', 'tres_cuartos',    '{}',                    NULL,                                    1,  1350.00,  '{}',                  'Primera visita registrada.'),
    ('c0000000-0000-0000-0000-000000000006', 'Patricia Guzmán',   '+525512345006', 'patricia.guzman@email.com', 'medio',           '{lactosa}',             'a0000000-0000-0000-0000-000000000014', 15, 22300.00, '{VIP,cumpleanos}',    'Intolerante a la lactosa.'),
    ('c0000000-0000-0000-0000-000000000007', 'Fernando Aguirre',  '+525512345007', 'fernando.aguirre@email.com','bien_cocido',     '{}',                    NULL,                                    6,  9800.00,  '{corporativo}',       'Reserva a nombre de su empresa con frecuencia.'),
    ('c0000000-0000-0000-0000-000000000008', 'Gabriela Ponce',    '+525512345008', 'gabriela.ponce@email.com',  'medio',           '{nueces,mariscos}',     NULL,                                    4,  6500.00,  '{}',                  'Doble alergia: nueces y mariscos.'),
    ('c0000000-0000-0000-0000-000000000009', 'Andrés Beltrán',    '+525512345009', 'andres.beltran@email.com',  'tres_cuartos',    '{}',                    'a0000000-0000-0000-0000-000000000007', 19, 33400.00, '{VIP}',               'Cliente frecuente de fin de semana.'),
    ('c0000000-0000-0000-0000-000000000010', 'Carmen Delgado',    '+525512345010', 'carmen.delgado@email.com',  'vuelta_y_vuelta', '{}',                    NULL,                                    2,  2900.00,  '{cumpleanos}',        'Le gusta la mesa en terraza.')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- RESERVAS ACTIVAS (3 ejemplos) — fecha = hoy
-- ---------------------------------------------------------------------
INSERT INTO public.reservas
    (id, cliente_id, mesa_id, fecha, hora_inicio, hora_fin, num_comensales, estado, codigo_unico, notas_servicio, creado_por) VALUES
    ('e0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000019',
        CURRENT_DATE, '20:00', '22:00', 8, 'confirmada', 'TZN-8842',
        'Cliente VIP. Preparar zona privada. Corte tomahawk reservado.',
        '11111111-1111-1111-1111-111111111102'),
    ('e0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005',
        CURRENT_DATE, '21:00', '22:30', 4, 'confirmada', 'TZN-3157',
        'Cumpleaños. Sin gluten. Preparar postre con vela.',
        '11111111-1111-1111-1111-111111111103'),
    ('e0000000-0000-0000-0000-000000000003',
        'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000012',
        CURRENT_DATE, '19:30', '21:00', 3, 'pendiente', 'TZN-6094',
        'Alergia a mariscos: avisar a cocina. Mesa en terraza.',
        '11111111-1111-1111-1111-111111111102')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- OCUPACIÓN DE MESAS (ejemplos para el motor de pacing)
-- ---------------------------------------------------------------------
INSERT INTO public.ocupacion_mesas (id, mesa_id, reserva_id, hora_inicio, hora_fin, num_comensales) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', NULL,
        now() - INTERVAL '45 minutes', NULL, 4),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007',
        'e0000000-0000-0000-0000-000000000003'::uuid, now() - INTERVAL '30 minutes', NULL, 3)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- LISTA DE ESPERA (ejemplos de walk-ins)
-- ---------------------------------------------------------------------
INSERT INTO public.lista_espera
    (id, cliente_id, nombre_grupo, num_personas, telefono, estado, tiempo_espera_estimado, mesa_asignada_id) VALUES
    ('f0000000-0000-0000-0000-000000000001', NULL, 'Familia López', 5, '+525512399001', 'esperando', 25, NULL),
    ('f0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000010', 'Carmen Delgado', 2, '+525512345010', 'avisado', 10, NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- REGISTRO SMS (ejemplos de mensajería bidireccional)
-- ---------------------------------------------------------------------
INSERT INTO public.sms_log (cliente_id, telefono, tipo, mensaje, estado, respuesta_cliente) VALUES
    ('c0000000-0000-0000-0000-000000000001', '+525512345001', 'confirmacion',
        'Hola Ricardo, tu reserva en Tizón Meats para hoy a las 20:00 (8 personas) está confirmada. Código: TZN-8842.',
        'respondido', 'Confirmado, gracias!'),
    ('c0000000-0000-0000-0000-000000000004', '+525512345004', 'recordatorio',
        'Hola María Fernanda, te esperamos hoy a las 21:00 en Tizón Meats. Código: TZN-3157.',
        'enviado', NULL),
    ('c0000000-0000-0000-0000-000000000010', '+525512345010', 'lista_espera',
        'Hola Carmen, tu mesa en Tizón Meats está casi lista. Por favor acércate a la hostess. ¡Gracias!',
        'enviado', NULL);

-- =====================================================================
-- FIN DEL SEED
-- =====================================================================
