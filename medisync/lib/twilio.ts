import twilio from 'twilio'

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
}

export async function sendSMS(to: string, body: string) {
  return await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  })
}
