export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/cliente')

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
