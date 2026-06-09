'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Package, Calendar, LogOut, Home, Globe, PlusCircle } from 'lucide-react'
import Loader from '@/components/ui/Loader'

const navItems = [
  { href: '/cliente', label: 'Inicio', icon: Home, exact: true },
  { href: '/cliente/pedidos', label: 'Mis pedidos', icon: Package, exact: false },
  { href: '/cliente/actividad', label: 'Actividad', icon: Calendar, exact: false },
]

interface Props {
  fullName: string | null
}

export default function ClienteSidebar({ fullName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [cerrando, setCerrando] = useState(false)

  const handleLogout = async () => {
    setCerrando(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (cerrando) return <Loader fullscreen message="Cerrando sesión..." />

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#F8F4EC] min-h-screen border-r border-[#C97B4B]/30">
        <div className="p-6 border-b border-[#C97B4B]/30">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#C97B4B] rounded-xl p-1.5">
              <ShoppingBag className="w-4 h-4 text-[#FFFDF8]" />
            </div>
            <span className="text-[#3E3124] font-bold text-lg">
              Pana<span className="text-[#C97B4B]">vi</span>
            </span>
          </Link>
          <div className="mt-4">
            <p className="text-[#8A7660] text-xs">Bienvenido/a</p>
            <p className="text-[#3E3124] font-medium text-sm truncate">{fullName}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/pedidos"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#C97B4B] text-[#FFFDF8] hover:bg-[#A5623C] transition-colors mb-3"
          >
            <PlusCircle className="w-4 h-4" />
            Nuevo pedido
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? 'bg-[#C97B4B] text-[#FFFDF8]'
                  : 'text-[#3E3124] hover:bg-[#C97B4B]/20'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#C97B4B]/30 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#3E3124] hover:bg-[#C97B4B]/20 transition-colors text-sm"
          >
            <Globe className="w-4 h-4" />
            Inicio
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#3E3124] hover:bg-[#C97B4B]/20 transition-colors text-sm w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Top bar mobile */}
      <div className="md:hidden bg-[#F8F4EC] px-4 py-3 flex items-center justify-between border-b border-[#C97B4B]/30">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#C97B4B] rounded-xl p-1">
            <ShoppingBag className="w-4 h-4 text-[#FFFDF8]" />
          </div>
          <span className="text-[#3E3124] font-bold">Panavi</span>
        </Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href, item.exact) ? 'text-[#C97B4B]' : 'text-[#3E3124]'}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
          <Link href="/pedidos" className="text-[#C97B4B]">
            <PlusCircle className="w-5 h-5" />
          </Link>
        </nav>
      </div>
    </>
  )
}
