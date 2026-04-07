import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'
import SetupClinicForm from './SetupClinicForm'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('owner_id', session.user.id)
    .single()

  if (!clinic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SetupClinicForm userId={session.user.id} />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <Sidebar clinic={clinic} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
