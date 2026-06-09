import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Package, PlusCircle } from 'lucide-react'
import Link from 'next/link'

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*, detalle_pedidos(*, productos(nombre))')
    .eq('cliente_id', user.id)
    .order('fecha', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3E3124]">Mis pedidos</h1>
        <Link
          href="/pedidos"
          className="flex items-center gap-2 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo pedido
        </Link>
      </div>

      {(pedidos ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DDD0B0] p-12 text-center text-[#8A7660]">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No tenés pedidos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(pedidos ?? []).map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden">
              <div className="flex items-start justify-between px-6 py-4 border-b border-[#DDD0B0] gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#3E3124]">
                    Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-[#8A7660] truncate">
                    {format(new Date(pedido.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-[#3E3124]">
                    ${pedido.total.toLocaleString('es-AR')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLORS[pedido.estado]}`}>
                    {pedido.estado}
                  </span>
                </div>
              </div>

              {/* Detalle */}
              <div className="px-6 py-3 space-y-1">
                {(pedido.detalle_pedidos ?? []).map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#3E3124]">
                      {item.cantidad}x {item.productos?.nombre}
                    </span>
                    <span className="text-[#8A7660]">
                      ${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
                {pedido.notas && (
                  <p className="text-xs text-[#8A7660] pt-2 border-t border-[#DDD0B0] mt-2">
                    Nota: {pedido.notas}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
