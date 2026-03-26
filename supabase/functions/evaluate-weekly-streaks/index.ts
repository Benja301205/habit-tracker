// Supabase Edge Function: evaluate-weekly-streaks
// Runs via cron every Monday at 00:05 Argentina time (03:05 UTC)
// Evaluates whether positive habits met their weekly goal and updates streaks

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get last week's date range (Monday to Sunday)
  const now = new Date()
  const today = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })
  )
  const lastMonday = new Date(today)
  lastMonday.setDate(today.getDate() - 7)
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - 1)

  const mondayStr = lastMonday.toISOString().split('T')[0]
  const sundayStr = lastSunday.toISOString().split('T')[0]

  // Get all active positive habits
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id, user_id, weekly_goal, current_streak, best_streak')
    .eq('type', 'positive')
    .eq('active', true)

  if (habitsError) {
    return new Response(JSON.stringify({ error: habitsError.message }), {
      status: 500,
    })
  }

  let updated = 0

  for (const habit of habits ?? []) {
    // Count check-ins for last week
    const { count } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('habit_id', habit.id)
      .eq('completed', true)
      .gte('date', mondayStr)
      .lte('date', sundayStr)

    const goal = habit.weekly_goal ?? 1
    const metGoal = (count ?? 0) >= goal

    if (metGoal) {
      const newStreak = habit.current_streak + 1
      const newBest = Math.max(habit.best_streak, newStreak)
      await supabase
        .from('habits')
        .update({
          current_streak: newStreak,
          best_streak: newBest,
        })
        .eq('id', habit.id)
    } else {
      const newBest = Math.max(habit.best_streak, habit.current_streak)
      await supabase
        .from('habits')
        .update({
          current_streak: 0,
          best_streak: newBest,
        })
        .eq('id', habit.id)
    }

    updated++
  }

  return new Response(
    JSON.stringify({ success: true, habitsProcessed: updated }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
