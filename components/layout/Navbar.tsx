'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, User, LogOut } from 'lucide-react'
import Loader from '@/components/ui/Loader'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/pedidos', label: 'Pedidos' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [cerrando, setCerrando] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    setCerrando(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (cerrando) return <Loader fullscreen message="Cerrando sesión..." />

  const dashboardHref = user?.role === 'admin' ? '/admin' : '/cliente'

  return (
    <header className="sticky top-0 z-50 bg-[#F8F4EC] border-b border-[#DDD0B0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.webp"
              alt="Panavi"
              width={140}
              height={44}
              className="object-contain h-11 w-auto group-hover:scale-105 transition-transform"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[#D4A65A] text-[#3E3124]'
                    : 'text-[#3E3124] hover:bg-[#E7D7B1]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Account area */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? null : user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 px-3 py-1.5 border border-[#DDD0B0] bg-[#FFFDF8] text-[#3E3124] rounded-lg text-sm font-medium hover:bg-[#E7D7B1] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mi cuenta
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#8A7660] hover:text-[#3E3124] transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-3 py-1.5 border border-[#DDD0B0] bg-[#FFFDF8] text-[#3E3124] rounded-lg text-sm font-medium hover:bg-[#E7D7B1] transition-colors"
              >
                <User className="w-4 h-4" />
                Mi cuenta
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#3E3124] hover:text-[#C97B4B] transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F8F4EC] border-t border-[#DDD0B0] animate-fade-in">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[#D4A65A] text-[#3E3124]'
                    : 'text-[#3E3124] hover:bg-[#E7D7B1]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-[#DDD0B0]">
              {user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[#3E3124] text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    Mi cuenta
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-[#8A7660] text-sm cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[#3E3124] text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
