import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calculateAbstinenceStreak } from '../lib/streak-calculator'
import type { Habit, Relapse } from '../types'

export function useRelapses(habitId: string | null) {
  const [relapses, setRelapses] = useState<Relapse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRelapses = useCallback(async () => {
    if (!habitId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('relapses')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching relapses:', error)
    } else {
      setRelapses(data ?? [])
    }
    setLoading(false)
  }, [habitId])

  useEffect(() => {
    fetchRelapses()
  }, [fetchRelapses])

  const registerRelapse = async (
    habit: Habit,
    note: string | null
  ) => {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    const currentStreak = calculateAbstinenceStreak(habit, relapses)

    // Insert relapse
    const { error: relapseError } = await supabase.from('relapses').insert({
      habit_id: habit.id,
      date: today,
      note,
      streak_at_relapse: currentStreak,
    })

    if (relapseError) return relapseError

    // Update best_streak if needed and reset current_streak
    const updates: Partial<Habit> = { current_streak: 0 }
    if (currentStreak > habit.best_streak) {
      updates.best_streak = currentStreak
    }

    const { error: updateError } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habit.id)

    if (!updateError) await fetchRelapses()
    return updateError
  }

  return { relapses, loading, fetchRelapses, registerRelapse }
}

export function useAllRelapses(habitIds: string[]) {
  const [relapsesMap, setRelapsesMap] = useState<Record<string, Relapse[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (habitIds.length === 0) {
      setLoading(false)
      return
    }
    setLoading(true)

    const { data, error } = await supabase
      .from('relapses')
      .select('*')
      .in('habit_id', habitIds)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching all relapses:', error)
    } else {
      const map: Record<string, Relapse[]> = {}
      for (const r of data ?? []) {
        if (!map[r.habit_id]) map[r.habit_id] = []
        map[r.habit_id].push(r)
      }
      setRelapsesMap(map)
    }
    setLoading(false)
  }, [habitIds.join(',')])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { relapsesMap, loading, fetchAll }
}
