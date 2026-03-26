import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from 'date-fns'
import type { Habit, CheckIn, Relapse } from '../../types'
import { calculateAbstinenceStreak } from '../../lib/streak-calculator'

interface MonthlyStatsProps {
  habits: Habit[]
  checkInsMap: Record<string, CheckIn[]>
  relapsesMap: Record<string, Relapse[]>
}

export default memo(function MonthlyStats({
  habits,
  checkInsMap,
  relapsesMap,
}: MonthlyStatsProps) {
  const now = new Date()
  const monthDays = eachDayOfInterval({
    start: startOfMonth(now),
    end: endOfMonth(now),
  })
  const daysPassed = now.getDate()

  const positiveHabits = habits.filter((h) => h.type === 'positive')
  const abstinenceHabits = habits.filter((h) => h.type === 'abstinence')

  // General stats
  const overallStats = useMemo(() => {
    let bestHabit = ''
    let bestPct = 0
    const dayOfWeekFails: Record<number, number> = {}

    for (const habit of positiveHabits) {
      const checkIns = checkInsMap[habit.id] ?? []
      const checkedDates = new Set(
        checkIns.filter((c) => c.completed).map((c) => c.date)
      )
      const monthlyCount = monthDays.filter((d) =>
        checkedDates.has(format(d, 'yyyy-MM-dd'))
      ).length
      const pct = daysPassed > 0 ? (monthlyCount / daysPassed) * 100 : 0
      if (pct > bestPct) {
        bestPct = pct
        bestHabit = `${habit.emoji} ${habit.name}`
      }

      // Count failed days by day of week
      for (const day of monthDays) {
        if (day > now) break
        const dateStr = format(day, 'yyyy-MM-dd')
        if (!checkedDates.has(dateStr)) {
          const dow = day.getDay()
          dayOfWeekFails[dow] = (dayOfWeekFails[dow] || 0) + 1
        }
      }
    }

    // Also count relapses by day of week
    for (const habit of abstinenceHabits) {
      const relapses = relapsesMap[habit.id] ?? []
      for (const r of relapses) {
        const dow = new Date(r.date).getDay()
        dayOfWeekFails[dow] = (dayOfWeekFails[dow] || 0) + 1
      }
    }

    let hardestDay = ''
    let maxFails = 0
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    for (const [dow, count] of Object.entries(dayOfWeekFails)) {
      if (count > maxFails) {
        maxFails = count
        hardestDay = dayNames[Number(dow)]
      }
    }

    return { bestHabit, bestPct: Math.round(bestPct), hardestDay }
  }, [positiveHabits, abstinenceHabits, checkInsMap, relapsesMap])

  return (
    <div className="space-y-4">
      {/* Per-habit monthly stats */}
      {positiveHabits.map((habit) => {
        const checkIns = checkInsMap[habit.id] ?? []
        const checkedDates = new Set(
          checkIns.filter((c) => c.completed).map((c) => c.date)
        )
        const monthlyCount = monthDays.filter((d) =>
          checkedDates.has(format(d, 'yyyy-MM-dd'))
        ).length
        const pct =
          daysPassed > 0 ? Math.round((monthlyCount / daysPassed) * 100) : 0

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
                {monthlyCount} días
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-800/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: habit.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-bold text-white">{pct}%</span>
            </div>
          </div>
        )
      })}

      {abstinenceHabits.map((habit) => {
        const relapses = relapsesMap[habit.id] ?? []
        const currentStreak = calculateAbstinenceStreak(habit, relapses)
        const monthRelapses = relapses.filter((r) => {
          const d = new Date(r.date)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })

        // Calculate clean days this month
        const relapseDatesThisMonth = new Set(
          monthRelapses.map((r) => r.date)
        )
        const cleanDays = daysPassed - relapseDatesThisMonth.size
        const cleanPct = daysPassed > 0 ? Math.round((cleanDays / daysPassed) * 100) : 0

        // Best streak this month
        const bestStreakMonth = monthRelapses.length > 0
          ? Math.max(...monthRelapses.map((r) => r.streak_at_relapse), currentStreak)
          : currentStreak

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
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold font-display text-gradient-amber">
                  {currentStreak}
                </p>
                <p className="text-[10px] text-slate-500">Racha actual</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-display">
                  {bestStreakMonth}
                </p>
                <p className="text-[10px] text-slate-500">Mejor del mes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-400 font-display">
                  {monthRelapses.length}
                </p>
                <p className="text-[10px] text-slate-500">Recaídas</p>
              </div>
            </div>
            {/* Clean days progress bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500">
                  Días limpios: {cleanDays}/{daysPassed}
                </span>
                <span className="text-[10px] text-slate-500">{cleanPct}%</span>
              </div>
              <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${cleanPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        )
      })}

      {/* General overview */}
      {(overallStats.bestHabit || overallStats.hardestDay) && (
        <div className="glass-card rounded-2xl p-4 border border-slate-700/20">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Resumen general
          </h4>
          {overallStats.bestHabit && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Más consistente</span>
              <span className="text-sm text-white font-medium">
                {overallStats.bestHabit} ({overallStats.bestPct}%)
              </span>
            </div>
          )}
          {overallStats.hardestDay && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Día más difícil</span>
              <span className="text-sm text-white font-medium">
                {overallStats.hardestDay}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
