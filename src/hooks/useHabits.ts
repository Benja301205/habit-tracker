import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { createDefaultHabits } from '../lib/default-habits'
import type { Habit } from '../types'

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching habits:', error)
      setLoading(false)
      return
    }

    if (data && data.length === 0) {
      // First login: create default habits
      await createDefaultHabits(user.id)
      const { data: newData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: true })
      setHabits(newData ?? [])
    } else {
      setHabits(data ?? [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const createHabit = async (habit: Partial<Habit>) => {
    if (!user) return
    const { error } = await supabase.from('habits').insert({
      ...habit,
      user_id: user.id,
    })
    if (!error) await fetchHabits()
    return error
  }

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
    if (!error) await fetchHabits()
    return error
  }

  const archiveHabit = async (id: string): Promise<void> => {
    await updateHabit(id, { active: false })
  }

  const deleteHabit = async (id: string): Promise<void> => {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (!error) await fetchHabits()
  }

  return {
    habits,
    loading,
    fetchHabits,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
  }
}
