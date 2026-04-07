import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediSync — AI Medical Receptionist',
  description: 'AI-powered appointment reminders, voice calls, and patient chat for clinics.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black">
        {children}
      </body>
    </html>
  )
}
