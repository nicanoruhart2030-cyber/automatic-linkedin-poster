import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { chatReceptionist } from '@/lib/groq'

export async function POST(req: Request) {
  const { clinicId, sessionId, message, history } = await req.json()
  const supabase = createServiceClient()

  let activeSessionId = sessionId

  if (!activeSessionId) {
    const { data: session } = await supabase
      .from('chat_sessions')
      .insert({ clinic_id: clinicId })
      .select()
      .single()
    activeSessionId = session?.id
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('name, hours, phone')
    .eq('id', clinicId)
    .single()

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const reply = await chatReceptionist({
    messages: [
      ...(history || []),
      { role: 'user', content: message },
    ],
    clinicName: clinic.name,
    clinicHours: clinic.hours,
    clinicPhone: clinic.phone,
  })

  await supabase.from('chat_messages').insert([
    { session_id: activeSessionId, role: 'user', content: message },
    { session_id: activeSessionId, role: 'assistant', content: reply },
  ])

  return NextResponse.json({ reply, sessionId: activeSessionId })
}
