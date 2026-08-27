import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import { PushService } from '../push/push.service';

// Estados posibles de un pedido y de una comanda (líneas del pedido).
export type EstadoPedido = 'abierto' | 'en_cocina' | 'listo' | 'cerrado' | 'cancelado';
export type EstadoComanda = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';

export interface ItemComandaInput {
  menu_item_id: string;
  cantidad?: number;
  notas?: string;
}

/**
 * Servicio del Sistema de Pedidos & Comandas.
 *
 * Gestiona la carta (menu_items), los pedidos abiertos por mesa y las
 * comandas (líneas de cada pedido). Todas las consultas usan el cliente
 * admin de Supabase (service role), por lo que omiten RLS.
 */
@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  // ── MENÚ ───────────────────────────────────────────────────────────────
  /** Devuelve la carta completa (opcionalmente filtrada por categoría). */
  async obtenerMenuItems(categoria?: string) {
    let query = supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('disponible', true)
      .order('categoria', { ascending: true })
      .order('precio', { ascending: true });

    if (categoria) query = query.eq('categoria', categoria);

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener menú: ${error.message}`);
    return data || [];
  }

  // ── PEDIDOS ────────────────────────────────────────────────────────────
  /**
   * Crea un pedido nuevo para una mesa. Si ya existe un pedido activo
   * (abierto/en_cocina/listo) para esa mesa, lo devuelve en lugar de crear
   * uno duplicado.
   */
  async crearPedido(mesaNumero: number, meseroNombre = 'Personal') {
    const existente = await this.obtenerPedidoActivo(mesaNumero);
    if (existente) return existente;

    // Buscar el UUID de la mesa por su número (puede no existir).
    const { data: mesa } = await supabaseAdmin
      .from('mesas')
      .select('id')
      .eq('numero', mesaNumero)
      .maybeSingle();

    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .insert([
        {
          mesa_id: mesa?.id ?? null,
          mesa_numero: mesaNumero,
          estado: 'abierto',
          mesero_nombre: meseroNombre,
          total: 0,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Error al crear pedido: ${error.message}`);
    this.logger.log(`Pedido creado para mesa ${mesaNumero} (${data.id})`);
    return { ...data, comandas: [] };
  }

  /**
   * Devuelve el pedido activo de una mesa (estado abierto/en_cocina/listo)
   * junto con sus comandas. Devuelve null si no hay ninguno activo.
   */
  async obtenerPedidoActivo(mesaNumero: number) {
    const { data: pedido, error } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('mesa_numero', mesaNumero)
      .in('estado', ['abierto', 'en_cocina', 'listo'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`Error al obtener pedido: ${error.message}`);
    if (!pedido) return null;

    const comandas = await this.obtenerComandas(pedido.id);
    return { ...pedido, comandas };
  }

  /**
   * Lista todos los pedidos activos (para la vista de cocina), ordenados
   * del más antiguo al más reciente, cada uno con sus comandas.
   */
  async obtenerTodosPedidos() {
    const { data: pedidos, error } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .in('estado', ['abierto', 'en_cocina', 'listo'])
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Error al obtener pedidos: ${error.message}`);
    if (!pedidos || pedidos.length === 0) return [];

    const ids = pedidos.map((p) => p.id);
    const { data: comandas } = await supabaseAdmin
      .from('comandas')
      .select('*')
      .in('pedido_id', ids)
      .order('created_at', { ascending: true });

    const porPedido: Record<string, any[]> = {};
    (comandas || []).forEach((c) => {
      (porPedido[c.pedido_id] = porPedido[c.pedido_id] || []).push(c);
    });

    return pedidos.map((p) => ({ ...p, comandas: porPedido[p.id] || [] }));
  }

  private async obtenerComandas(pedidoId: string) {
    const { data, error } = await supabaseAdmin
      .from('comandas')
      .select('*')
      .eq('pedido_id', pedidoId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Error al obtener comandas: ${error.message}`);
    return data || [];
  }

  // ── COMANDAS ───────────────────────────────────────────────────────────
  /**
   * Agrega uno o varios items a un pedido. Toma el nombre y precio del
   * menú en el momento de agregar (snapshot), recalcula el total del
   * pedido y notifica a la cocina.
   */
  async agregarComandas(pedidoId: string, items: ItemComandaInput[]) {
    const pedido = await this.obtenerPedidoPorId(pedidoId);
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (!items || items.length === 0) throw new Error('No hay items para agregar');

    // Traer los datos de menú de los items solicitados.
    const menuIds = [...new Set(items.map((i) => i.menu_item_id))];
    const { data: menuData, error: menuErr } = await supabaseAdmin
      .from('menu_items')
      .select('id, nombre, precio')
      .in('id', menuIds);

    if (menuErr) throw new Error(`Error al leer menú: ${menuErr.message}`);
    const menuMap = new Map((menuData || []).map((m) => [m.id, m]));

    const filas = items
      .map((item) => {
        const m = menuMap.get(item.menu_item_id);
        if (!m) return null;
        const cantidad = item.cantidad && item.cantidad > 0 ? item.cantidad : 1;
        return {
          pedido_id: pedidoId,
          menu_item_id: item.menu_item_id,
          nombre_item: m.nombre,
          precio_unitario: m.precio,
          cantidad,
          estado: 'pendiente',
          notas: item.notas || null,
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);

    if (filas.length === 0) throw new Error('Los items indicados no existen en el menú');

    const { data: insertadas, error } = await supabaseAdmin
      .from('comandas')
      .insert(filas)
      .select();

    if (error) throw new Error(`Error al agregar comandas: ${error.message}`);

    await this.recalcularTotal(pedidoId);

    // Notificar a la cocina (best-effort, no bloquea la respuesta).
    const totalItems = filas.reduce((s, f) => s + f.cantidad, 0);
    this.pushService
      .enviarNotificacion(
        await this.tokensCocina(),
        '🍽️ Nuevo pedido',
        `Mesa ${pedido.mesa_numero} — ${totalItems} item(s)`,
        { pantalla: 'Cocina', tipo: 'nuevo_pedido', pedidoId },
      )
      .catch((e) => this.logger.warn(`No se pudo notificar cocina: ${e}`));

    return insertadas;
  }

  /** Actualiza el estado de una comanda individual (usado por cocina). */
  async actualizarEstadoComanda(comandaId: string, estado: EstadoComanda) {
    const { data, error } = await supabaseAdmin
      .from('comandas')
      .update({ estado })
      .eq('id', comandaId)
      .select()
      .single();
    if (error) throw new Error(`Error al actualizar comanda: ${error.message}`);
    return data;
  }

  /** Actualiza el estado global del pedido (abierto → en_cocina → listo …). */
  async actualizarEstadoPedido(pedidoId: string, estado: EstadoPedido) {
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', pedidoId)
      .select()
      .single();
    if (error) throw new Error(`Error al actualizar pedido: ${error.message}`);

    // Si el pedido pasa a cocina, avisar y marcar las comandas pendientes.
    if (estado === 'en_cocina') {
      await supabaseAdmin
        .from('comandas')
        .update({ estado: 'en_preparacion' })
        .eq('pedido_id', pedidoId)
        .eq('estado', 'pendiente');

      this.pushService
        .enviarNotificacion(
          await this.tokensCocina(),
          '👨‍🍳 Pedido a cocina',
          `Mesa ${data.mesa_numero} — preparar`,
          { pantalla: 'Cocina', tipo: 'pedido_cocina', pedidoId },
        )
        .catch((e) => this.logger.warn(`No se pudo notificar cocina: ${e}`));
    }

    return data;
  }

  /**
   * Cierra el pedido: recalcula el total definitivo, marca el pedido como
   * 'cerrado' y devuelve la cuenta completa con desglose de impuestos.
   */
  async cerrarPedido(pedidoId: string) {
    const total = await this.recalcularTotal(pedidoId);

    const { error } = await supabaseAdmin
      .from('pedidos')
      .update({ estado: 'cerrado', total, updated_at: new Date().toISOString() })
      .eq('id', pedidoId);
    if (error) throw new Error(`Error al cerrar pedido: ${error.message}`);

    this.logger.log(`Pedido ${pedidoId} cerrado. Total: ${total}`);
    return this.obtenerCuenta(pedidoId);
  }

  /**
   * Devuelve el detalle de la cuenta de un pedido con subtotal, impuesto
   * (18% ITBIS) y total, listo para imprimir el comprobante.
   */
  async obtenerCuenta(pedidoId: string) {
    const pedido = await this.obtenerPedidoPorId(pedidoId);
    if (!pedido) throw new NotFoundException('Pedido no encontrado');

    const comandas = await this.obtenerComandas(pedidoId);
    const activas = comandas.filter((c) => c.estado !== 'cancelado');

    const subtotal = activas.reduce(
      (s, c) => s + Number(c.precio_unitario) * Number(c.cantidad),
      0,
    );
    const impuesto = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + impuesto) * 100) / 100;

    return {
      pedido_id: pedido.id,
      mesa_numero: pedido.mesa_numero,
      mesero_nombre: pedido.mesero_nombre,
      estado: pedido.estado,
      restaurante: 'Tizón Meats',
      items: activas.map((c) => ({
        id: c.id,
        nombre: c.nombre_item,
        cantidad: c.cantidad,
        precio_unitario: Number(c.precio_unitario),
        subtotal: Math.round(Number(c.precio_unitario) * Number(c.cantidad) * 100) / 100,
        estado: c.estado,
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      impuesto,
      impuesto_pct: 18,
      total,
      created_at: pedido.created_at,
    };
  }

  // ── Helpers privados ─────────────────────────────────────────────────────
  private async obtenerPedidoPorId(pedidoId: string) {
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .maybeSingle();
    if (error) throw new Error(`Error al obtener pedido: ${error.message}`);
    return data;
  }

  /** Recalcula y persiste el total del pedido (suma de comandas activas). */
  private async recalcularTotal(pedidoId: string): Promise<number> {
    const comandas = await this.obtenerComandas(pedidoId);
    const total = comandas
      .filter((c) => c.estado !== 'cancelado')
      .reduce((s, c) => s + Number(c.precio_unitario) * Number(c.cantidad), 0);
    const totalRedondeado = Math.round(total * 100) / 100;

    await supabaseAdmin
      .from('pedidos')
      .update({ total: totalRedondeado, updated_at: new Date().toISOString() })
      .eq('id', pedidoId);

    return totalRedondeado;
  }

  /** Obtiene los tokens de push del staff para notificar a cocina. */
  private async tokensCocina(): Promise<string[]> {
    try {
      const { data } = await supabaseAdmin.from('push_tokens').select('token');
      return (data || []).map((r) => r.token).filter(Boolean);
    } catch {
      return [];
    }
  }

  constructor(private readonly pushService: PushService) {}
}
