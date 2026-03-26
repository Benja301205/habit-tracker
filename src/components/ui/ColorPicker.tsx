import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const COLORS = [
  '#10B981', // emerald
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EF4444', // red
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#84CC16', // lime
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {COLORS.map((color) => {
        const isSelected = value === color
        return (
          <motion.button
            key={color}
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange(color)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center transition-shadow"
            style={{
              backgroundColor: color,
              boxShadow: isSelected ? `0 0 16px ${color}50` : 'none',
            }}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Check size={18} className="text-white drop-shadow-md" strokeWidth={3} />
              </motion.div>
            )}
            {isSelected && (
              <motion.div
                layoutId="color-ring"
                className="absolute -inset-1 rounded-full border-2 border-white/60"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
