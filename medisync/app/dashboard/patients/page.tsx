'use client'

import { useState, useEffect } from 'react'
import { Patient } from '@/types'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => { setPatients(data); setLoading(false) })
  }, [])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  async function handleSMS(patient: Patient) {
    const note = `To implement: open SMS for ${patient.name}`
    alert(note)
  }

  async function handleCall(patient: Patient) {
    const note = `To implement: start call for ${patient.name}`
    alert(note)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-black">Patients</h1>
          <p className="text-sm text-gray-500">{patients.length} total patients</p>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or phone..."
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:border-black"
      />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-12">No patients found.</p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-black">Name</th>
                <th className="text-left px-4 py-3 font-medium text-black">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-black">Email</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-[#f5f5f5] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-black">{patient.name}</td>
                  <td className="px-4 py-3 text-gray-500">{patient.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{patient.email || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSMS(patient)}
                        className="text-xs px-2 py-1 border border-black rounded text-black hover:bg-gray-50"
                      >
                        SMS
                      </button>
                      <button
                        onClick={() => handleCall(patient)}
                        className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-gray-800"
                      >
                        Call
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
