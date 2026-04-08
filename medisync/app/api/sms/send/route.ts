import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { generateSMSReminder } from '@/lib/groq'
import { sendSMS } from '@/lib/clicksend'

export async function POST(req: Request) {
  const { appointmentId } = await req.json()
  const supabase = createServiceClient()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*, patients(*), clinics(*)')
    .eq('id', appointmentId)
    .single()

  if (error || !appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  const patient = appointment.patients as { name: string; phone: string }
  const clinic = appointment.clinics as { name: string }

  const smsText = await generateSMSReminder({
    patientName: patient.name,
    appointmentType: appointment.appointment_type,
    appointmentDate: new Date(appointment.appointment_date).toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }),
    clinicName: clinic.name,
  })

  await sendSMS(patient.phone, smsText)

  await supabase.from('messages').insert({
    clinic_id: appointment.clinic_id,
    patient_id: appointment.patient_id,
    appointment_id: appointmentId,
    type: 'sms',
    direction: 'outbound',
    content: smsText,
    status: 'sent',
  })

  await supabase
    .from('appointments')
    .update({ reminder_sent: true })
    .eq('id', appointmentId)

  return NextResponse.json({ success: true, message: smsText })
}
