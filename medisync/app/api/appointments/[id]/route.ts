import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { AppointmentStatus } from '@/types'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { status }: { status: AppointmentStatus } = body

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
