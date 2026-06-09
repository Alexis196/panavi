import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Package, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default async function ClienteDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: cuenta }, { data: pedidos }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('cuentas_corrientes').select('saldo').eq('cliente_id', user.id).single(),
    supabase
      .from('pedidos')
      .select('*')
      .eq('cliente_id', user.id)
      .order('fecha', { ascending: false })
      .limit(5),
  ])

  const saldo = cuenta?.saldo ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#3E3124]">
          ¡Hola, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-[#8A7660]">Bienvenido a tu panel de Panavi</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#DDD0B0] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#E7D7B1] p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#C97B4B]" />
            </div>
            <span className="text-sm text-[#8A7660]">Cuenta corriente</span>
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {saldo >= 0 ? '+' : ''} ${Math.abs(saldo).toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-[#8A7660] mt-1">
            {saldo >= 0 ? 'Saldo a favor' : 'Saldo pendiente'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDD0B0] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#E7D7B1] p-2 rounded-xl">
              <Package className="w-5 h-5 text-[#C97B4B]" />
            </div>
            <span className="text-sm text-[#8A7660]">Total pedidos</span>
          </div>
          <p className="text-2xl font-bold text-[#3E3124]">{pedidos?.length ?? 0}</p>
          <p className="text-xs text-[#8A7660] mt-1">Últimos registros</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDD0B0] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#E7D7B1] p-2 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-[#C97B4B]" />
            </div>
            <span className="text-sm text-[#8A7660]">Estado</span>
          </div>
          <p className="text-2xl font-bold text-[#3E3124]">
            {pedidos?.filter((p) => p.estado === 'entregado').length ?? 0}
          </p>
          <p className="text-xs text-[#8A7660] mt-1">Pedidos entregados</p>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD0B0]">
          <h2 className="font-semibold text-[#3E3124]">Últimos pedidos</h2>
          <Link href="/cliente/pedidos" className="text-sm text-[#C97B4B] hover:underline">
            Ver todos
          </Link>
        </div>

        {(pedidos ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-12 text-[#8A7660]">
            <AlertCircle className="w-10 h-10 mb-3 opacity-40" />
            <p>No tenés pedidos todavía</p>
            <Link
              href="/pedidos"
              className="mt-3 text-sm text-[#C97B4B] font-medium hover:underline"
            >
              Hacer tu primer pedido →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#DDD0B0]">
            {(pedidos ?? []).map((pedido) => (
              <div key={pedido.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-[#3E3124] text-sm">
                    Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-[#8A7660]">
                    {format(new Date(pedido.fecha), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#3E3124] text-sm">
                    ${pedido.total.toLocaleString('es-AR')}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLORS[pedido.estado]}`}>
                    {pedido.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
