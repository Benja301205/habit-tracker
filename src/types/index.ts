export type HabitType = 'positive' | 'abstinence'
export type StreakUnit = 'weeks' | 'days'

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  color: string
  type: HabitType
  weekly_goal: number | null
  start_date: string
  reminder_days: number[] | null
  reminder_time: string | null
  current_streak: number
  best_streak: number
  streak_unit: StreakUnit
  active: boolean
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  habit_id: string
  date: string
  completed: boolean
  created_at: string
}

export interface Relapse {
  id: string
  habit_id: string
  date: string
  note: string | null
  streak_at_relapse: number
  created_at: string
}

export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export type Tab = 'today' | 'stats' | 'settings'
