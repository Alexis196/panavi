'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import NuevoPedidoModal from '@/components/admin/NuevoPedidoModal'
import Loader from '@/components/ui/Loader'

const ESTADOS = ['todos', 'pendiente', 'confirmado', 'entregado', 'cancelado']
const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default function VentasPage() {
  const supabase = createClient()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [showModal, setShowModal] = useState(false)

  const fetchPedidos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('pedidos')
      .select('*, profiles(full_name), detalle_pedidos(*, productos(nombre))')
      .order('fecha', { ascending: false })
    if (estadoFiltro !== 'todos') query = query.eq('estado', estadoFiltro)
    const { data } = await query
    setPedidos(data ?? [])
    setLoading(false)
  }, [estadoFiltro])

  useEffect(() => { fetchPedidos() }, [fetchPedidos])

  const updateEstado = async (id: string, estado: string) => {
    const { error } = await supabase.from('pedidos').update({ estado }).eq('id', id)
    if (error) { toast.error('Error al actualizar'); return }
    toast.success('Estado actualizado')
    fetchPedidos()
  }

  const EstadoSelect = ({ pedido }: { pedido: any }) => (
    <div className="relative inline-block">
      <select
        value={pedido.estado}
        onChange={(e) => updateEstado(pedido.id, e.target.value)}
        className="appearance-none bg-[#E7D7B1] text-[#3E3124] text-xs px-3 py-1.5 pr-7 rounded-lg border border-[#DDD0B0] focus:outline-none focus:border-[#C97B4B] cursor-pointer"
      >
        {ESTADOS.filter(e => e !== 'todos').map((e) => (
          <option key={e} value={e} className="capitalize">{e}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A7660] pointer-events-none" />
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-[#3E3124]">Ventas y pedidos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] px-4 py-2 rounded-xl text-sm font-medium transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nuevo pedido
        </button>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 flex-wrap mb-6">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setEstadoFiltro(e)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${
              estadoFiltro === e
                ? 'bg-[#C97B4B] text-[#FFFDF8]'
                : 'bg-[#E7D7B1] text-[#3E3124] hover:bg-[#D4A65A]'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden">
        {loading ? (
          <Loader />
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center text-[#8A7660]">No hay pedidos</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#DDD0B0]">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 mr-3">
                      <p className="font-medium text-[#3E3124] truncate">{pedido.profiles?.full_name ?? 'N/A'}</p>
                      <p className="text-xs text-[#8A7660] font-mono">#{pedido.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <span className="font-bold text-[#3E3124] shrink-0">${Number(pedido.total).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-[#8A7660]">{format(new Date(pedido.fecha), "d MMM yyyy", { locale: es })}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLORS[pedido.estado]}`}>
                        {pedido.estado}
                      </span>
                      <EstadoSelect pedido={pedido} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#E7D7B1] text-[#3E3124]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold">Cambiar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD0B0]">
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-[#F8F4EC]">
                      <td className="px-4 py-3 text-[#8A7660] font-mono text-xs">
                        #{pedido.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-[#3E3124] font-medium">
                        {pedido.profiles?.full_name ?? 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-[#8A7660]">
                        {format(new Date(pedido.fecha), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#3E3124]">
                        ${Number(pedido.total).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLORS[pedido.estado]}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <EstadoSelect pedido={pedido} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <NuevoPedidoModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchPedidos() }}
        />
      )}
    </div>
  )
}
