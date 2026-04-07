import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', session.user.id)
    .single()

  if (!clinic) return NextResponse.json({ error: 'No clinic found' }, { status: 404 })

  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .eq('clinic_id', clinic.id)
    .order('appointment_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { patient_id, clinic_id, appointment_type, appointment_date } = body

  const { data, error } = await supabase
    .from('appointments')
    .insert({ patient_id, clinic_id, appointment_type, appointment_date })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
