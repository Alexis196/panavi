'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check, ImagePlus } from 'lucide-react'
import { Producto } from '@/types/database'
import { convertToWebp } from '@/lib/utils/convertToWebp'
import Loader from '@/components/ui/Loader'

const CATEGORIAS = ['Panes', 'Facturas', 'Tortas', 'Dulces', 'Salados', 'Otros']

const schema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  descripcion: z.string().optional(),
  precio: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Precio inválido'),
  categoria: z.string().min(1, 'Seleccioná una categoría'),
  stock_actual: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Stock inválido'),
  stock_minimo: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Mínimo inválido'),
  activo: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function ProductosAdminPage() {
  const supabase = createClient()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [imgFile, setImgFile] = useState<File | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { activo: true, stock_actual: '0', stock_minimo: '5' },
  })

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('productos').select('*').order('nombre')
    setProductos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProductos() }, [fetchProductos])

  const openNuevo = () => {
    reset({ activo: true, stock_actual: '0', stock_minimo: '5' })
    setEditando(null)
    setImgPreview(null)
    setImgFile(null)
    setShowForm(true)
  }

  const openEditar = (p: Producto) => {
    setEditando(p)
    reset({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: String(p.precio),
      categoria: p.categoria,
      stock_actual: String(p.stock_actual),
      stock_minimo: String(p.stock_minimo),
      activo: p.activo,
    })
    setImgPreview(p.imagen_url)
    setImgFile(null)
    setShowForm(true)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const webp = await convertToWebp(file)
      setImgFile(webp)
      setImgPreview(URL.createObjectURL(webp))
    } catch {
      toast.error('No se pudo procesar la imagen')
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imgFile) return editando?.imagen_url ?? null
    setUploadingImg(true)
    const ext = imgFile.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('productos').upload(path, imgFile, { upsert: true })
    setUploadingImg(false)
    if (error) { toast.error('Error al subir imagen'); return null }
    const { data } = supabase.storage.from('productos').getPublicUrl(path)
    return data.publicUrl
  }

  const onSubmit = async (data: FormData) => {
    const imagen_url = await uploadImage()

    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      precio: Number(data.precio),
      categoria: data.categoria,
      stock_actual: Number(data.stock_actual),
      stock_minimo: Number(data.stock_minimo),
      activo: data.activo,
      imagen_url,
    }

    if (editando) {
      const { error } = await supabase.from('productos').update(payload).eq('id', editando.id)
      if (error) { toast.error('Error al actualizar'); return }
      toast.success('Producto actualizado')
    } else {
      const { error } = await supabase.from('productos').insert(payload)
      if (error) { toast.error('Error al crear'); return }
      toast.success('Producto creado')
    }

    setShowForm(false)
    setEditando(null)
    fetchProductos()
  }

  const toggleActivo = async (p: Producto) => {
    await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id)
    fetchProductos()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    toast.success('Producto eliminado')
    fetchProductos()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3E3124]">Gestión de productos</h1>
        <button
          onClick={openNuevo}
          className="flex items-center gap-2 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* Modal Nuevo/Editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD0B0]">
              <h2 className="font-bold text-[#3E3124]">{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#8A7660]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Imagen */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-[#E7D7B1] rounded-xl flex items-center justify-center overflow-hidden">
                  {imgPreview ? (
                    <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🥖</span>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-[#E7D7B1] hover:bg-[#D4A65A] text-[#3E3124] px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  Subir imagen
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#3E3124] mb-1">Nombre *</label>
                  <input {...register('nombre')} className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]" />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#3E3124] mb-1">Descripción</label>
                  <textarea {...register('descripcion')} rows={2} className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124] resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3E3124] mb-1">Precio *</label>
                  <input {...register('precio')} type="number" step="0.01" className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]" />
                  {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3E3124] mb-1">Categoría *</label>
                  <select {...register('categoria')} className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]">
                    <option value="">Seleccionar...</option>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3E3124] mb-1">Stock actual</label>
                  <input {...register('stock_actual')} type="number" min="0" className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3E3124] mb-1">Stock mínimo</label>
                  <input {...register('stock_minimo')} type="number" min="0" className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]" />
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" {...register('activo')} id="activo" className="w-4 h-4 accent-[#C97B4B]" />
                  <label htmlFor="activo" className="text-sm text-[#3E3124]">Producto activo (visible en catálogo)</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#DDD0B0] rounded-xl text-[#8A7660] text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting || uploadingImg} className="flex-1 py-2.5 bg-[#C97B4B] hover:bg-[#A5623C] disabled:opacity-60 text-[#FFFDF8] font-semibold text-sm rounded-xl transition-colors">
                  {isSubmitting || uploadingImg ? 'Guardando...' : editando ? 'Actualizar' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
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
                  <th className="px-4 py-3 text-right font-semibold">Precio</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD0B0]">
                {productos.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F4EC]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E7D7B1] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🥖</span>
                          )}
                        </div>
                        <span className="font-medium text-[#3E3124]">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8A7660]">{p.categoria}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#3E3124]">
                      ${p.precio.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${p.stock_actual <= p.stock_minimo ? 'text-orange-600' : 'text-[#3E3124]'}`}>
                        {p.stock_actual}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActivo(p)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        p.activo
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditar(p)}
                          className="p-1.5 text-[#C97B4B] hover:bg-[#E7D7B1] rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminar(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
