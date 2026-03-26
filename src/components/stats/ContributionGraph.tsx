import { memo, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  subMonths,
  isSameDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { CheckIn, Relapse, HabitType } from '../../types'

interface ContributionGraphProps {
  type: HabitType
  checkIns: CheckIn[]
  relapses: Relapse[]
  color: string
  startDate: string
  monthOffset?: number
}

export default memo(function ContributionGraph({
  type,
  checkIns,
  relapses,
  color,
  startDate,
  monthOffset = 0,
}: ContributionGraphProps) {
  const targetMonth = subMonths(new Date(), monthOffset)
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(targetMonth),
        end: endOfMonth(targetMonth),
      }),
    [targetMonth.getMonth(), targetMonth.getFullYear()]
  )

  const monthLabel = format(targetMonth, 'MMMM yyyy', { locale: es })

  const relapseSet = useMemo(() => {
    const set = new Set<string>()
    relapses.forEach((r) => set.add(r.date))
    return set
  }, [relapses])

  const checkInSet = useMemo(() => {
    const set = new Set<string>()
    checkIns.filter((c) => c.completed).forEach((c) => set.add(c.date))
    return set
  }, [checkIns])

  const startDow = getDay(days[0])
  const offset = startDow === 0 ? 6 : startDow - 1

  const today = new Date()

  // Count stats for the month
  const completedDays = useMemo(() => {
    return days.filter((day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      if (type === 'positive') return checkInSet.has(dateStr)
      return !relapseSet.has(dateStr) && day <= today
    }).length
  }, [days, type, checkInSet, relapseSet, today])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-400 capitalize">
          {monthLabel}
        </p>
        <span className="text-xs text-slate-500">
          {completedDays} {type === 'positive' ? 'completados' : 'días limpios'}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-[5px]">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div
            key={d}
            className="text-[10px] text-slate-600 text-center font-medium pb-1"
          >
            {d}
          </div>
        ))}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = isSameDay(day, today)
          const habitStart = new Date(startDate)

          let cellStyle: React.CSSProperties = {}
          let cellClass = 'aspect-square rounded-[5px] contrib-cell'

          if (day < habitStart) {
            cellClass += ' bg-slate-900/20'
          } else if (type === 'positive') {
            if (checkInSet.has(dateStr)) {
              cellStyle = {
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}30`,
              }
            } else {
              cellClass += ' bg-slate-800/40'
            }
          } else {
            if (relapseSet.has(dateStr)) {
              cellStyle = {
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.2)',
              }
            } else if (day <= today) {
              cellStyle = {
                backgroundColor: `${color}80`,
                boxShadow: `0 0 4px ${color}20`,
              }
            } else {
              cellClass += ' bg-slate-800/40'
            }
          }

          if (isToday) {
            cellClass += ' ring-[1.5px] ring-white/50 ring-offset-1 ring-offset-slate-950'
          }

          return (
            <div
              key={dateStr}
              className={cellClass}
              style={cellStyle}
            />
          )
        })}
      </div>
    </div>
  )
})
