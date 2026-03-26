import { supabase } from './supabase'
import { getTodayArgentina } from './streak-calculator'

const DEFAULT_HABITS = [
  {
    name: 'Ejercicio',
    emoji: '🏃',
    type: 'positive' as const,
    weekly_goal: 3,
    color: '#10B981',
    streak_unit: 'weeks' as const,
  },
  {
    name: 'Lectura',
    emoji: '📖',
    type: 'positive' as const,
    weekly_goal: 5,
    color: '#6366F1',
    streak_unit: 'weeks' as const,
  },
  {
    name: 'Meditación',
    emoji: '🧘',
    type: 'positive' as const,
    weekly_goal: 4,
    color: '#8B5CF6',
    streak_unit: 'weeks' as const,
  },
  {
    name: 'No alcohol',
    emoji: '🚫🍷',
    type: 'abstinence' as const,
    weekly_goal: null,
    color: '#EF4444',
    streak_unit: 'days' as const,
  },
  {
    name: 'No fap',
    emoji: '💪',
    type: 'abstinence' as const,
    weekly_goal: null,
    color: '#F59E0B',
    streak_unit: 'days' as const,
  },
]

export async function createDefaultHabits(userId: string) {
  const today = getTodayArgentina()

  const habits = DEFAULT_HABITS.map((h) => ({
    ...h,
    user_id: userId,
    start_date: today,
  }))

  const { error } = await supabase.from('habits').insert(habits)
  if (error) {
    console.error('Error creating default habits:', error)
  }
}
