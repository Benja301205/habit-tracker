// Supabase Edge Function: send-push-reminders
// Runs via cron every 15 minutes
// Sends push notifications for habits that have reminders scheduled for this time/day

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!

interface PushPayload {
  title: string
  body: string
  url?: string
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  // Using web-push compatible fetch-based implementation
  // In production, use the web-push library or a push service
  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        TTL: '86400',
      },
      body: JSON.stringify(payload),
    })
    return response.ok
  } catch (err) {
    console.error('Push notification failed:', err)
    return false
  }
}

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get current time and day in Argentina timezone
  const now = new Date()
  const argTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })
  )
  const currentHour = argTime.getHours().toString().padStart(2, '0')
  const currentMinute = Math.floor(argTime.getMinutes() / 15) * 15
  const timeStr = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`

  const dayOfWeek = argTime.getDay() === 0 ? 7 : argTime.getDay() // 1=Mon...7=Sun

  // Get habits with reminders for this time and day
  const { data: habits, error } = await supabase
    .from('habits')
    .select('id, user_id, name, emoji, type, reminder_days, reminder_time')
    .eq('active', true)
    .not('reminder_days', 'is', null)
    .not('reminder_time', 'is', null)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  let sent = 0

  for (const habit of habits ?? []) {
    // Check if this habit should be reminded now
    if (!habit.reminder_days?.includes(dayOfWeek)) continue

    const reminderHour = habit.reminder_time?.split(':')[0]
    const reminderMinute = habit.reminder_time?.split(':')[1]
    const reminderTimeStr = `${reminderHour}:${reminderMinute}`

    // Match within 15 minute window
    if (reminderTimeStr < timeStr || reminderTimeStr >= `${currentHour}:${(currentMinute + 15).toString().padStart(2, '0')}`) {
      continue
    }

    // Get push subscriptions for this user
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', habit.user_id)

    if (!subscriptions?.length) continue

    const payload: PushPayload = {
      title: `${habit.emoji} ${habit.name}`,
      body:
        habit.type === 'positive'
          ? `¡Hora de ${habit.name.toLowerCase()}!`
          : `💪 ¡Seguí fuerte! Vos podés.`,
      url: '/',
    }

    for (const sub of subscriptions) {
      await sendPushNotification(sub, payload)
      sent++
    }
  }

  return new Response(
    JSON.stringify({ success: true, notificationsSent: sent }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
