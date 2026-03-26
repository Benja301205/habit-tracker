import { motion } from 'framer-motion'

interface StreakBadgeProps {
  count: number
  unit: 'weeks' | 'days'
  size?: 'sm' | 'lg'
}

export default function StreakBadge({ count, unit, size = 'sm' }: StreakBadgeProps) {
  const unitLabel = unit === 'weeks'
    ? count === 1 ? 'semana' : 'semanas'
    : count === 1 ? 'día' : 'días'

  if (size === 'lg') {
    return (
      <div className="text-center">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-extrabold font-display text-gradient-amber"
        >
          {count}
        </motion.div>
        <p className="text-slate-400 text-sm mt-1">{unitLabel}</p>
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300 animate-pulse-glow">
      🔥 {count} {unitLabel}
    </span>
  )
}
