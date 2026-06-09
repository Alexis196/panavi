export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClienteSidebar from '@/components/cliente/Sidebar'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin')

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex flex-col md:flex-row">
      <ClienteSidebar fullName={profile?.full_name ?? null} />
      <main className="flex-1 p-6 max-w-5xl">{children}</main>
    </div>
  )
}
