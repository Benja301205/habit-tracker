import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Habit, CheckIn, Relapse } from '../types'
import WeeklyStats from '../components/stats/WeeklyStats'
import MonthlyStats from '../components/stats/MonthlyStats'
import InsightsPanel from '../components/stats/InsightsPanel'

type StatsView = 'weekly' | 'monthly' | 'insights'

const viewLabels: Record<StatsView, string> = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  insights: 'Insights',
}

interface StatsProps {
  habits: Habit[]
  checkInsMap: Record<string, CheckIn[]>
  relapsesMap: Record<string, Relapse[]>
  loading: boolean
}

export default function Stats({
  habits,
  checkInsMap,
  relapsesMap,
  loading,
}: StatsProps) {
  const [view, setView] = useState<StatsView>('weekly')

  if (loading) {
    return (
      <div className="px-5 pt-4 safe-top">
        <div className="skeleton h-8 w-32 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-4 pb-24 safe-top">
      <h2 className="text-2xl font-bold text-white mb-4 font-display">
        Estadísticas
      </h2>

      {/* Toggle */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-6">
        {(['weekly', 'monthly', 'insights'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium relative ${
              view === v ? 'text-white' : 'text-slate-500'
            }`}
          >
            {view === v && (
              <motion.div
                layoutId="stats-toggle"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {viewLabels[v]}
            </span>
          </button>
        ))}
      </div>

      {view === 'weekly' && (
        <WeeklyStats
          habits={habits}
          checkInsMap={checkInsMap}
          relapsesMap={relapsesMap}
        />
      )}
      {view === 'monthly' && (
        <MonthlyStats
          habits={habits}
          checkInsMap={checkInsMap}
          relapsesMap={relapsesMap}
        />
      )}
      {view === 'insights' && (
        <InsightsPanel
          habits={habits}
          checkInsMap={checkInsMap}
          relapsesMap={relapsesMap}
        />
      )}
    </div>
  )
}
