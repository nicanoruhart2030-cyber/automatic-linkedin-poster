import { Appointment } from '@/types'

interface StatsBarProps {
  appointments: Appointment[]
}

export default function StatsBar({ appointments }: StatsBarProps) {
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)
  const in24h = new Date(now)
  in24h.setHours(now.getHours() + 24)

  const thisWeek = appointments.filter(a => {
    const d = new Date(a.appointment_date)
    return d >= now && d <= weekEnd
  })

  const confirmed = appointments.filter(a => a.status === 'confirmed').length
  const pending = appointments.filter(a => a.status === 'unconfirmed').length
  const atRisk = appointments.filter(a => {
    const d = new Date(a.appointment_date)
    return a.status === 'unconfirmed' && d >= now && d <= in24h
  }).length

  const stats = [
    { label: 'This Week', value: thisWeek.length, dark: false },
    { label: 'Confirmed', value: confirmed, dark: true },
    { label: 'Pending', value: pending, dark: false },
    { label: '⚠ At Risk', value: atRisk, dark: true },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map(stat => (
        <div
          key={stat.label}
          className={`rounded-lg border px-4 py-3 ${
            stat.dark
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-200'
          }`}
        >
          <p className={`text-xs mb-1 ${stat.dark ? 'text-gray-400' : 'text-gray-500'}`}>
            {stat.label}
          </p>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
