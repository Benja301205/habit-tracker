import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Habit, CheckIn, Relapse } from '../../types'
import { calculateAbstinenceStreak } from '../../lib/streak-calculator'
import CheckInButton from './CheckInButton'
import StreakBadge from './StreakBadge'
import { getTodayArgentina, getWeekStart } from '../../lib/streak-calculator'
import { StreakFlame } from '../ui/Illustrations'

interface HabitCardProps {
  habit: Habit
  checkIns: CheckIn[]
  relapses: Relapse[]
  onToggleCheckIn: (habitId: string) => Promise<void>
  onTap: (habit: Habit) => void
}

function MiniProgressRing({ progress, color, size = 28 }: { progress: number; color: string; size?: number }) {
  const r = (size - 4) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(progress, 1) * circumference)

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={3} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  )
}

export default memo(function HabitCard({
  habit,
  checkIns,
  relapses,
  onToggleCheckIn,
  onTap,
}: HabitCardProps) {
  const today = useMemo(() => getTodayArgentina(), [])
  const weekStart = useMemo(() => getWeekStart(), [])

  const isTodayChecked = useMemo(
    () => checkIns.some((c) => c.date === today && c.completed),
    [checkIns, today]
  )
  const weeklyCount = useMemo(
    () => checkIns.filter((c) => c.date >= weekStart && c.completed).length,
    [checkIns, weekStart]
  )
  const currentStreak = useMemo(
    () => calculateAbstinenceStreak(habit, relapses),
    [habit, relapses]
  )

  const goal = habit.weekly_goal ?? 7

  if (habit.type === 'positive') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card rounded-2xl p-4 border border-slate-700/20 overflow-hidden relative"
        onClick={() => onTap(habit)}
        style={{ borderLeftWidth: 3, borderLeftColor: habit.color }}
      >
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <CheckInButton
              checked={isTodayChecked}
              color={habit.color}
              onToggle={async () => {
                await onToggleCheckIn(habit.id)
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: `${habit.color}15` }}
              >
                {habit.emoji}
              </div>
              <span
                className={`font-semibold text-sm ${
                  isTodayChecked ? 'line-through text-slate-500' : 'text-white'
                }`}
              >
                {habit.name}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 ml-10">
              <div className="flex items-center gap-1.5">
                <MiniProgressRing progress={weeklyCount / goal} color={habit.color} />
                <span className="text-xs text-slate-400">
                  {weeklyCount}/{goal}
                </span>
              </div>
              {habit.current_streak > 0 && (
                <StreakBadge count={habit.current_streak} unit="weeks" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Abstinence habit
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card rounded-2xl p-4 border border-slate-700/20 cursor-pointer overflow-hidden relative"
      onClick={() => onTap(habit)}
      style={{ borderLeftWidth: 3, borderLeftColor: habit.color }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: `${habit.color}15` }}
        >
          {habit.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-white">{habit.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center gap-1 text-lg font-bold font-display text-gradient-amber animate-pulse-glow">
              <StreakFlame size={18} /> {currentStreak}
            </span>
            <span className="text-xs text-slate-400">
              {currentStreak === 1 ? 'día' : 'días'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
})
