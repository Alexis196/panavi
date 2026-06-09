import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Tag, Package } from 'lucide-react'
import { Producto } from '@/types/database'
import ProductCard from '@/components/productos/ProductCard'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('nombre, descripcion')
    .eq('id', id)
    .single()
  if (!data) return {}
  return {
    title: `${data.nombre} | Panavi`,
    description: data.descripcion ?? `Conocé ${data.nombre}, un producto artesanal de Panavi.`,
  }
}

async function RelatedProducts({ categoria, id }: { categoria: string; id: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, categoria, imagen_url, activo, stock_actual, stock_minimo')
    .eq('categoria', categoria)
    .eq('activo', true)
    .neq('id', id)
    .limit(4)

  if (!data?.length) return null

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#3E3124] mb-6">Más de {categoria}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((r) => (
          <ProductCard key={r.id} producto={r as Producto} />
        ))}
      </div>
    </div>
  )
}

function RelatedSkeleton() {
  return (
    <div>
      <div className="h-8 w-48 bg-[#E7D7B1] rounded-xl mb-6 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#E7D7B1] rounded-2xl h-64 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default async function ProductoDetallePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single()

  if (!producto) notFound()

  const sinStock = producto.stock_actual === 0
  const stockBajo = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <div>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-[#8A7660] hover:text-[#3E3124] mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Imagen */}
          <div className="relative aspect-square bg-[#E7D7B1] rounded-3xl overflow-hidden">
            {producto.imagen_url ? (
              <Image
                src={producto.imagen_url}
                alt={producto.nombre}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-9xl">🥖</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center gap-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-[#E7D7B1] text-[#C97B4B] px-3 py-1.5 rounded-full text-sm font-medium">
                <Tag className="w-3.5 h-3.5" />
                {producto.categoria}
              </span>
              {sinStock ? (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Package className="w-3.5 h-3.5" />
                  Sin stock
                </span>
              ) : stockBajo ? (
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Package className="w-3.5 h-3.5" />
                  Últimas unidades
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Package className="w-3.5 h-3.5" />
                  Disponible
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-[#3E3124]">{producto.nombre}</h1>

            {producto.descripcion && (
              <p className="text-[#8A7660] text-lg leading-relaxed">{producto.descripcion}</p>
            )}

            <p className="text-4xl font-bold text-[#C97B4B]">
              ${producto.precio.toLocaleString('es-AR')}
            </p>

            <Link
              href="/pedidos"
              className="inline-flex items-center justify-center gap-2 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] font-semibold px-8 py-4 rounded-2xl text-lg transition-colors w-full sm:w-auto"
            >
              <ShoppingCart className="w-5 h-5" />
              Pedir este producto
            </Link>
          </div>
        </div>
      </div>

      {/* Relacionados — se hace streaming, no bloquea el producto principal */}
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts categoria={producto.categoria} id={producto.id} />
      </Suspense>
    </div>
  )
}
