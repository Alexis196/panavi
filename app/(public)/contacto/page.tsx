import { MapPin, Clock, MessageCircle, Phone, Mail } from 'lucide-react'

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493704000000'

export default function ContactoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#3E3124] mb-3">Contactanos</h1>
        <p className="text-[#8A7660]">Estamos para ayudarte. Encontranos en Formosa, Argentina.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Info cards */}
        {[
          {
            icon: MapPin,
            title: 'Dirección',
            content: 'Formosa, Argentina',
            sub: 'Capital de la provincia de Formosa',
          },
          {
            icon: Clock,
            title: 'Horarios',
            content: 'Lunes a Sábados',
            sub: '7:00 a 18:00 hs',
          },
          {
            icon: Phone,
            title: 'Teléfono',
            content: `+${whatsapp}`,
            sub: 'También por WhatsApp',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-[#E7D7B1] rounded-2xl p-6 border border-[#DDD0B0] text-center"
          >
            <div className="bg-[#C97B4B] w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <item.icon className="w-6 h-6 text-[#FFFDF8]" />
            </div>
            <h3 className="font-semibold text-[#3E3124] mb-1">{item.title}</h3>
            <p className="text-[#3E3124] font-medium">{item.content}</p>
            <p className="text-[#8A7660] text-sm">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      <div className="bg-gradient-to-r from-[#C97B4B] to-[#D4A65A] rounded-2xl p-8 text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">¿Preferís hablar directamente?</h2>
        <p className="text-[#E7D7B1] mb-6">Escribinos por WhatsApp y te respondemos a la brevedad</p>
        <a
          href={`https://wa.me/${whatsapp}?text=Hola! Quiero consultar sobre Panavi`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
          Escribir por WhatsApp
        </a>
      </div>

      {/* Mapa */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-[#DDD0B0] h-96">
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
  )
}
