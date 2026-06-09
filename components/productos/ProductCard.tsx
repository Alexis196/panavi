import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Producto } from '@/types/database'

interface Props {
  producto: Producto
  onAgregar?: (producto: Producto) => void
  priority?: boolean
}

export default function ProductCard({ producto, onAgregar, priority = false }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group">
      {/* Imagen */}
      <Link href={`/productos/${producto.id}`} className="block relative h-48 bg-[#E7D7B1]">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl">🥖</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-[#C97B4B] text-[#FFFDF8] text-xs px-2 py-1 rounded-full font-medium">
            {producto.categoria}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/productos/${producto.id}`}>
          <h3 className="font-semibold text-[#3E3124] mb-1 text-base hover:text-[#C97B4B] transition-colors">{producto.nombre}</h3>
        </Link>
        {producto.descripcion && (
          <p className="text-[#8A7660] text-xs line-clamp-2 mb-3">{producto.descripcion}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#C97B4B] font-bold text-lg">
            ${producto.precio.toLocaleString('es-AR')}
          </span>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/productos/${producto.id}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#DDD0B0] text-[#3E3124] hover:bg-[#E7D7B1] transition-colors"
            >
              Ver más
            </Link>
            {onAgregar ? (
              <button
                onClick={() => onAgregar(producto)}
                className="flex items-center gap-1.5 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Agregar
              </button>
            ) : (
              <Link
                href="/pedidos"
                className="flex items-center gap-1.5 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Pedir
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
