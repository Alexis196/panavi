import Link from 'next/link'
import Image from 'next/image'
import { Wheat } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F4EC] flex">
      {/* Contenido izquierdo */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="w-20 h-20 rounded-full border-[3px] border-[#C97B4B] flex items-center justify-center mb-8">
          <Wheat className="w-10 h-10 text-[#C97B4B]" />
        </div>

        <h1 className="font-bold text-[#3E3124] leading-none" style={{ fontSize: 'clamp(96px, 14vw, 176px)' }}>
          404
        </h1>

        <div className="flex items-center gap-3 mt-4 mb-4">
          <span className="block h-px w-8 bg-[#C97B4B]" />
          <p className="text-lg font-semibold text-[#3E3124] whitespace-nowrap">¡Ups! Esta página no existe</p>
          <span className="block h-px w-8 bg-[#C97B4B]" />
        </div>

        <p className="text-[#8A7660] leading-relaxed max-w-xs mb-10">
          Parece que te perdiste entre harinas y masas.
          Volvamos al inicio y encontremos algo delicioso.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#C97B4B] hover:bg-[#A5623C] text-[#FFFDF8] font-semibold px-7 py-3 rounded-xl transition-colors text-base"
        >
          <Wheat className="w-5 h-5" />
          Volver al inicio
        </Link>
      </div>

      {/* Imagen derecha */}
      <div className="hidden lg:block lg:w-[52%] relative">
        <Image
          src="/e321a544-7b84-4897-bc70-e1e6b76aafcf.webp"
          alt="Pan artesanal Panavi"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
