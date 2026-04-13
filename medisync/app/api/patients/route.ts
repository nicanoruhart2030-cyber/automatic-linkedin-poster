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
    .from('patients')
    .select('*')
    .eq('clinic_id', clinic.id)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { clinic_id, name, phone, email } = body

  const { data, error } = await supabase
    .from('patients')
    .insert({ clinic_id, name, phone, email: email || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
