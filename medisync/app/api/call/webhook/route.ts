import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendSMS } from '@/lib/clicksend'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const data = await req.json()
  const supabase = createServiceClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, patients(*), clinics(*)')
    .eq('call_id', data.call_id)
    .single()

  if (!appointment) return NextResponse.json({ received: true })

  const patient = appointment.patients as { name: string; phone: string }
  const clinic = appointment.clinics as { name: string; phone: string }
  const summary = (data.summary || '').toLowerCase()

  const { data: message } = await supabase
    .from('messages')
    .select('id')
    .eq('appointment_id', appointment.id)
    .eq('type', 'call')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (summary.includes('confirmed') || summary.includes('yes')) {
    await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointment.id)

    if (message) {
      await supabase.from('messages').update({ status: 'completed' }).eq('id', message.id)
    }
  } else if (summary.includes('reschedule')) {
    await supabase
      .from('appointments')
      .update({ status: 'rescheduled', notes: data.summary })
      .eq('id', appointment.id)

    const extractRes = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Extract only the reschedule day and time from this summary. Return plain text only, nothing else. Summary: ${data.summary}`,
      }],
    })

    const extractedTime = extractRes.choices[0].message.content?.trim() || 'a new time'

    const smsBody = `Hi ${patient.name}, your ${appointment.appointment_type} has been rescheduled to ${extractedTime}. Reply YES to confirm or call us at ${clinic.phone} if you need to adjust. — ${clinic.name}`

    await sendSMS(patient.phone, smsBody)

    await supabase.from('messages').insert({
      clinic_id: appointment.clinic_id,
      patient_id: appointment.patient_id,
      appointment_id: appointment.id,
      type: 'sms',
      direction: 'outbound',
      content: smsBody,
      status: 'sent',
    })

    if (message) {
      await supabase.from('messages').update({ status: 'completed' }).eq('id', message.id)
    }
  } else if (summary.includes('no answer') || summary.includes('voicemail')) {
    if (message) {
      await supabase.from('messages').update({ status: 'voicemail' }).eq('id', message.id)
    }
  }

  return NextResponse.json({ received: true })
}
