'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTERS = [
  'Book an appointment',
  'What are your hours?',
  'I need to cancel my appointment',
]

export default function ChatWidget({ clinicId }: { clinicId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [visitorPhone, setVisitorPhone] = useState('')
  const [infoSubmitted, setInfoSubmitted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicId, message: '__init__', history: [] }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.sessionId) setSessionId(data.sessionId)
      })
      .catch(() => {})
  }, [clinicId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicId,
        sessionId,
        message: text,
        history: messages,
      }),
    })
    const data = await res.json()
    if (data.sessionId) setSessionId(data.sessionId)
    const assistantMsg: Message = { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' }
    setMessages(prev => [...prev, assistantMsg])
    setLoading(false)
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionId) return
    // Save visitor info to chat session
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase
      .from('chat_sessions')
      .update({ visitor_name: visitorName, visitor_phone: visitorPhone })
      .eq('id', sessionId)
    setInfoSubmitted(true)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-black px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white opacity-70" />
          <span className="text-white text-sm font-medium">AI Receptionist</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 text-center mb-4">How can I help you today?</p>
            {STARTERS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="w-full text-left text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-black"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-black'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <span className="text-gray-400 text-sm">...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Visitor info form (shown once, before first real message) */}
      {messages.length > 0 && !infoSubmitted && sessionId && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Share your info so we can follow up:</p>
          <form onSubmit={handleInfoSubmit} className="space-y-2">
            <input
              type="text"
              value={visitorName}
              onChange={e => setVisitorName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-black"
            />
            <input
              type="tel"
              value={visitorPhone}
              onChange={e => setVisitorPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-black"
            />
            <button type="submit"
              className="w-full bg-black text-white rounded py-1.5 text-xs hover:bg-gray-800">
              Save
            </button>
          </form>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 px-3 py-3 flex gap-2 flex-shrink-0 bg-white">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="bg-black text-white rounded-md px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  )
}
