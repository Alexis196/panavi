import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth } from 'date-fns'
import { ShoppingCart, TrendingDown, Package, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const now = new Date()
  const start = startOfMonth(now).toISOString()
  const end = endOfMonth(now).toISOString()

  const [
    { data: pedidosMes },
    { data: gastosMes },
    { data: stockCritico },
    { data: clientesActivos },
    { data: ultimosPedidos },
  ] = await Promise.all([
    supabase
      .from('pedidos')
      .select('total')
      .gte('fecha', start)
      .lte('fecha', end)
      .neq('estado', 'cancelado'),
    supabase
      .from('gastos')
      .select('monto')
      .gte('fecha', start)
      .lte('fecha', end),
    supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .filter('stock_actual', 'lte', 'stock_minimo'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'cliente'),
    supabase
      .from('pedidos')
      .select('*, profiles(full_name)')
      .order('fecha', { ascending: false })
      .limit(8),
  ])

  const ventasMes = (pedidosMes ?? []).reduce((acc, p) => acc + Number(p.total), 0)
  const totalGastos = (gastosMes ?? []).reduce((acc, g) => acc + Number(g.monto), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3E3124] mb-6">Dashboard</h1>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Ventas del mes',
            value: `$${ventasMes.toLocaleString('es-AR')}`,
            icon: ShoppingCart,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'Gastos del mes',
            value: `$${totalGastos.toLocaleString('es-AR')}`,
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
          {
            label: 'Stock crítico',
            value: String(stockCritico?.length ?? 0),
            icon: Package,
            color: stockCritico && stockCritico.length > 0 ? 'text-orange-600' : 'text-[#C97B4B]',
            bg: stockCritico && stockCritico.length > 0 ? 'bg-orange-50' : 'bg-[#E7D7B1]',
          },
          {
            label: 'Clientes activos',
            value: String(clientesActivos?.length ?? 0),
            icon: Users,
            color: 'text-[#C97B4B]',
            bg: 'bg-[#E7D7B1]',
          },
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-2xl border border-[#DDD0B0] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`${metric.bg} p-2 rounded-xl`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <span className="text-sm text-[#8A7660]">{metric.label}</span>
            </div>
            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Alertas de stock */}
      {stockCritico && stockCritico.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-orange-800">Alertas de stock</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {stockCritico.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-[#3E3124] font-medium">{p.nombre}</span>
                <span className="text-xs text-orange-600 font-semibold">
                  Stock: {p.stock_actual}/{p.stock_minimo}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/stock" className="text-sm text-orange-700 font-medium mt-3 inline-block hover:underline">
            Gestionar stock →
          </Link>
        </div>
      )}

      {/* Últimos pedidos */}
      <div className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD0B0]">
          <h2 className="font-semibold text-[#3E3124]">Últimos pedidos</h2>
          <Link href="/admin/ventas" className="text-sm text-[#C97B4B] hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="divide-y divide-[#DDD0B0]">
          {(ultimosPedidos ?? []).map((pedido: any) => (
            <div key={pedido.id} className="flex items-center justify-between px-6 py-3 gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#3E3124] text-sm truncate">
                  {pedido.profiles?.full_name ?? 'Cliente'}
                </p>
                <p className="text-xs text-[#8A7660]">#{pedido.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-[#3E3124] text-sm">
                  ${Number(pedido.total).toLocaleString('es-AR')}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLORS[pedido.estado]}`}>
                  {pedido.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
