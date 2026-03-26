import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { useAuth } from './lib/auth-context'
import { isDemo } from './lib/supabase'
import { demoStore } from './lib/demo-store'
import { useHabits } from './hooks/useHabits'
import { useAllCheckIns } from './hooks/useCheckIns'
import { useAllRelapses } from './hooks/useStreaks'
import type { Tab, Habit, CheckIn, Relapse } from './types'
import TabBar from './components/layout/TabBar'
import Today from './pages/Today'
import { supabase } from './lib/supabase'
import { calculateAbstinenceStreak } from './lib/streak-calculator'

const Stats = lazy(() => import('./pages/Stats'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))

function PageLoader() {
  return (
    <div className="px-5 pt-4 safe-top">
      <div className="skeleton h-8 w-32 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function DemoApp() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkInsMap, setCheckInsMap] = useState<Record<string, CheckIn[]>>({})
  const [relapsesMap, setRelapsesMap] = useState<Record<string, Relapse[]>>({})
  const [loading, setLoading] = useState(true)

  const refreshAll = useCallback(() => {
    const h = demoStore.getHabits()
    setHabits(h)
    const ids = h.map((x) => x.id)
    setCheckInsMap(demoStore.getCheckIns(ids))
    setRelapsesMap(demoStore.getRelapses(ids))
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const handleToggleCheckIn = async (habitId: string) => {
    demoStore.toggleCheckIn(habitId)
    refreshAll()
  }

  const handleRegisterRelapse = async (habit: Habit, note: string | null) => {
    const rels = relapsesMap[habit.id] ?? []
    const currentStreak = calculateAbstinenceStreak(habit, rels)
    demoStore.addRelapse(habit.id, note, currentStreak)
    refreshAll()
  }

  const handleCreateHabit = async (data: Partial<Habit>) => {
    demoStore.createHabit(data)
    refreshAll()
  }

  const handleUpdateHabit = async (id: string, data: Partial<Habit>) => {
    demoStore.updateHabit(id, data)
    refreshAll()
  }

  const handleArchiveHabit = async (id: string) => {
    demoStore.updateHabit(id, { active: false })
    refreshAll()
  }

  const handleDeleteHabit = async (id: string) => {
    demoStore.deleteHabit(id)
    refreshAll()
  }

  return (
    <div className="min-h-svh bg-slate-950">
      {activeTab === 'today' && (
        <Today
          habits={habits}
          checkInsMap={checkInsMap}
          relapsesMap={relapsesMap}
          loading={loading}
          onToggleCheckIn={handleToggleCheckIn}
          onRegisterRelapse={handleRegisterRelapse}
          onCreateHabit={handleCreateHabit}
          onRefresh={refreshAll}
        />
      )}
      <Suspense fallback={<PageLoader />}>
        {activeTab === 'stats' && (
          <Stats
            habits={habits}
            checkInsMap={checkInsMap}
            relapsesMap={relapsesMap}
            loading={loading}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            habits={habits}
            onUpdateHabit={handleUpdateHabit}
            onArchiveHabit={handleArchiveHabit}
            onDeleteHabit={handleDeleteHabit}
            onRefresh={refreshAll}
          />
        )}
      </Suspense>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

function SupabaseApp() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const {
    habits,
    loading: habitsLoading,
    fetchHabits,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
  } = useHabits()

  const habitIds = useMemo(() => habits.map((h) => h.id), [habits])
  const { checkInsMap, loading: checkInsLoading, fetchAll: fetchCheckIns, toggleCheckIn } =
    useAllCheckIns(habitIds)
  const { relapsesMap, loading: relapsesLoading, fetchAll: fetchRelapses } =
    useAllRelapses(habitIds)

  const loading = habitsLoading || checkInsLoading || relapsesLoading

  const refreshAll = useCallback(() => {
    fetchHabits()
    fetchCheckIns()
    fetchRelapses()
  }, [fetchHabits, fetchCheckIns, fetchRelapses])

  const handleToggleCheckIn = async (habitId: string) => {
    await toggleCheckIn(habitId)
  }

  const handleRegisterRelapse = async (habit: Habit, note: string | null) => {
    const relapses = relapsesMap[habit.id] ?? []
    const currentStreak = calculateAbstinenceStreak(habit, relapses)
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    await supabase.from('relapses').insert({
      habit_id: habit.id,
      date: today,
      note,
      streak_at_relapse: currentStreak,
    })

    const updates: Partial<Habit> = { current_streak: 0 }
    if (currentStreak > habit.best_streak) {
      updates.best_streak = currentStreak
    }
    await supabase.from('habits').update(updates).eq('id', habit.id)
    refreshAll()
  }

  const handleCreateHabit = async (data: Partial<Habit>) => {
    await createHabit(data)
  }

  const handleUpdateHabit = async (id: string, data: Partial<Habit>) => {
    await updateHabit(id, data)
  }

  return (
    <div className="min-h-svh bg-slate-950">
      {activeTab === 'today' && (
        <Today
          habits={habits}
          checkInsMap={checkInsMap}
          relapsesMap={relapsesMap}
          loading={loading}
          onToggleCheckIn={handleToggleCheckIn}
          onRegisterRelapse={handleRegisterRelapse}
          onCreateHabit={handleCreateHabit}
          onRefresh={refreshAll}
        />
      )}
      <Suspense fallback={<PageLoader />}>
        {activeTab === 'stats' && (
          <Stats
            habits={habits}
            checkInsMap={checkInsMap}
            relapsesMap={relapsesMap}
            loading={loading}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            habits={habits}
            onUpdateHabit={handleUpdateHabit}
            onArchiveHabit={archiveHabit}
            onDeleteHabit={deleteHabit}
            onRefresh={refreshAll}
          />
        )}
      </Suspense>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function App() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="text-4xl animate-pulse">🔥</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    )
  }

  return isDemo ? <DemoApp /> : <SupabaseApp />
}
