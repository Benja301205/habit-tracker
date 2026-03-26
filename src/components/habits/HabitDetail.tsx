import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { FlameIcon } from '../ui/Illustrations'
import type { Habit, CheckIn, Relapse } from '../../types'
import { calculateAbstinenceStreak } from '../../lib/streak-calculator'
import ContributionGraph from '../stats/ContributionGraph'
import StreakBadge from './StreakBadge'
import RelapseModal from './RelapseModal'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface HabitDetailProps {
  habit: Habit
  checkIns: CheckIn[]
  relapses: Relapse[]
  onBack: () => void
  onRegisterRelapse: (habit: Habit, note: string | null) => Promise<void>
}

export default function HabitDetail({
  habit,
  checkIns,
  relapses,
  onBack,
  onRegisterRelapse,
}: HabitDetailProps) {
  const [relapseModalOpen, setRelapseModalOpen] = useState(false)
  const [monthOffset, setMonthOffset] = useState(0)

  const isAbstinence = habit.type === 'abstinence'
  const currentStreak = useMemo(
    () => isAbstinence ? calculateAbstinenceStreak(habit, relapses) : habit.current_streak,
    [isAbstinence, habit, relapses]
  )

  const completionPercent = useMemo(() => {
    if (habit.type !== 'positive') return null
    const now = new Date()
    const nowMonth = now.getMonth()
    const nowYear = now.getFullYear()

    const completed = checkIns.filter((c) => {
      const d = parseISO(c.date)
      return d.getMonth() === nowMonth && d.getFullYear() === nowYear && c.completed
    }).length

    const days = new Date(nowYear, nowMonth + 1, 0).getDate()
    return Math.round((completed / days) * 100)
  }, [checkIns, habit.type])

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto"
    >
      {/* Hero gradient header */}
      <div
        className="absolute inset-x-0 top-0 h-48 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${habit.color}40 0%, transparent 70%)`,
        }}
      />

      <div className="relative safe-top px-5 pt-4 pb-32">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 mb-6 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Volver</span>
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {habit.emoji}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">{habit.name}</h2>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium inline-block mt-1"
              style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
            >
              {habit.type === 'positive' ? 'Positivo' : 'Abstinencia'}
            </span>
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-2xl p-4 border border-slate-700/20 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <FlameIcon size={16} />
              <p className="text-xs text-slate-500">Racha actual</p>
            </div>
            <StreakBadge
              count={currentStreak}
              unit={habit.streak_unit}
              size="lg"
            />
          </div>
          <div className="glass-card rounded-2xl p-4 border border-slate-700/20 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Trophy size={14} className="text-indigo-400" />
              <p className="text-xs text-slate-500">Mejor racha</p>
            </div>
            <StreakBadge
              count={Math.max(habit.best_streak, currentStreak)}
              unit={habit.streak_unit}
              size="lg"
            />
          </div>
        </div>

        {/* Completion percent for positive */}
        {completionPercent !== null && (
          <div className="glass-card rounded-2xl p-4 border border-slate-700/20 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">
                Cumplimiento este mes
              </p>
              <span className="text-sm font-bold text-white font-display">
                {completionPercent}%
              </span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${habit.color}, ${habit.color}cc)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Contribution Graph with month navigation */}
        <div className="glass-card rounded-2xl p-4 border border-slate-700/20 mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setMonthOffset((prev) => prev + 1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg active:bg-slate-800 transition-colors disabled:opacity-30"
              disabled={monthOffset === 0}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <ContributionGraph
            type={habit.type}
            checkIns={checkIns}
            relapses={relapses}
            color={habit.color}
            startDate={habit.start_date}
            monthOffset={monthOffset}
          />
        </div>

        {/* Relapse button & history for abstinence */}
        {isAbstinence && (
          <>
            <button
              onClick={() => setRelapseModalOpen(true)}
              className="w-full py-3.5 rounded-2xl glass-card border border-red-500/10 text-slate-400 font-medium text-sm flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform"
            >
              <AlertTriangle size={16} className="text-red-400" />
              Tuve una recaída
            </button>

            {relapses.length > 0 && (
              <div className="glass-card rounded-2xl p-4 border border-slate-700/20">
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">
                  Historial de recaídas
                </p>
                <div className="space-y-3">
                  {relapses.slice(0, 10).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-slate-300">
                          {format(parseISO(r.date), "d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          Racha de {r.streak_at_relapse} días
                        </p>
                        {r.note && (
                          <p className="text-xs text-slate-400 mt-0.5 italic">
                            "{r.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <RelapseModal
        open={relapseModalOpen}
        habit={habit}
        currentStreak={currentStreak}
        onConfirm={async (note) => {
          await onRegisterRelapse(habit, note)
        }}
        onClose={() => setRelapseModalOpen(false)}
      />
    </motion.div>
  )
}
