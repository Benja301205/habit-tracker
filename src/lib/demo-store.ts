import type { Habit, CheckIn, Relapse } from '../types'
import { getTodayArgentina } from './streak-calculator'

const DEMO_USER_ID = 'demo-user-000'

function generateId() {
  return crypto.randomUUID()
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return fallback
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data))
}

const today = getTodayArgentina()

const DEFAULT_HABITS: Habit[] = [
  {
    id: generateId(),
    user_id: DEMO_USER_ID,
    name: 'Ejercicio',
    emoji: '🏃',
    type: 'positive',
    weekly_goal: 3,
    color: '#10B981',
    streak_unit: 'weeks',
    start_date: today,
    reminder_days: null,
    reminder_time: null,
    current_streak: 2,
    best_streak: 5,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: generateId(),
    user_id: DEMO_USER_ID,
    name: 'Lectura',
    emoji: '📖',
    type: 'positive',
    weekly_goal: 5,
    color: '#6366F1',
    streak_unit: 'weeks',
    start_date: today,
    reminder_days: [1, 2, 3, 4, 5],
    reminder_time: '21:00',
    current_streak: 3,
    best_streak: 3,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: generateId(),
    user_id: DEMO_USER_ID,
    name: 'Meditación',
    emoji: '🧘',
    type: 'positive',
    weekly_goal: 4,
    color: '#8B5CF6',
    streak_unit: 'weeks',
    start_date: today,
    reminder_days: null,
    reminder_time: null,
    current_streak: 1,
    best_streak: 8,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: generateId(),
    user_id: DEMO_USER_ID,
    name: 'No alcohol',
    emoji: '🚫🍷',
    type: 'abstinence',
    weekly_goal: null,
    color: '#EF4444',
    streak_unit: 'days',
    start_date: '2026-03-01',
    reminder_days: null,
    reminder_time: null,
    current_streak: 24,
    best_streak: 24,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: generateId(),
    user_id: DEMO_USER_ID,
    name: 'No fap',
    emoji: '💪',
    type: 'abstinence',
    weekly_goal: null,
    color: '#F59E0B',
    streak_unit: 'days',
    start_date: '2026-03-10',
    reminder_days: null,
    reminder_time: null,
    current_streak: 15,
    best_streak: 30,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

let habits: Habit[] = loadFromStorage('demo_habits', DEFAULT_HABITS)
let checkIns: CheckIn[] = loadFromStorage('demo_checkins', [])
let relapses: Relapse[] = loadFromStorage('demo_relapses', [])

function persist() {
  saveToStorage('demo_habits', habits)
  saveToStorage('demo_checkins', checkIns)
  saveToStorage('demo_relapses', relapses)
}

export const demoStore = {
  getHabits(): Habit[] {
    return habits.filter((h) => h.active)
  },

  createHabit(data: Partial<Habit>): Habit {
    const habit: Habit = {
      id: generateId(),
      user_id: DEMO_USER_ID,
      name: data.name ?? '',
      emoji: data.emoji ?? '✅',
      color: data.color ?? '#6366F1',
      type: data.type ?? 'positive',
      weekly_goal: data.weekly_goal ?? null,
      start_date: data.start_date ?? today,
      reminder_days: data.reminder_days ?? null,
      reminder_time: data.reminder_time ?? null,
      current_streak: 0,
      best_streak: 0,
      streak_unit: data.streak_unit ?? 'weeks',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    habits.push(habit)
    persist()
    return habit
  },

  updateHabit(id: string, updates: Partial<Habit>) {
    habits = habits.map((h) =>
      h.id === id ? { ...h, ...updates, updated_at: new Date().toISOString() } : h
    )
    persist()
  },

  deleteHabit(id: string) {
    habits = habits.filter((h) => h.id !== id)
    checkIns = checkIns.filter((c) => c.habit_id !== id)
    relapses = relapses.filter((r) => r.habit_id !== id)
    persist()
  },

  getCheckIns(habitIds: string[]): Record<string, CheckIn[]> {
    const map: Record<string, CheckIn[]> = {}
    for (const ci of checkIns) {
      if (habitIds.includes(ci.habit_id)) {
        if (!map[ci.habit_id]) map[ci.habit_id] = []
        map[ci.habit_id].push(ci)
      }
    }
    return map
  },

  toggleCheckIn(habitId: string, date?: string): boolean {
    const targetDate = date ?? getTodayArgentina()
    const idx = checkIns.findIndex(
      (c) => c.habit_id === habitId && c.date === targetDate
    )
    if (idx >= 0) {
      checkIns.splice(idx, 1)
      persist()
      return false // unchecked
    } else {
      checkIns.push({
        id: generateId(),
        habit_id: habitId,
        date: targetDate,
        completed: true,
        created_at: new Date().toISOString(),
      })
      persist()
      return true // checked
    }
  },

  getRelapses(habitIds: string[]): Record<string, Relapse[]> {
    const map: Record<string, Relapse[]> = {}
    for (const r of relapses) {
      if (habitIds.includes(r.habit_id)) {
        if (!map[r.habit_id]) map[r.habit_id] = []
        map[r.habit_id].push(r)
      }
    }
    return map
  },

  addRelapse(habitId: string, note: string | null, streakAtRelapse: number) {
    relapses.push({
      id: generateId(),
      habit_id: habitId,
      date: getTodayArgentina(),
      note,
      streak_at_relapse: streakAtRelapse,
      created_at: new Date().toISOString(),
    })

    const habit = habits.find((h) => h.id === habitId)
    if (habit) {
      if (streakAtRelapse > habit.best_streak) {
        habit.best_streak = streakAtRelapse
      }
      habit.current_streak = 0
      habit.updated_at = new Date().toISOString()
    }
    persist()
  },
}
