import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const body = formData.get('Body')?.toString().toLowerCase().trim()
  const from = formData.get('From')?.toString()

  if (!from) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const supabase = createServiceClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('id, clinic_id, name')
    .eq('phone', from)
    .single()

  let clinicName = 'the clinic'

  if (patient) {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', patient.clinic_id)
      .single()

    if (clinic) clinicName = clinic.name

    const { data: appointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', patient.id)
      .eq('status', 'unconfirmed')
      .order('appointment_date', { ascending: true })
      .limit(1)
      .single()

    if (appointment) {
      if (body?.includes('yes') || body?.includes('confirm')) {
        await supabase
          .from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', appointment.id)
      } else if (body?.includes('no') || body?.includes('cancel')) {
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
      content: formData.get('Body')?.toString() || '',
      status: 'received',
    })
  }

  const isConfirm = body?.includes('yes') || body?.includes('confirm')
  const twiml = isConfirm
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Got it, you're confirmed! See you soon. — ${clinicName}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Got it, we'll reach out to reschedule. — ${clinicName}</Message></Response>`

  return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } })
}
