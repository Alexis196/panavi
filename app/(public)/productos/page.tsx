'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types/database'
import ProductCard from '@/components/productos/ProductCard'
import Loader from '@/components/ui/Loader'
import { Search, Filter } from 'lucide-react'

const CATEGORIAS = ['Todos', 'Panes', 'Facturas', 'Tortas', 'Dulces', 'Salados']

export default function ProductosPage() {
  const supabase = createClient()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('Todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true)
      let query = supabase.from('productos').select('*').eq('activo', true).order('nombre')
      if (categoria !== 'Todos') query = query.eq('categoria', categoria)
      if (search) query = query.ilike('nombre', `%${search}%`)
      const { data } = await query
      setProductos(data ?? [])
      setLoading(false)
    }
    fetchProductos()
  }, [categoria, search])

  return (
    <div>
      {/* Header + Filtros con imagen de fondo compartida */}
      <div className="relative bg-[#F8F4EC] overflow-hidden">
        <div className="absolute right-0 inset-y-0 w-full lg:w-[75%] hidden lg:block">
          <Image
            src="/backProducts.webp"
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
          {/* Gradiente izquierdo — fusión con el contenido */}
          <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-[#F8F4EC] to-transparent" />
          {/* Gradiente inferior — fusión con el grid */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#F8F4EC]" />
          {/* Gradiente derecho — evita el corte brusco en el borde */}
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F8F4EC] to-transparent" />
        </div>

        {/* Título */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="lg:w-[50%]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌾</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#3E3124]">Nuestros productos</h1>
            </div>
            <p className="text-[#8A7660] text-base">Elaborados frescos todos los días en nuestra panadería artesanal</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7660]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#DDD0B0] rounded-xl text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124] bg-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-[#8A7660] shrink-0" />
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    categoria === cat
                      ? 'bg-[#C97B4B] text-[#FFFDF8]'
                      : 'bg-[#E7D7B1] text-[#3E3124] hover:bg-[#D4A65A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Loader />
        ) : productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map((p, i) => (
              <ProductCard key={p.id} producto={p} priority={i === 0} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#8A7660]">
            <p className="text-lg">No se encontraron productos</p>
            <p className="text-sm mt-1">Intentá con otra búsqueda o categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}
