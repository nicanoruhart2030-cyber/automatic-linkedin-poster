'use client'

import { useState } from 'react'

interface SMSPreviewModalProps {
  patientName: string
  patientPhone: string
  smsText: string
  onClose: () => void
}

export default function SMSPreviewModal({ patientName, patientPhone, smsText, onClose }: SMSPreviewModalProps) {
  const [sent, setSent] = useState(false)

  function handleSend() {
    setSent(true)
    setTimeout(() => onClose(), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm border border-gray-200">
        <div className="p-5">
          <h3 className="font-bold text-black mb-1">Send SMS Reminder</h3>
          <p className="text-sm text-gray-500 mb-4">
            Sending to: <span className="text-black font-medium">{patientName}</span> · {patientPhone}
          </p>

          <div className="bg-black rounded-lg p-3 mb-3">
            <p className="text-white text-sm leading-relaxed">{smsText}</p>
          </div>

          <p className="text-xs text-gray-400 mb-4">{smsText.length} / 160 characters</p>

          {sent ? (
            <div className="text-center py-2">
              <p className="text-black font-medium">✓ Sent</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSend}
                className="flex-1 bg-black text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800"
              >
                Send Message
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white text-black border border-black rounded-md py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
