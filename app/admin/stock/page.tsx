'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Plus, Minus, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { Producto } from '@/types/database'
import Loader from '@/components/ui/Loader'

export default function StockPage() {
  const supabase = createClient()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ producto: Producto; tipo: 'entrada' | 'salida' } | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('productos').select('*').eq('activo', true).order('nombre')
    setProductos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProductos() }, [fetchProductos])

  const registrarMovimiento = async () => {
    if (!modal) return
    setSaving(true)
    const { error } = await supabase.from('movimientos_stock').insert({
      producto_id: modal.producto.id,
      tipo: modal.tipo,
      cantidad,
      motivo: motivo || null,
    })
    if (error) { toast.error('Error al registrar'); setSaving(false); return }
    toast.success('Movimiento registrado')
    setModal(null)
    setCantidad(1)
    setMotivo('')
    fetchProductos()
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3E3124] mb-6">Gestión de stock</h1>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#E7D7B1] text-[#3E3124]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Producto</th>
                  <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock actual</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock mínimo</th>
                  <th className="px-4 py-3 text-center font-semibold">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD0B0]">
                {productos.map((p) => {
                  const critico = p.stock_actual <= p.stock_minimo
                  return (
                    <tr key={p.id} className={critico ? 'bg-orange-50' : 'hover:bg-[#F8F4EC]'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {critico && <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />}
                          <span className="font-medium text-[#3E3124]">{p.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#8A7660]">{p.categoria}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-base ${critico ? 'text-orange-600' : 'text-[#3E3124]'}`}>
                          {p.stock_actual}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[#8A7660]">{p.stock_minimo}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          critico ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {critico ? 'Crítico' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => { setModal({ producto: p, tipo: 'entrada' }); setCantidad(1); setMotivo('') }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Entrada
                          </button>
                          <button
                            onClick={() => { setModal({ producto: p, tipo: 'salida' }); setCantidad(1); setMotivo('') }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                            Salida
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal movimiento */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${modal.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Package className={`w-5 h-5 ${modal.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="font-bold text-[#3E3124] capitalize">{modal.tipo} de stock</h3>
                <p className="text-sm text-[#8A7660]">{modal.producto.nombre}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#3E3124] mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E3124] mb-1">Motivo (opcional)</label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Producción del día, venta especial..."
                  className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-[#DDD0B0] rounded-xl text-[#8A7660] text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={registrarMovimiento}
                disabled={saving}
                className={`flex-1 py-2.5 font-semibold text-sm rounded-xl text-white transition-colors ${
                  modal.tipo === 'entrada'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-60`}
              >
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
