export async function sendSMS(to: string, body: string) {
  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY!}`,
    },
    body: JSON.stringify({
      from: process.env.TELNYX_PHONE_NUMBER!,
      to,
      text: body,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Telnyx error: ${JSON.stringify(err)}`)
  }

  return await res.json()
}
