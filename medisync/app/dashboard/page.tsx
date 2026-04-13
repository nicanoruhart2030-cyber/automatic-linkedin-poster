'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Appointment } from '@/types'
import StatsBar from '@/components/StatsBar'
import AppointmentCard from '@/components/AppointmentCard'
import AddPatientModal from '@/components/AddPatientModal'

export default function DashboardPage() {
  const supabase = createClient()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [clinicId, setClinicId] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    const res = await fetch('/api/appointments')
    if (res.ok) {
      const data = await res.json()
      setAppointments(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAppointments()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase
        .from('clinics')
        .select('id')
        .eq('owner_id', session.user.id)
        .single()
        .then(({ data: clinic }) => {
          if (clinic) setClinicId(clinic.id)
        })
    })
  }, [fetchAppointments, supabase])

  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => { fetchAppointments() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAppointments, supabase])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-black">Dashboard</h1>
          <p className="text-sm text-gray-500">Manage appointments and patient communications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          + Add Appointment
        </button>
      </div>

      <StatsBar appointments={appointments} />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm">No appointments yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-sm text-black underline"
          >
            Add your first patient
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(appt => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onUpdate={fetchAppointments}
            />
          ))}
        </div>
      )}

      {showModal && clinicId && (
        <AddPatientModal
          clinicId={clinicId}
          onClose={() => setShowModal(false)}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  )
}
