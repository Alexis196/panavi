'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Send, Plus, X, Minus, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  nombre: z.string().min(2, 'Ingresá tu nombre'),
  telefono: z.string().min(8, 'Ingresá un teléfono válido'),
  fecha_evento: z.string().optional(),
  notas: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface ItemPedido {
  productoId: string
  nombre: string
  cantidad: number
}

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493704000000'

export default function PresupuestoRapido() {
  const supabase = createClient()
  const [productos, setProductos] = useState<{ id: string; nombre: string }[]>([])
  const [items, setItems] = useState<ItemPedido[]>([])
  const [seleccionado, setSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [listaAbierta, setListaAbierta] = useState(false)

  useEffect(() => {
    supabase.from('productos').select('id, nombre').eq('activo', true).order('nombre')
      .then(({ data }) => setProductos(data ?? []))
  }, [])

  const agregarItem = () => {
    const prod = productos.find(p => p.id === seleccionado)
    if (!prod) return
    if (items.length === 0) setListaAbierta(true)
    setItems(prev => {
      const existing = prev.find(i => i.productoId === seleccionado)
      if (existing) {
        return prev.map(i => i.productoId === seleccionado ? { ...i, cantidad: i.cantidad + cantidad } : i)
      }
      return [...prev, { productoId: prod.id, nombre: prod.nombre, cantidad }]
    })
    setSeleccionado('')
    setCantidad(1)
  }

  const quitarItem = (id: string) => setItems(prev => prev.filter(i => i.productoId !== id))

  const cambiarCantidad = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(i => i.productoId === id ? { ...i, cantidad: i.cantidad + delta } : i)
          .filter(i => i.cantidad > 0)
    )
  }

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    if (items.length === 0) {
      toast.error('Agregá al menos un producto')
      return
    }
    const lista = items.map(i => `• ${i.nombre} x${i.cantidad}`).join('\n')
    const msg = encodeURIComponent(
      `*Nuevo pedido - Panavi*\n\n` +
      `👤 Nombre: ${data.nombre}\n` +
      `📞 Teléfono: ${data.telefono}\n` +
      `🛒 Productos:\n${lista}\n` +
      (data.fecha_evento ? `📅 Fecha de evento: ${data.fecha_evento}\n` : '') +
      (data.notas ? `📝 Notas: ${data.notas}` : '')
    )
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank')
    toast.success('¡Redirigiendo a WhatsApp!')
    reset()
    setItems([])
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-[#DDD0B0] p-6 shadow-sm space-y-4"
    >
      <h3 className="font-semibold text-[#3E3124] text-lg mb-2">Formulario rápido</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#3E3124] mb-1">Nombre *</label>
          <input
            {...register('nombre')}
            placeholder="Tu nombre"
            className="w-full border border-[#DDD0B0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
          />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3E3124] mb-1">Teléfono *</label>
          <input
            {...register('telefono')}
            placeholder="Tu teléfono"
            className="w-full border border-[#DDD0B0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
          />
          {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3E3124] mb-1">¿Qué necesitás? *</label>
        <div className="space-y-2">
          <select
            value={seleccionado}
            onChange={e => setSeleccionado(e.target.value)}
            className="w-full border border-[#DDD0B0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
          >
            <option value="">Seleccioná un producto...</option>
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={e => setCantidad(Math.max(1, Number(e.target.value)))}
              className="w-20 border border-[#DDD0B0] rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124] text-center"
            />
            <button
              type="button"
              onClick={agregarItem}
              disabled={!seleccionado}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#C97B4B] hover:bg-[#A5623C] disabled:opacity-40 text-[#FFFDF8] px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-2 border border-[#DDD0B0] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setListaAbierta(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#F8F4EC] text-sm font-medium text-[#3E3124] cursor-pointer"
            >
              <span>{items.length} {items.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}</span>
              <ChevronDown className={`w-4 h-4 text-[#8A7660] transition-transform duration-200 ${listaAbierta ? 'rotate-180' : ''}`} />
            </button>
            {listaAbierta && (
              <ul className="divide-y divide-[#DDD0B0] max-h-48 overflow-y-auto">
                {items.map(item => (
                  <li
                    key={item.productoId}
                    className="flex items-center justify-between px-3 py-2 text-sm bg-white"
                  >
                    <span className="text-[#3E3124] font-medium truncate mr-2">{item.nombre}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.productoId, -1)}
                        className="text-[#8A7660] hover:text-[#3E3124] transition-colors cursor-pointer p-0.5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[#3E3124] font-medium w-6 text-center">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.productoId, 1)}
                        className="text-[#8A7660] hover:text-[#3E3124] transition-colors cursor-pointer p-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => quitarItem(item.productoId)}
                        className="text-[#8A7660] hover:text-red-500 transition-colors cursor-pointer p-0.5 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3E3124] mb-1">Fecha del evento (opcional)</label>
        <input
          type="date"
          {...register('fecha_evento')}
          className="w-full border border-[#DDD0B0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3E3124] mb-1">Notas adicionales</label>
        <textarea
          {...register('notas')}
          rows={2}
          placeholder="Detalles, sabores, diseño..."
          className="w-full border border-[#DDD0B0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#C97B4B] hover:bg-[#A5623C] disabled:opacity-50 text-[#FFFDF8] font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
      >
        <Send className="w-4 h-4" />
        Enviar por WhatsApp
      </button>
    </form>
  )
}
