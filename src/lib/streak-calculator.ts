import { differenceInDays, parseISO } from 'date-fns'
import type { Habit, Relapse } from '../types'

/**
 * Calcula la racha actual de un hábito de abstinencia.
 * Se calcula dinámicamente basándose en la última recaída o la fecha de inicio.
 */
export function calculateAbstinenceStreak(
  habit: Habit,
  relapses: Relapse[]
): number {
  const now = new Date()
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))

  if (relapses.length === 0) {
    return differenceInDays(today, parseISO(habit.start_date))
  }

  const sortedRelapses = [...relapses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const lastRelapse = sortedRelapses[0]
  return differenceInDays(today, parseISO(lastRelapse.date))
}

/**
 * Obtiene la fecha de hoy en zona horaria de Argentina
 */
export function getTodayArgentina(): string {
  const now = new Date()
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
}

/**
 * Obtiene la fecha formateada para mostrar
 */
export function getFormattedDate(): string {
  const now = new Date()
  return now.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Obtiene el inicio de la semana actual (lunes)
 */
export function getWeekStart(): string {
  const now = new Date()
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
}
