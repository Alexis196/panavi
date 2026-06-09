export type Role = 'cliente' | 'admin'
export type EstadoPedido = 'pendiente' | 'confirmado' | 'entregado' | 'cancelado'
export type TipoMovimientoStock = 'entrada' | 'salida'
export type TipoMovimientoCuenta = 'debito' | 'credito'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: Role
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  categoria: string
  imagen_url: string | null
  activo: boolean
  stock_actual: number
  stock_minimo: number
}

export interface Pedido {
  id: string
  cliente_id: string
  fecha: string
  estado: EstadoPedido
  total: number
  notas: string | null
}

export interface DetallePedido {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
}

export interface Gasto {
  id: string
  descripcion: string
  monto: number
  categoria: string
  fecha: string
  registrado_por: string
}

export interface MovimientoStock {
  id: string
  producto_id: string
  tipo: TipoMovimientoStock
  cantidad: number
  motivo: string | null
  fecha: string
}

export interface CuentaCorriente {
  id: string
  cliente_id: string
  saldo: number
  ultima_actualizacion: string
}

export interface MovimientoCuenta {
  id: string
  cuenta_id: string
  tipo: TipoMovimientoCuenta
  monto: number
  descripcion: string | null
  fecha: string
}

type TableDef<TRow, TInsert, TUpdate> = {
  Row: TRow
  Insert: TInsert
  Update: TUpdate
  Relationships: unknown[]
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, Omit<Profile, 'created_at'>, Partial<Omit<Profile, 'id' | 'created_at'>>>
      productos: TableDef<Producto, Omit<Producto, 'id'>, Partial<Omit<Producto, 'id'>>>
      pedidos: TableDef<Pedido, Omit<Pedido, 'id'>, Partial<Omit<Pedido, 'id'>>>
      detalle_pedidos: TableDef<DetallePedido, Omit<DetallePedido, 'id'>, Partial<Omit<DetallePedido, 'id'>>>
      gastos: TableDef<Gasto, Omit<Gasto, 'id'>, Partial<Omit<Gasto, 'id'>>>
      movimientos_stock: TableDef<MovimientoStock, Omit<MovimientoStock, 'id'>, Partial<Omit<MovimientoStock, 'id'>>>
      cuentas_corrientes: TableDef<CuentaCorriente, Omit<CuentaCorriente, 'id'>, Partial<Omit<CuentaCorriente, 'id'>>>
      movimientos_cuenta: TableDef<MovimientoCuenta, Omit<MovimientoCuenta, 'id'>, Partial<Omit<MovimientoCuenta, 'id'>>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      role_tipo: 'cliente' | 'admin'
      estado_pedido: 'pendiente' | 'confirmado' | 'entregado' | 'cancelado'
      tipo_mov_stock: 'entrada' | 'salida'
      tipo_mov_cuenta: 'debito' | 'credito'
    }
    CompositeTypes: Record<string, never>
  }
}
