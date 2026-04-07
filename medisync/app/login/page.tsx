'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      if (data.user) {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm border border-gray-200 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-black mb-2">MediSync</h1>
        <p className="text-sm text-gray-500 mb-6">
          {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {error && (
          <div className="mb-4 p-3 border border-black rounded-md text-sm text-black">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="you@clinic.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>No account?{' '}
              <button onClick={() => setMode('signup')} className="text-black underline">Create one</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-black underline">Sign in</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
