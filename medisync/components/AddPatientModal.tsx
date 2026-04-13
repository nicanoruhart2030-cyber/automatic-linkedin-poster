'use client'

import { useState } from 'react'

const APPOINTMENT_TYPES = [
  'Cleaning', 'Checkup', 'X-Ray', 'Root Canal', 'Filling',
  'Consultation', 'Physical', 'Blood Work', 'Follow-up', 'Other',
]

interface AddPatientModalProps {
  clinicId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddPatientModal({ clinicId, onClose, onSuccess }: AddPatientModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [appointmentType, setAppointmentType] = useState('Checkup')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const patientRes = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinic_id: clinicId, name, phone, email: email || undefined }),
    })
    const patient = await patientRes.json()

    if (!patientRes.ok) {
      setError(patient.error || 'Failed to create patient')
      setLoading(false)
      return
    }

    const appointmentDate = new Date(`${date}T${time}`).toISOString()
    const apptRes = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinic_id: clinicId,
        patient_id: patient.id,
        appointment_type: appointmentType,
        appointment_date: appointmentDate,
      }),
    })

    if (!apptRes.ok) {
      const apptData = await apptRes.json()
      setError(apptData.error || 'Failed to create appointment')
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-black text-lg">Add Patient & Appointment</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-black rounded-md text-sm text-black">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Patient Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Email (optional)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="jane@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Appointment Type</label>
              <select value={appointmentType} onChange={e => setAppointmentType(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
                {APPOINTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-black mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-black mb-1">Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-black text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                {loading ? 'Saving...' : 'Add Patient & Appointment'}
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 bg-white text-black border border-black rounded-md py-2 text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
