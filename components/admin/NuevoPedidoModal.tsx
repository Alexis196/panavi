'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Plus, Minus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Producto, Profile } from '@/types/database'

interface Props {
  onClose: () => void
  onCreated: () => void
}

interface LineaPedido {
  producto: Producto
  cantidad: number
}

export default function NuevoPedidoModal({ onClose, onCreated }: Props) {
  const supabase = createClient()
  const [clientes, setClientes] = useState<Profile[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [clienteId, setClienteId] = useState('')
  const [lineas, setLineas] = useState<LineaPedido[]>([])
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('role', 'cliente').order('full_name'),
      supabase.from('productos').select('*').eq('activo', true).order('nombre'),
    ]).then(([{ data: c }, { data: p }]) => {
      setClientes(c ?? [])
      setProductos(p ?? [])
    })
  }, [])

  const agregarProducto = (producto: Producto) => {
    setLineas((prev) => {
      const exists = prev.find((l) => l.producto.id === producto.id)
      if (exists) return prev.map((l) =>
        l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l
      )
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (productoId: string, delta: number) => {
    setLineas((prev) =>
      prev
        .map((l) => l.producto.id === productoId ? { ...l, cantidad: l.cantidad + delta } : l)
        .filter((l) => l.cantidad > 0)
    )
  }

  const total = lineas.reduce((acc, l) => acc + l.producto.precio * l.cantidad, 0)

  const handleSubmit = async () => {
    if (!clienteId) { toast.error('Seleccioná un cliente'); return }
    if (lineas.length === 0) { toast.error('Agregá al menos un producto'); return }
    setSaving(true)

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert({ cliente_id: clienteId, total, notas: notas || null, estado: 'confirmado' })
      .select()
      .single()

    if (error || !pedido) { toast.error('Error al crear pedido'); setSaving(false); return }

    const detalles = lineas.map((l) => ({
      pedido_id: pedido.id,
      producto_id: l.producto.id,
      cantidad: l.cantidad,
      precio_unitario: l.producto.precio,
    }))

    const { error: errorDetalle } = await supabase.from('detalle_pedidos').insert(detalles)
    if (errorDetalle) { toast.error('Error al guardar detalles'); setSaving(false); return }

    toast.success('Pedido creado correctamente')
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD0B0]">
          <h2 className="font-bold text-[#3E3124] text-lg">Nuevo pedido</h2>
          <button onClick={onClose} className="text-[#8A7660] hover:text-[#3E3124]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-[#3E3124] mb-1">Cliente *</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          {/* Agregar productos */}
          <div>
            <label className="block text-sm font-medium text-[#3E3124] mb-2">Productos</label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-[#DDD0B0] rounded-xl p-3">
              {productos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => agregarProducto(p)}
                  className="flex items-center justify-between px-3 py-2 bg-[#E7D7B1] hover:bg-[#D4A65A] rounded-lg text-left transition-colors"
                >
                  <span className="text-xs text-[#3E3124] font-medium truncate">{p.nombre}</span>
                  <span className="text-xs text-[#8A7660] ml-2 shrink-0">${p.precio.toLocaleString('es-AR')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lineas del pedido */}
          {lineas.length > 0 && (
            <div className="border border-[#DDD0B0] rounded-xl overflow-hidden">
              <div className="bg-[#E7D7B1] px-4 py-2 text-xs font-semibold text-[#3E3124]">
                Detalle del pedido
              </div>
              {lineas.map((linea) => (
                <div key={linea.producto.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[#DDD0B0] last:border-0">
                  <span className="text-sm text-[#3E3124] flex-1">{linea.producto.nombre}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(linea.producto.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-[#E7D7B1] hover:bg-[#D4A65A] rounded text-[#3E3124] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-[#3E3124]">{linea.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(linea.producto.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-[#E7D7B1] hover:bg-[#D4A65A] rounded text-[#3E3124] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-sm text-[#8A7660] w-24 text-right">
                      ${(linea.producto.precio * linea.cantidad).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-[#E7D7B1] flex justify-between">
                <span className="font-semibold text-[#3E3124] text-sm">Total</span>
                <span className="font-bold text-[#3E3124]">${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-[#3E3124] mb-1">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DDD0B0] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#DDD0B0] rounded-xl text-[#8A7660] text-sm hover:bg-[#E7D7B1] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#C97B4B] hover:bg-[#A5623C] disabled:opacity-60 text-[#FFFDF8] font-semibold text-sm rounded-xl transition-colors"
          >
            {saving ? 'Guardando...' : 'Crear pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
