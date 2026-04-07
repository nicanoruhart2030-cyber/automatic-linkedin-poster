'use client'

import { useState } from 'react'
import { Appointment } from '@/types'
import SMSPreviewModal from './SMSPreviewModal'

interface AppointmentCardProps {
  appointment: Appointment
  onUpdate: () => void
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black text-white">
        ✓ Confirmed
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
        Cancelled
      </span>
    )
  }
  if (status === 'rescheduled') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-white">
        Rescheduled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-black text-black bg-white">
      Pending
    </span>
  )
}

export default function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const [smsModal, setSmsModal] = useState(false)
  const [smsText, setSmsText] = useState('')
  const [smsLoading, setSmsLoading] = useState(false)
  const [callLoading, setCallLoading] = useState(false)
  const [callSent, setCallSent] = useState(false)
  const [markLoading, setMarkLoading] = useState(false)

  const patient = appointment.patients
  const now = new Date()
  const apptDate = new Date(appointment.appointment_date)
  const in24h = new Date(now)
  in24h.setHours(now.getHours() + 24)
  const isAtRisk = appointment.status === 'unconfirmed' && apptDate >= now && apptDate <= in24h

  const formattedDate = apptDate.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  async function handleSMSPreview() {
    setSmsLoading(true)
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: appointment.id }),
    })
    const data = await res.json()
    setSmsText(data.message || '')
    setSmsLoading(false)
    setSmsModal(true)
  }

  async function handleCall() {
    setCallLoading(true)
    await fetch('/api/call/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: appointment.id }),
    })
    setCallLoading(false)
    setCallSent(true)
    onUpdate()
  }

  async function handleMarkConfirmed() {
    setMarkLoading(true)
    await fetch(`/api/appointments/${appointment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    })
    setMarkLoading(false)
    onUpdate()
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-lg font-bold text-black">{patient?.name ?? 'Unknown'}</p>
            <p className="text-sm text-gray-500">
              {appointment.appointment_type} · {formattedDate}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isAtRisk ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black text-white">
                ⚠ At Risk
              </span>
            ) : (
              <StatusBadge status={appointment.status} />
            )}
            {appointment.reminder_sent && (
              <span className="text-xs text-gray-400">SMS sent</span>
            )}
            {appointment.call_made && (
              <span className="text-xs text-gray-400">Called</span>
            )}
          </div>
        </div>

        {appointment.notes && (
          <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded p-2">{appointment.notes}</p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSMSPreview}
            disabled={smsLoading}
            className="flex-1 text-xs py-1.5 px-2 rounded-md bg-white border border-black text-black hover:bg-gray-50 disabled:opacity-50"
          >
            {smsLoading ? 'Loading...' : 'Send SMS'}
          </button>
          <button
            onClick={handleCall}
            disabled={callLoading || callSent}
            className="flex-1 text-xs py-1.5 px-2 rounded-md bg-white border border-black text-black hover:bg-gray-50 disabled:opacity-50"
          >
            {callLoading ? 'Calling...' : callSent ? 'Call Sent ✓' : 'Call Patient'}
          </button>
          <button
            onClick={handleMarkConfirmed}
            disabled={markLoading || appointment.status === 'confirmed'}
            className="flex-1 text-xs py-1.5 px-2 rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {markLoading ? '...' : 'Mark Confirmed'}
          </button>
        </div>
      </div>

      {smsModal && (
        <SMSPreviewModal
          patientName={patient?.name ?? ''}
          patientPhone={patient?.phone ?? ''}
          smsText={smsText}
          onClose={() => setSmsModal(false)}
        />
      )}
    </>
  )
}
