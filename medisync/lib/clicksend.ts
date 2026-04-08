export async function sendSMS(to: string, body: string) {
  const credentials = Buffer.from(
    `${process.env.CLICKSEND_USERNAME!}:${process.env.CLICKSEND_API_KEY!}`
  ).toString('base64')

  const res = await fetch('https://rest.clicksend.com/v3/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      messages: [
        {
          source: 'sdk',
          body,
          to,
          from: process.env.CLICKSEND_PHONE_NUMBER || 'MediSync',
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`ClickSend error: ${JSON.stringify(err)}`)
  }

  return await res.json()
}
