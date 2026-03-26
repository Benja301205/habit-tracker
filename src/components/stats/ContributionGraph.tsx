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

  return (
    <div>
      <p className="text-sm font-medium text-slate-400 mb-3 capitalize">
        {monthLabel}
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div
            key={d}
            className="text-[10px] text-slate-600 text-center font-medium"
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

          let bg = 'bg-slate-800/50'

          if (day < habitStart) {
            bg = 'bg-slate-900/30'
          } else if (type === 'positive') {
            if (checkInSet.has(dateStr)) {
              bg = ''
            }
          } else {
            if (relapseSet.has(dateStr)) {
              bg = 'bg-red-500/60'
            } else if (day <= today) {
              bg = ''
            }
          }

          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-md ${bg} ${
                isToday ? 'ring-1 ring-white/40' : ''
              }`}
              style={
                bg === ''
                  ? { backgroundColor: `${color}66` }
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
})
