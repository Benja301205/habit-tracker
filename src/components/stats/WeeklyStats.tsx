import { memo } from 'react'
import { motion } from 'framer-motion'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Habit, CheckIn, Relapse } from '../../types'
import { calculateAbstinenceStreak } from '../../lib/streak-calculator'

interface WeeklyStatsProps {
  habits: Habit[]
  checkInsMap: Record<string, CheckIn[]>
  relapsesMap: Record<string, Relapse[]>
}

export default memo(function WeeklyStats({
  habits,
  checkInsMap,
  relapsesMap,
}: WeeklyStatsProps) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const positiveHabits = habits.filter((h) => h.type === 'positive')
  const abstinenceHabits = habits.filter((h) => h.type === 'abstinence')

  return (
    <div className="space-y-4">
      {/* Positive habits stats */}
      {positiveHabits.map((habit) => {
        const checkIns = checkInsMap[habit.id] ?? []
        const checkedDates = new Set(
          checkIns.filter((c) => c.completed).map((c) => c.date)
        )
        const weeklyCount = weekDays.filter((d) =>
          checkedDates.has(format(d, 'yyyy-MM-dd'))
        ).length
        const goal = habit.weekly_goal ?? 7
        const pct = Math.min(Math.round((weeklyCount / goal) * 100), 100)

        return (
          <div
            key={habit.id}
            className="glass-card rounded-2xl p-4 border border-slate-700/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{habit.emoji}</span>
              <span className="text-sm font-medium text-white">
                {habit.name}
              </span>
              <span className="text-xs text-slate-500 ml-auto">
                {weeklyCount}/{goal}
              </span>
            </div>
            <div className="h-2.5 bg-slate-800/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: habit.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {/* Week day dots */}
            <div className="flex justify-between mt-3">
              {weekDays.map((d) => {
                const dateStr = format(d, 'yyyy-MM-dd')
                const checked = checkedDates.has(dateStr)
                const isToday =
                  format(d, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-600">
                      {format(d, 'EEEEE', { locale: es }).toUpperCase()}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        checked
                          ? 'text-white'
                          : isToday
                          ? 'border border-slate-600 text-slate-500'
                          : 'text-slate-700'
                      }`}
                      style={
                        checked
                          ? { backgroundColor: habit.color }
                          : undefined
                      }
                    >
                      {format(d, 'd')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Abstinence habits stats */}
      {abstinenceHabits.map((habit) => {
        const relapses = relapsesMap[habit.id] ?? []
        const currentStreak = calculateAbstinenceStreak(habit, relapses)
        const bestStreak = Math.max(habit.best_streak, currentStreak)

        const avgDaysBetween =
          relapses.length >= 2
            ? Math.round(
                relapses.reduce((sum, r, i) => {
                  if (i === 0) return 0
                  const prev = new Date(relapses[i - 1].date).getTime()
                  const curr = new Date(r.date).getTime()
                  return sum + Math.abs(prev - curr) / (1000 * 60 * 60 * 24)
                }, 0) /
                  (relapses.length - 1)
              )
            : null

        return (
          <div
            key={habit.id}
            className="glass-card rounded-2xl p-4 border border-slate-700/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{habit.emoji}</span>
              <span className="text-sm font-medium text-white">
                {habit.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold font-display text-gradient-amber">
                  {currentStreak}
                </p>
                <p className="text-[10px] text-slate-500">Racha actual</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-display">
                  {bestStreak}
                </p>
                <p className="text-[10px] text-slate-500">Mejor racha</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-400 font-display">
                  {avgDaysBetween ?? '—'}
                </p>
                <p className="text-[10px] text-slate-500">Promedio días</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
})
