import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const data = await req.json()

  // ClickSend inbound SMS payload
  const body = (data.body || '').toLowerCase().trim()
  const from = data.from

  if (!from) return new Response('ok')

  const supabase = createServiceClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('id, clinic_id, name')
    .eq('phone', from)
    .single()

  if (patient) {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', patient.id)
      .eq('status', 'unconfirmed')
      .order('appointment_date', { ascending: true })
      .limit(1)
      .single()

    if (appointment) {
      if (body.includes('yes') || body.includes('confirm')) {
        await supabase
          .from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', appointment.id)
      } else if (body.includes('no') || body.includes('cancel')) {
        await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appointment.id)
      }
    }

    await supabase.from('messages').insert({
      clinic_id: patient.clinic_id,
      patient_id: patient.id,
      appointment_id: appointment?.id || null,
      type: 'sms',
      direction: 'inbound',
      content: data.body || '',
      status: 'received',
    })
  }

  return new Response('ok', { status: 200 })
}
