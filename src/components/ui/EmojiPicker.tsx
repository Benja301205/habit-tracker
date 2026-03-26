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
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl"
      >
        {value}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 left-0 z-50 glass border border-slate-700/50 rounded-2xl p-3 grid grid-cols-6 gap-2 w-[280px]"
          >
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onChange(emoji)
                  setOpen(false)
                }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-slate-700/50 ${
                  value === emoji ? 'bg-slate-700' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
