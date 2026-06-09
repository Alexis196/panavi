'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, TrendingDown, Download } from 'lucide-react'
import { Gasto } from '@/types/database'
import Loader from '@/components/ui/Loader'

const CATEGORIAS = ['Ingredientes', 'Alquiler', 'Servicios', 'Sueldos', 'Equipamiento', 'Mantenimiento', 'Otros']

const schema = z.object({
  descripcion: z.string().min(2, 'Descripción requerida'),
  monto: z.string().min(1, 'Ingresá el monto').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Monto inválido'),
  categoria: z.string().min(1, 'Seleccioná una categoría'),
  fecha: z.string().min(1, 'Ingresá la fecha'),
})
type FormData = z.infer<typeof schema>

export default function GastosPage() {
  const supabase = createClient()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState(0) // 0 = mes actual, 1 = mes anterior
  const [catFiltro, setCatFiltro] = useState('todos')
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: format(new Date(), 'yyyy-MM-dd') },
  })

  const fetchGastos = useCallback(async () => {
    setLoading(true)
    const ref = periodo === 0 ? new Date() : subMonths(new Date(), 1)
    const start = startOfMonth(ref).toISOString()
    const end = endOfMonth(ref).toISOString()
    let query = supabase
      .from('gastos')
      .select('*')
      .gte('fecha', start)
      .lte('fecha', end)
      .order('fecha', { ascending: false })
    if (catFiltro !== 'todos') query = query.eq('categoria', catFiltro)
    const { data } = await query
    setGastos(data ?? [])
    setLoading(false)
  }, [periodo, catFiltro])

  useEffect(() => { fetchGastos() }, [fetchGastos])

  const onSubmit = async (data: FormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('gastos').insert({
      descripcion: data.descripcion,
      monto: Number(data.monto),
      categoria: data.categoria,
      fecha: new Date(data.fecha).toISOString(),
      registrado_por: user.id,
    })
    if (error) { toast.error('Error al guardar'); return }
    toast.success('Gasto registrado')
    reset()
    setShowForm(false)
    fetchGastos()
  }

  const totalMes = gastos.reduce((acc, g) => acc + Number(g.monto), 0)

  const exportarExcel = () => {
    const headers = ['Descripción', 'Categoría', 'Fecha', 'Monto']
    const rows = gastos.map((g) => [
      g.descripcion,
      g.categoria,
      format(new Date(g.fecha), 'dd/MM/yyyy', { locale: es }),
      Number(g.monto).toFixed(2),
    ])
    const csv = [headers, ...rows, ['', '', 'TOTAL', totalMes.toFixed(2)]]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const mes = periodo === 0 ? format(new Date(), 'yyyy-MM') : format(subMonths(new Date(), 1), 'yyyy-MM')
    a.href = url
    a.download = `gastos-panavi-${mes}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3E3124]">Gastos / Egresos</h1>
        <div className="flex gap-2">
          <button
            onClick={exportarExcel}
            disabled={gastos.length === 0}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar gasto
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#DDD0B0] p-6 mb-6">
          <h2 className="font-semibold text-[#3E3124] mb-4">Nuevo egreso</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#3E3124] mb-1">Descripción *</label>
              <input
                {...register('descripcion')}
                placeholder="Ej: Compra de harina"
                className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#3E3124] mb-1">Monto *</label>
              <input
                {...register('monto')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              />
              {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#3E3124] mb-1">Categoría *</label>
              <select
                {...register('categoria')}
                className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#3E3124] mb-1">Fecha *</label>
              <input
                {...register('fecha')}
                type="date"
                className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#DDD0B0] rounded-xl text-[#8A7660] text-sm hover:bg-[#E7D7B1] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#C97B4B] hover:bg-[#A5623C] disabled:opacity-60 text-[#FFFDF8] font-semibold text-sm rounded-xl transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar gasto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Período */}
        <div className="flex gap-2">
          {['Mes actual', 'Mes anterior'].map((label, i) => (
            <button
              key={i}
              onClick={() => setPeriodo(i)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                periodo === i ? 'bg-[#C97B4B] text-[#FFFDF8]' : 'bg-[#E7D7B1] text-[#3E3124] hover:bg-[#D4A65A]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Categoría */}
        <select
          value={catFiltro}
          onChange={(e) => setCatFiltro(e.target.value)}
          className="border border-[#DDD0B0] rounded-xl px-3 py-1.5 text-sm text-[#3E3124] focus:outline-none focus:border-[#C97B4B]"
        >
          <option value="todos">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Total */}
        <div className="ml-auto flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-1.5">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <span className="text-sm font-bold text-red-700">
            Total: ${totalMes.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden">
        {loading ? (
          <Loader />
        ) : gastos.length === 0 ? (
          <div className="p-12 text-center text-[#8A7660]">No hay gastos registrados en este período</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#E7D7B1] text-[#3E3124]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Descripción</th>
                  <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD0B0]">
                {gastos.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F8F4EC]">
                    <td className="px-4 py-3 text-[#3E3124]">{g.descripcion}</td>
                    <td className="px-4 py-3">
                      <span className="bg-[#E7D7B1] text-[#C97B4B] px-2 py-0.5 rounded text-xs font-medium">
                        {g.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8A7660]">
                      {format(new Date(g.fecha), "d MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      -${Number(g.monto).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
