export type AppointmentStatus = 'unconfirmed' | 'confirmed' | 'cancelled' | 'no-show' | 'rescheduled'

export interface Clinic {
  id: string
  name: string
  phone: string
  email: string
  hours: string
  owner_id: string
}

export interface Patient {
  id: string
  clinic_id: string
  name: string
  phone: string
  email: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  appointment_type: string
  appointment_date: string
  status: AppointmentStatus
  reminder_sent: boolean
  call_made: boolean
  call_id: string | null
  notes: string | null
  patients?: Patient
}

export interface Message {
  id: string
  clinic_id: string
  patient_id: string
  type: 'sms' | 'call' | 'chat'
  direction: 'inbound' | 'outbound'
  content: string
  status: string
  created_at: string
  patients?: Patient
}
