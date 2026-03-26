import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COMMON_EMOJIS = [
  '🏃', '📖', '🧘', '💪', '🚫', '🍷', '🏋️', '🎯',
  '💧', '🥗', '😴', '✍️', '🎸', '🧹', '💊', '🚶',
  '🧠', '🎨', '📝', '🏊', '🚴', '🤸', '🧘‍♂️', '✅',
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl glass-card border border-slate-700/30 flex items-center justify-center text-2xl active:bg-slate-700/30 transition-colors"
      >
        {value}
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute top-16 left-0 z-50 glass-elevated border border-slate-700/30 rounded-2xl p-3 grid grid-cols-6 gap-1.5 w-[280px] shadow-xl"
            >
              {COMMON_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    onChange(emoji)
                    setOpen(false)
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
                    value === emoji
                      ? 'bg-indigo-500/20 ring-1 ring-indigo-500/40'
                      : 'active:bg-slate-700/50'
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
