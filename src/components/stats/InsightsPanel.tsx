import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  differenceInDays,
  parseISO,
  getDay,
} from 'date-fns'
import type { Habit, CheckIn, Relapse } from '../../types'
import { calculateAbstinenceStreak } from '../../lib/streak-calculator'
import WeeklyTrend from './WeeklyTrend'

interface InsightsPanelProps {
  habits: Habit[]
  checkInsMap: Record<string, CheckIn[]>
  relapsesMap: Record<string, Relapse[]>
}

export default memo(function InsightsPanel({
  habits,
  checkInsMap,
  relapsesMap,
}: InsightsPanelProps) {
  const positiveHabits = habits.filter((h) => h.type === 'positive')
  const abstinenceHabits = habits.filter((h) => h.type === 'abstinence')

  const insights = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const dayCompletions: Record<number, { done: number; total: number }> = {}
    for (let i = 0; i < 7; i++) dayCompletions[i] = { done: 0, total: 0 }

    let totalCompleted = 0
    let totalPossible = 0
    let bestHabitName = ''
    let bestHabitPct = 0
    let bestHabitEmoji = ''

    for (const habit of positiveHabits) {
      const checkIns = checkInsMap[habit.id] ?? []
      const checkedDates = new Set(
        checkIns.filter((c) => c.completed).map((c) => c.date)
      )
      const daysSinceStart = differenceInDays(new Date(), parseISO(habit.start_date))
      const activeDays = Math.max(daysSinceStart, 1)

      totalCompleted += checkedDates.size
      totalPossible += activeDays

      const pct = (checkedDates.size / activeDays) * 100
      if (pct > bestHabitPct) {
        bestHabitPct = pct
        bestHabitName = habit.name
        bestHabitEmoji = habit.emoji
      }

      // Count by day of week
      for (const ci of checkIns) {
        if (!ci.completed) continue
        const dow = getDay(parseISO(ci.date))
        dayCompletions[dow].done++
      }
    }

    // Add total counts per day of week
    for (const habit of positiveHabits) {
      const checkIns = checkInsMap[habit.id] ?? []
      for (const ci of checkIns) {
        const dow = getDay(parseISO(ci.date))
        dayCompletions[dow].total++
      }
    }

    // Also count relapses as failures by day of week
    for (const habit of abstinenceHabits) {
      const relapses = relapsesMap[habit.id] ?? []
      for (const r of relapses) {
        const dow = getDay(parseISO(r.date))
        dayCompletions[dow].total++
      }
    }

    // Find best and worst days
    let bestDayIdx = 0
    let bestDayRate = 0
    let worstDayIdx = 0
    let worstDayRate = Infinity

    for (let i = 0; i < 7; i++) {
      const { done, total } = dayCompletions[i]
      const rate = total > 0 ? done / total : 0
      if (rate > bestDayRate) {
        bestDayRate = rate
        bestDayIdx = i
      }
      if (rate < worstDayRate && total > 0) {
        worstDayRate = rate
        worstDayIdx = i
      }
    }

    // Consistency score
    const consistencyScore = totalPossible > 0
      ? Math.round((totalCompleted / totalPossible) * 100)
      : 0

    // Abstinence stats
    let longestActiveStreak = 0
    let longestStreakHabit = ''
    let longestStreakEmoji = ''

    for (const habit of abstinenceHabits) {
      const relapses = relapsesMap[habit.id] ?? []
      const streak = calculateAbstinenceStreak(habit, relapses)
      if (streak > longestActiveStreak) {
        longestActiveStreak = streak
        longestStreakHabit = habit.name
        longestStreakEmoji = habit.emoji
      }
    }

    // Goal suggestions
    const goalSuggestions: { habit: Habit; suggestion: number }[] = []
    for (const habit of positiveHabits) {
      const checkIns = checkInsMap[habit.id] ?? []
      const goal = habit.weekly_goal ?? 7
      const recentWeeks = 4
      const daysSinceStart = differenceInDays(new Date(), parseISO(habit.start_date))
      const weeksActive = Math.floor(daysSinceStart / 7)

      if (weeksActive >= recentWeeks) {
        const recentCheckIns = checkIns.filter((c) => {
          const d = differenceInDays(new Date(), parseISO(c.date))
          return d < recentWeeks * 7 && c.completed
        }).length
        const avgPerWeek = recentCheckIns / recentWeeks

        if (avgPerWeek >= goal && goal < 7) {
          goalSuggestions.push({ habit, suggestion: Math.min(goal + 1, 7) })
        }
      }
    }

    return {
      consistencyScore,
      totalCompleted,
      bestDay: dayNames[bestDayIdx],
      bestDayRate: Math.round(bestDayRate * 100),
      worstDay: dayNames[worstDayIdx],
      worstDayRate: Math.round(worstDayRate * 100),
      bestHabitName,
      bestHabitPct: Math.round(bestHabitPct),
      bestHabitEmoji,
      longestActiveStreak,
      longestStreakHabit,
      longestStreakEmoji,
      goalSuggestions,
    }
  }, [positiveHabits, abstinenceHabits, checkInsMap, relapsesMap])

  return (
    <div className="space-y-4">
      {/* Consistency Score */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/30 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Puntuación de consistencia
        </p>
        <div className="relative w-24 h-24 mx-auto mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3"
            />
            <motion.circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={insights.consistencyScore >= 70 ? '#34d399' : insights.consistencyScore >= 40 ? '#fbbf24' : '#f87171'}
              strokeWidth="3"
              strokeDasharray="100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 100 - insights.consistencyScore }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white font-display">
              {insights.consistencyScore}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          {insights.totalCompleted} check-ins totales
        </p>
      </div>

      {/* Best & Worst Day */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-slate-700/30 text-center">
          <p className="text-xs text-slate-500 mb-1">Mejor día</p>
          <p className="text-lg font-bold text-emerald-400 font-display">
            {insights.bestDay}
          </p>
          <p className="text-[10px] text-slate-500">{insights.bestDayRate}% éxito</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-700/30 text-center">
          <p className="text-xs text-slate-500 mb-1">Día más difícil</p>
          <p className="text-lg font-bold text-amber-400 font-display">
            {insights.worstDay}
          </p>
          <p className="text-[10px] text-slate-500">{insights.worstDayRate}% éxito</p>
        </div>
      </div>

      {/* Best Habit & Longest Streak */}
      {(insights.bestHabitName || insights.longestStreakHabit) && (
        <div className="glass-card rounded-2xl p-4 border border-slate-700/30">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Destacados
          </h4>
          {insights.bestHabitName && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Más consistente</span>
              <span className="text-sm text-white font-medium">
                {insights.bestHabitEmoji} {insights.bestHabitName} ({insights.bestHabitPct}%)
              </span>
            </div>
          )}
          {insights.longestStreakHabit && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Mayor racha activa</span>
              <span className="text-sm text-white font-medium">
                {insights.longestStreakEmoji} {insights.longestActiveStreak} días
              </span>
            </div>
          )}
        </div>
      )}

      {/* Goal Suggestions */}
      {insights.goalSuggestions.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-indigo-500/5">
          <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
            Sugerencias
          </h4>
          {insights.goalSuggestions.map(({ habit, suggestion }) => (
            <div key={habit.id} className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">
              <span>{habit.emoji}</span>
              <span>
                Subir meta de {habit.name} a {suggestion}x/semana
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Trends per habit */}
      {positiveHabits.length > 0 && (
        <>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
            Tendencia semanal (8 semanas)
          </h4>
          {positiveHabits.map((habit) => (
            <WeeklyTrend
              key={habit.id}
              habit={habit}
              checkIns={checkInsMap[habit.id] ?? []}
            />
          ))}
        </>
      )}
    </div>
  )
})
