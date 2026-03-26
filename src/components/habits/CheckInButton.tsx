import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

interface CheckInButtonProps {
  checked: boolean
  color: string
  onToggle: () => Promise<void>
}

function ConfettiParticle({ color, angle, delay }: { color: string; angle: number; delay: number }) {
  const rad = (angle * Math.PI) / 180
  const distance = 20 + Math.random() * 12
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: color, top: '50%', left: '50%' }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        scale: 0,
        opacity: 0,
      }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    />
  )
}

export default function CheckInButton({ checked, color, onToggle }: CheckInButtonProps) {
  const [animating, setAnimating] = useState(false)

  const handleClick = async () => {
    setAnimating(true)
    await onToggle()
    setTimeout(() => setAnimating(false), 600)
  }

  return (
    <button
      onClick={handleClick}
      className="relative w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200"
      style={{
        borderColor: checked ? color : 'rgba(148, 163, 184, 0.3)',
        backgroundColor: checked ? color : 'transparent',
        boxShadow: checked ? `0 0 14px ${color}40` : 'none',
      }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={animating ? { scale: 0, rotate: -45 } : { scale: 1, rotate: 0 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check size={20} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple */}
      {animating && checked && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: color }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Confetti particles */}
      {animating && checked && (
        <>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <ConfettiParticle
              key={angle}
              color={i % 2 === 0 ? color : '#fbbf24'}
              angle={angle + Math.random() * 20}
              delay={0.05 * i}
            />
          ))}
        </>
      )}
    </button>
  )
}
