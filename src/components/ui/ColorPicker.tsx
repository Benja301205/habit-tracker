import { motion } from 'framer-motion'

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
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className="relative w-10 h-10 rounded-full"
          style={{ backgroundColor: color }}
        >
          {value === color && (
            <motion.div
              layoutId="color-selected"
              className="absolute inset-0 rounded-full border-2 border-white"
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
