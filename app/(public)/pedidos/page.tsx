import PresupuestoRapido from '@/components/presupuesto/PresupuestoRapido'
import { MessageCircle, Clock, Phone } from 'lucide-react'

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493704000000'

export default function PedidosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#3E3124] mb-3">Hacer un pedido</h1>
          <p className="text-[#8A7660]">
            Completá el formulario y te respondemos a la brevedad. Para urgencias, escribinos directo por WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#E7D7B1] rounded-2xl p-5 border border-[#DDD0B0]">
              <h3 className="font-semibold text-[#3E3124] mb-3">¿Qué ofrecemos?</h3>
              <ul className="space-y-2 text-sm text-[#8A7660]">
                {[
                  'Tortas personalizadas para cumpleaños',
                  'Pedidos para eventos y catering',
                  'Pedidos mayoristas para comercios',
                  'Surtido de facturas y pan',
                  'Chipas y salados para reuniones',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C97B4B] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#E7D7B1] rounded-2xl p-5 border border-[#DDD0B0] space-y-3">
              <h3 className="font-semibold text-[#3E3124]">Contacto directo</h3>
              <div className="flex items-center gap-2 text-sm text-[#8A7660]">
                <Clock className="w-4 h-4 text-[#C97B4B] shrink-0" />
                Lun–Sáb: 7:00 a 18:00 hs
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8A7660]">
                <Phone className="w-4 h-4 text-[#C97B4B] shrink-0" />
                +{whatsapp}
              </div>
              <a
                href={`https://wa.me/${whatsapp}?text=Hola! Quiero hacer un pedido`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp directo
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <PresupuestoRapido />
          </div>
        </div>
      </div>
    </div>
  )
}
