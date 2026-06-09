import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react'

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493704000000'
const whatsappUrl = `https://wa.me/${whatsapp}`

export default function Footer() {
  return (
    <footer className="bg-[#F8F4EC] text-[#3E3124]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo.webp"
                alt="Panavi"
                width={140}
                height={44}
                className="object-contain h-11 w-auto rounded-lg"
              />
            </div>
            <p className="text-sm text-[#3E3124] leading-relaxed">
              Panadería artesanal en Formosa, Argentina. Elaboramos pan con amor y dedicación desde el primer momento.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-[#3E3124] mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/productos', label: 'Productos' },
                { href: '/pedidos', label: 'Pedidos' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#3E3124] hover:text-[#C97B4B] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-[#3E3124] mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C97B4B] mt-0.5 shrink-0" />
                <span>Formosa, Argentina</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C97B4B] shrink-0" />
                <span>Lun–Sáb: 7:00 a 18:00 hs</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C97B4B] shrink-0" />
                <a
                  href={`tel:+${whatsapp}`}
                  className="hover:text-[#C97B4B] transition-colors"
                >
                  +{whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escribinos por WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#C97B4B]/40 text-center text-xs text-[#8A7660]">
          © {new Date().getFullYear()} Panavi. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
