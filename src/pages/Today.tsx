import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Download, Sparkles } from 'lucide-react'
import { SproutIllustration, CelebrationIllustration } from '../components/ui/Illustrations'
import type { Habit, CheckIn, Relapse } from '../types'
import { getTodayArgentina } from '../lib/streak-calculator'
import Header from '../components/layout/Header'
import HabitCard from '../components/habits/HabitCard'
import HabitDetail from '../components/habits/HabitDetail'
import HabitForm from '../components/habits/HabitForm'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

interface TodayProps {
  habits: Habit[]
  checkInsMap: Record<string, CheckIn[]>
  relapsesMap: Record<string, Relapse[]>
  loading: boolean
  onToggleCheckIn: (habitId: string) => Promise<void>
  onRegisterRelapse: (habit: Habit, note: string | null) => Promise<void>
  onCreateHabit: (data: Partial<Habit>) => Promise<void>
  onRefresh: () => void
}

export default function Today({
  habits,
  checkInsMap,
  relapsesMap,
  loading,
  onToggleCheckIn,
  onRegisterRelapse,
  onCreateHabit,
  onRefresh,
}: TodayProps) {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { canInstall, promptInstall } = useInstallPrompt()

  const positiveHabits = habits.filter((h) => h.type === 'positive')
  const abstinenceHabits = habits.filter((h) => h.type === 'abstinence')

  const today = getTodayArgentina()

  const allPositivesDone = positiveHabits.length > 0 && positiveHabits.every((h) => {
    const cis = checkInsMap[h.id] ?? []
    return cis.some((c) => c.date === today && c.completed)
  })

  if (loading) {
    return (
      <div className="px-5 pt-4 safe-top">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-32 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="px-5 pb-24">
        {/* Install banner */}
        {canInstall && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={promptInstall}
            className="w-full mb-4 py-3 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <Download size={18} className="text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">
              Instalar app en tu dispositivo
            </span>
          </motion.button>
        )}

        {/* Empty state */}
        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <SproutIllustration size={72} className="mb-2 inline-block" />
            <h3 className="text-lg font-bold text-white font-display mb-2">
              Empezá tu viaje
            </h3>
            <p className="text-sm text-slate-400 max-w-[260px] mx-auto mb-6">
              Creá tu primer hábito y comenzá a construir la mejor versión de vos.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
              }}
            >
              Crear hábito
            </motion.button>
          </motion.div>
        )}

        {/* Positive habits */}
        {positiveHabits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Hoy
            </h3>
            <div className="space-y-2.5">
              {positiveHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  checkIns={checkInsMap[habit.id] ?? []}
                  relapses={[]}
                  onToggleCheckIn={onToggleCheckIn}
                  onTap={setSelectedHabit}
                />
              ))}
            </div>
          </div>
        )}

        {/* Abstinence habits */}
        {abstinenceHabits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Rachas activas
            </h3>
            <div className="space-y-2.5">
              {abstinenceHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  checkIns={[]}
                  relapses={relapsesMap[habit.id] ?? []}
                  onToggleCheckIn={onToggleCheckIn}
                  onTap={setSelectedHabit}
                />
              ))}
            </div>
          </div>
        )}

        {/* All done celebration */}
        {allPositivesDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <CelebrationIllustration size={56} className="mb-1 inline-block" />
            <p className="text-lg font-bold font-display text-gradient mb-1">
              ¡Día completo!
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              <p className="text-sm text-slate-400">
                Completaste todos los hábitos de hoy
              </p>
            </div>
          </motion.div>
        )}

        {/* FAB */}
        {habits.length > 0 && (
          <motion.button
            onClick={() => setShowForm(true)}
            whileTap={{ scale: 0.9 }}
            className="fixed right-5 bottom-24 w-14 h-14 rounded-full text-white flex items-center justify-center z-40"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 24px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Plus size={24} />
          </motion.button>
        )}
      </div>

      {/* Habit Detail overlay */}
      <AnimatePresence>
        {selectedHabit && (
          <HabitDetail
            habit={selectedHabit}
            checkIns={checkInsMap[selectedHabit.id] ?? []}
            relapses={relapsesMap[selectedHabit.id] ?? []}
            onBack={() => {
              setSelectedHabit(null)
              onRefresh()
            }}
            onRegisterRelapse={async (habit, note) => {
              await onRegisterRelapse(habit, note)
              onRefresh()
            }}
          />
        )}
      </AnimatePresence>

      {/* New Habit Form overlay */}
      <AnimatePresence>
        {showForm && (
          <HabitForm
            onSave={async (data) => {
              await onCreateHabit(data)
            }}
            onBack={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
