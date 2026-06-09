'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ShoppingBag, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Ingresá tu nombre completo'),
  phone: z.string().min(8, 'Ingresá un teléfono válido').optional().or(z.literal('')),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, phone: data.phone },
      },
    })
    if (error) {
      toast.error(error.message)
      return
    }
    if (signUpData.session) {
      toast.success('¡Bienvenido/a a Panavi!')
      router.push('/cliente')
      router.refresh()
    } else {
      toast.success('¡Cuenta creada! Revisá tu email para confirmar.')
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-[#C97B4B] rounded-full p-2">
              <ShoppingBag className="w-6 h-6 text-[#FFFDF8]" />
            </div>
            <span className="text-[#3E3124] font-bold text-2xl">
              Pana<span className="text-[#C97B4B]">vi</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDD0B0] p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#3E3124] mb-1">Crear cuenta</h1>
          <p className="text-[#8A7660] text-sm mb-6">Registrate para gestionar tus pedidos</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3E3124] mb-1">Nombre completo *</label>
              <input
                {...register('full_name')}
                placeholder="Juan Pérez"
                className="w-full border border-[#DDD0B0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E3124] mb-1">Teléfono</label>
              <input
                {...register('phone')}
                placeholder="3704000000"
                className="w-full border border-[#DDD0B0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E3124] mb-1">Email *</label>
              <input
                {...register('email')}
                type="email"
                placeholder="tu@email.com"
                className="w-full border border-[#DDD0B0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E3124] mb-1">Contraseña *</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full border border-[#DDD0B0] rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7660]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E3124] mb-1">Confirmar contraseña *</label>
              <input
                {...register('confirm')}
                type="password"
                placeholder="••••••••"
                className="w-full border border-[#DDD0B0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C97B4B] hover:bg-[#A5623C] disabled:opacity-60 text-[#FFFDF8] font-semibold py-2.5 rounded-xl transition-colors mt-2"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8A7660] mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-[#C97B4B] font-medium hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
