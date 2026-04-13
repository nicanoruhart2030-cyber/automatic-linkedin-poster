'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Message } from '@/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type ChatSession = {
  id: string
  visitor_name: string | null
  visitor_phone: string | null
  created_at: string
  chat_messages: { role: string; content: string; created_at: string }[]
}

export default function MessagesPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', session.user.id)
      .single()

    if (!clinic) return

    const { data: msgs } = await supabase
      .from('messages')
      .select('*, patients(name)')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false })
      .limit(100)

    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('*, chat_messages(*)')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false })

    setMessages((msgs as Message[]) || [])
    setChatSessions((sessions as ChatSession[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  function typeBadge(type: string) {
    if (type === 'sms') return <span className="px-2 py-0.5 text-xs rounded bg-black text-white">SMS</span>
    if (type === 'call') return <span className="px-2 py-0.5 text-xs rounded border border-black text-black">Call</span>
    return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">Chat</span>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-black">Messages</h1>
        <p className="text-sm text-gray-500">All SMS, call, and chat activity</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : (
        <>
          {messages.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-black">Time</th>
                    <th className="text-left px-4 py-3 font-medium text-black">Patient</th>
                    <th className="text-left px-4 py-3 font-medium text-black">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-black">Dir.</th>
                    <th className="text-left px-4 py-3 font-medium text-black">Content</th>
                    <th className="text-left px-4 py-3 font-medium text-black">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id} className="border-b border-gray-100 last:border-0 hover:bg-[#f5f5f5]">
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{timeAgo(msg.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-black">
                        {(msg.patients as { name: string } | undefined)?.name || '—'}
                      </td>
                      <td className="px-4 py-3">{typeBadge(msg.type)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {msg.direction === 'outbound' ? '→ Out' : '← In'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {msg.content?.slice(0, 80)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">{msg.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {chatSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-black mb-3">Chat Widget Sessions</h2>
              <div className="space-y-2">
                {chatSessions.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
                    >
                      <div>
                        <span className="font-medium text-sm text-black">
                          {session.visitor_name || 'Anonymous visitor'}
                        </span>
                        {session.visitor_phone && (
                          <span className="text-xs text-gray-400 ml-2">{session.visitor_phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{timeAgo(session.created_at)}</span>
                        <span className="text-xs text-gray-400">
                          {session.chat_messages?.length || 0} messages
                        </span>
                        <span className="text-gray-400">{expandedSession === session.id ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expandedSession === session.id && session.chat_messages?.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50">
                        {session.chat_messages
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                msg.role === 'user'
                                  ? 'bg-black text-white'
                                  : 'bg-white border border-gray-200 text-black'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && chatSessions.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-12">No messages yet.</p>
          )}
        </>
      )}
    </div>
  )
}
