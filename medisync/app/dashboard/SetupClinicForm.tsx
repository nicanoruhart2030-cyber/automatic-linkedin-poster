'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function SetupClinicForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hours, setHours] = useState('Mon–Fri 8am–5pm')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('clinics').insert({ owner_id: userId, name, phone, hours })
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm border border-gray-200 rounded-lg p-8">
      <h2 className="text-xl font-bold text-black mb-1">Set up your clinic</h2>
      <p className="text-sm text-gray-500 mb-6">Just a few details to get started</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Clinic Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
            placeholder="Downtown Dental"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
            placeholder="+1 555 000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Office Hours</label>
          <input
            type="text"
            value={hours}
            onChange={e => setHours(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  )
}
