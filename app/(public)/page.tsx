import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, ArrowRight, Clock, Heart, Award, ShoppingBag } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/productos/ProductCard'
import PresupuestoRapido from '@/components/presupuesto/PresupuestoRapido'

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493704000000'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .limit(4)

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-[#F8F4EC] overflow-hidden min-h-[560px]">
        {/* Imagen derecha */}
        <div className="absolute right-0 inset-y-0 w-full lg:w-[50%] hidden lg:block">
          <Image
            src="/e321a544-7b84-4897-bc70-e1e6b76aafcf.webp"
            alt="Panadería Panavi"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Gradiente de fusión izquierda */}
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#F8F4EC] to-transparent" />
        </div>

        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 min-h-[560px] flex items-center">
          <div className="w-full lg:w-[52%]">
            <div className="inline-flex items-center gap-2 bg-[#E7D7B1] rounded-full px-4 py-1.5 mb-6">
              <span className="text-base">🌾</span>
              <span className="text-[#3E3124] text-sm font-medium">Panadería Artesanal — Formosa, Argentina</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3E3124] leading-tight mb-6">
              El sabor de lo{' '}
              <span className="text-[#D4A65A]">hecho con amor</span>
            </h1>
            <p className="text-[#8A7660] text-lg sm:text-xl mb-8 leading-relaxed max-w-lg">
              Pan artesanal, facturas y tortas elaboradas a diario con los mejores ingredientes. Porque cada mordida merece ser especial.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${whatsapp}?text=Hola! Quiero hacer un pedido`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#D4A65A] hover:bg-[#C97B4B] text-[#3E3124] hover:text-[#FFFDF8] px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Pedir por WhatsApp
              </a>
              <Link
                href="/pedidos"
                className="inline-flex items-center gap-2 border border-[#DDD0B0] bg-[#FFFDF8] hover:bg-[#E7D7B1] text-[#3E3124] px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                Hacer un pedido
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-16 bg-[#F8F4EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#3E3124]">Nuestros productos</h2>
              <p className="text-[#8A7660] mt-1">Elaborados frescos todos los días</p>
            </div>
            <Link
              href="/productos"
              className="hidden sm:inline-flex items-center gap-2 text-[#C97B4B] hover:text-[#3E3124] font-medium transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(productos ?? []).length > 0 ? (
              (productos ?? []).map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))
            ) : (
              // Placeholder cards cuando no hay productos aún
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#E7D7B1] rounded-2xl h-64 animate-pulse" />
              ))
            )}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-[#C97B4B] font-medium"
            >
              Ver todos los productos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ¿POR QUÉ ELEGIRNOS? */}
      <section className="py-16 bg-[#E7D7B1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#3E3124]">¿Por qué elegirnos?</h2>
            <p className="text-[#8A7660] mt-2">Más de una razón para ser parte de nuestra familia panadera</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Hecho con amor',
                desc: 'Cada producto es elaborado artesanalmente con pasión y dedicación. Usamos recetas familiares que se transmiten de generación en generación.',
              },
              {
                icon: Award,
                title: 'Ingredientes de calidad',
                desc: 'Solo utilizamos harinas premium, huevos frescos y materias primas seleccionadas para garantizar el mejor sabor en cada producto.',
              },
              {
                icon: Clock,
                title: 'Siempre frescos',
                desc: 'Horneamos todos los días para que siempre tengas el pan más fresco. Abrimos de lunes a sábados de 7:00 a 18:00 hs.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[#DDD0B0] hover:shadow-md transition-shadow"
              >
                <div className="bg-[#C97B4B] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#FFFDF8]" />
                </div>
                <h3 className="text-lg font-semibold text-[#3E3124] mb-2">{item.title}</h3>
                <p className="text-[#8A7660] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESUPUESTO RÁPIDO */}
      <section className="py-16 bg-[#F8F4EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#3E3124] mb-4">
                Hacé tu pedido
              </h2>
              <p className="text-[#8A7660] leading-relaxed mb-6">
                ¿Necesitás pan para un evento especial, una torta de cumpleaños o un pedido al por mayor? Completá el formulario y te respondemos a la brevedad.
              </p>
              <ul className="space-y-2 text-sm text-[#8A7660]">
                {[
                  'Tortas personalizadas para cumpleaños y eventos',
                  'Pedidos mayoristas para comercios y empresas',
                  'Catering para fiestas y reuniones',
                  'Entrega a domicilio en Formosa capital',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C97B4B]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <PresupuestoRapido />
          </div>
        </div>
      </section>

      {/* MAPA */}
      <section className="py-16 bg-[#E7D7B1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#3E3124]">Visitanos</h2>
            <p className="text-[#8A7660] mt-2">Formosa, Argentina — Lun a Sáb de 7:00 a 18:00 hs</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#DDD0B0] h-72">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114888.97560797956!2d-58.0856695!3d-26.1844565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94543ce03b0f2f9f%3A0x7e3e7f19f7b5c7b7!2sFormosa%2C%20Argentina!5e0!3m2!1ses!2sar!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
