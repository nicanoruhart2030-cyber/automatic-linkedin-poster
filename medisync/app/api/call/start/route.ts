import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { triggerBlandCall } from '@/lib/bland'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

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
  const clinic = appointment.clinics as { name: string; phone: string }

  const formattedDate = formatDate(appointment.appointment_date)

  const result = await triggerBlandCall({
    patientPhone: patient.phone,
    patientName: patient.name,
    appointmentType: appointment.appointment_type,
    appointmentDate: formattedDate,
    clinicName: clinic.name,
    clinicPhone: clinic.phone,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/call/webhook`,
  })

  await supabase
    .from('appointments')
    .update({ call_id: result.call_id, call_made: true })
    .eq('id', appointmentId)

  await supabase.from('messages').insert({
    clinic_id: appointment.clinic_id,
    patient_id: appointment.patient_id,
    appointment_id: appointmentId,
    type: 'call',
    direction: 'outbound',
    content: 'Outbound call initiated',
    status: 'calling',
  })

  return NextResponse.json({ success: true, callId: result.call_id })
}
