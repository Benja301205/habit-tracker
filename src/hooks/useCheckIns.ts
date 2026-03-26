import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getTodayArgentina, getWeekStart } from '../lib/streak-calculator'
import type { CheckIn } from '../types'

export function useCheckIns(habitId: string | null) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCheckIns = useCallback(async () => {
    if (!habitId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching check-ins:', error)
    } else {
      setCheckIns(data ?? [])
    }
    setLoading(false)
  }, [habitId])

  useEffect(() => {
    fetchCheckIns()
  }, [fetchCheckIns])

  const toggleCheckIn = async (habitId: string, date?: string) => {
    const targetDate = date ?? getTodayArgentina()

    const existing = checkIns.find((c) => c.date === targetDate)

    if (existing) {
      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('id', existing.id)
      if (!error) await fetchCheckIns()
      return error
    } else {
      const { error } = await supabase.from('check_ins').insert({
        habit_id: habitId,
        date: targetDate,
        completed: true,
      })
      if (!error) await fetchCheckIns()
      return error
    }
  }

  const isTodayChecked = checkIns.some(
    (c) => c.date === getTodayArgentina() && c.completed
  )

  const weeklyCount = checkIns.filter((c) => {
    const weekStart = getWeekStart()
    return c.date >= weekStart && c.completed
  }).length

  return {
    checkIns,
    loading,
    fetchCheckIns,
    toggleCheckIn,
    isTodayChecked,
    weeklyCount,
  }
}

export function useAllCheckIns(habitIds: string[]) {
  const [checkInsMap, setCheckInsMap] = useState<Record<string, CheckIn[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (habitIds.length === 0) {
      setLoading(false)
      return
    }
    setLoading(true)

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .in('habit_id', habitIds)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching all check-ins:', error)
    } else {
      const map: Record<string, CheckIn[]> = {}
      for (const ci of data ?? []) {
        if (!map[ci.habit_id]) map[ci.habit_id] = []
        map[ci.habit_id].push(ci)
      }
      setCheckInsMap(map)
    }
    setLoading(false)
  }, [habitIds.join(',')])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const toggleCheckIn = async (habitId: string, date?: string) => {
    const targetDate = date ?? getTodayArgentina()
    const habitCheckIns = checkInsMap[habitId] ?? []
    const existing = habitCheckIns.find((c) => c.date === targetDate)

    // Optimistic update
    const previousMap = { ...checkInsMap }

    if (existing) {
      setCheckInsMap((prev) => ({
        ...prev,
        [habitId]: (prev[habitId] ?? []).filter((c) => c.id !== existing.id),
      }))
      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('id', existing.id)
      if (error) setCheckInsMap(previousMap) // rollback
      return error
    } else {
      const optimisticCheckIn: CheckIn = {
        id: `temp-${Date.now()}`,
        habit_id: habitId,
        date: targetDate,
        completed: true,
        created_at: new Date().toISOString(),
      }
      setCheckInsMap((prev) => ({
        ...prev,
        [habitId]: [optimisticCheckIn, ...(prev[habitId] ?? [])],
      }))
      const { error } = await supabase.from('check_ins').insert({
        habit_id: habitId,
        date: targetDate,
        completed: true,
      })
      if (error) {
        setCheckInsMap(previousMap) // rollback
      } else {
        await fetchAll() // sync real IDs
      }
      return error
    }
  }

  return { checkInsMap, loading, fetchAll, toggleCheckIn }
}
