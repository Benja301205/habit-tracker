import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Habit, CheckIn } from '../../types'

interface WeeklyTrendProps {
  habit: Habit
  checkIns: CheckIn[]
}

export default memo(function WeeklyTrend({ habit, checkIns }: WeeklyTrendProps) {
  const weeks = useMemo(() => {
    const now = new Date()
    const checkedDates = new Set(
      checkIns.filter((c) => c.completed).map((c) => c.date)
    )
    const goal = habit.weekly_goal ?? 7

    return Array.from({ length: 8 }, (_, i) => {
      const weekOffset = 7 - i
      const weekStart = startOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

      const completed = days.filter((d) =>
        checkedDates.has(format(d, 'yyyy-MM-dd'))
      ).length

      const pct = Math.min(Math.round((completed / goal) * 100), 100)
      const label = format(weekStart, 'd/M', { locale: es })

      return { label, completed, goal, pct }
    })
  }, [checkIns, habit.weekly_goal])

  const maxPct = Math.max(...weeks.map((w) => w.pct), 1)

  // Trend: compare last 4 weeks avg vs previous 4 weeks avg
  const trend = useMemo(() => {
    const recent = weeks.slice(4).reduce((s, w) => s + w.pct, 0) / 4
    const earlier = weeks.slice(0, 4).reduce((s, w) => s + w.pct, 0) / 4
    const diff = recent - earlier
    if (diff > 10) return 'up'
    if (diff < -10) return 'down'
    return 'stable'
  }, [weeks])

  const trendLabel = trend === 'up' ? 'Mejorando' : trend === 'down' ? 'Bajando' : 'Estable'
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-700/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{habit.emoji}</span>
          <span className="text-sm font-medium text-white">{habit.name}</span>
        </div>
        <span className={`text-xs font-medium ${trendColor}`}>
          {trendIcon} {trendLabel}
        </span>
      </div>

      <div className="flex items-end gap-1.5 h-24">
        {weeks.map((week, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-t-md"
              style={{ backgroundColor: `${habit.color}${week.pct > 0 ? 'cc' : '33'}` }}
              initial={{ height: 0 }}
              animate={{ height: `${(week.pct / maxPct) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[8px] text-slate-600">{week.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
})
