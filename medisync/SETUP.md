# MediSync Setup Guide

## 1. Supabase
1. Go to supabase.com → New project
2. Copy Project URL and anon key → paste into .env.local
3. Go to Settings → API → copy service_role key → paste into .env.local
4. Go to SQL Editor → paste the SQL from Step 3 of the build prompt → Run

## 2. Twilio (SMS)
1. Sign up at twilio.com
2. Buy a phone number (~$1/mo) — must be SMS-capable
3. Copy Account SID and Auth Token → .env.local
4. Add your Twilio number to .env.local as TWILIO_PHONE_NUMBER
5. After deploying: go to Twilio Console → Phone Numbers → your number → Messaging →
   set Webhook URL to: https://yourapp.com/api/sms/webhook

## 3. Bland AI (Voice Calls)
1. Sign up at bland.ai
2. Get your API key from the dashboard
3. Buy a phone number in the Bland dashboard (US or CA)
4. Paste API key and phone number into .env.local
5. Bland webhooks are set per-call in the API request — no manual setup needed

## 4. Groq (AI)
1. Sign up at console.groq.com (free)
2. Create an API key → paste into .env.local

## 5. Deploy to Vercel
1. Push to GitHub
2. Go to vercel.com → Import repository
3. Add all .env.local variables as Environment Variables in Vercel
4. Deploy
5. Update NEXT_PUBLIC_APP_URL to your Vercel URL
6. Update Twilio SMS webhook to your Vercel URL + /api/sms/webhook

## 6. Embed the Chat Widget
Add this iframe to any clinic website:
```html
<iframe
  src="https://yourapp.com/widget/CLINIC_ID"
  width="380"
  height="580"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.12);"
></iframe>
```
Replace `CLINIC_ID` with the clinic's UUID from Supabase.

## Cost Breakdown (per clinic, per month)
- Supabase: Free tier (up to 500MB)
- Twilio SMS: ~$0.0075/message (100 reminders = $0.75)
- Bland AI calls: $0.09/min (100 calls × 2min = $18)
- Groq: Free tier covers all SMS generation and chat
- **Total cost to serve 1 clinic: ~$20–30/month**
- **You charge: $800–$2,500/month**
- **Margin: ~97%**

## Note on Supabase Keys
The `.env.local` currently uses the service role key as both the anon and service role key.
For production, go to Supabase → Settings → API and get your **anon/public** key to use as
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. The anon key is safe to expose publicly — the service role
key should only be in `SUPABASE_SERVICE_ROLE_KEY`.
