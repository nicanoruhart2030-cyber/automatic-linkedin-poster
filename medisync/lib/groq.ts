import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateSMSReminder(params: {
  patientName: string
  appointmentType: string
  appointmentDate: string
  clinicName: string
}): Promise<string> {
  const { patientName, appointmentType, appointmentDate, clinicName } = params
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 100,
    messages: [
      {
        role: 'system',
        content: `Write a single SMS appointment reminder under 160 characters. Be warm. Include patient name, appointment type, date/time. End with: "Reply YES to confirm or call us to reschedule." Sign off as the clinic name. Return only the SMS text, nothing else.`,
      },
      {
        role: 'user',
        content: `Patient: ${patientName}, Appointment: ${appointmentType}, When: ${appointmentDate}, Clinic: ${clinicName}`,
      },
    ],
  })
  return res.choices[0].message.content?.trim() || ''
}

export async function chatReceptionist(params: {
  messages: { role: 'user' | 'assistant'; content: string }[]
  clinicName: string
  clinicHours: string
  clinicPhone: string
}): Promise<string> {
  const { messages, clinicName, clinicHours, clinicPhone } = params
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 200,
    messages: [
      {
        role: 'system',
        content: `You are the receptionist for ${clinicName}. Answer patient questions, help with booking requests, handle cancellations. Clinic hours: ${clinicHours}. Clinic phone: ${clinicPhone}. Keep responses to 2–3 sentences. Never give medical advice. If emergency, say call 911.`,
      },
      ...messages,
    ],
  })
  return res.choices[0].message.content?.trim() || ''
}
