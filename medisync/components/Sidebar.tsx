'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Clinic } from '@/types'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Patients', href: '/dashboard/patients' },
  { label: 'Messages', href: '/dashboard/messages' },
]

export default function Sidebar({ clinic }: { clinic: Clinic }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] border-r border-gray-200 min-h-screen bg-white">
        <div className="bg-black px-5 py-4">
          <span className="text-white font-bold text-base tracking-tight">MediSync</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(link => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'text-black font-medium border-l-2 border-black pl-[10px]'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-400 truncate mb-2">{clinic.name}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-black underline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <nav className="md:hidden border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-bold text-black">MediSync</span>
          <div className="flex gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm ${
                  pathname === link.href ? 'text-black font-medium' : 'text-gray-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="text-sm text-gray-500">Logout</button>
          </div>
        </div>
      </nav>
    </>
  )
}
