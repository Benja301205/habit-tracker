import { motion } from 'framer-motion'
import { getFormattedDate } from '../../lib/streak-calculator'

const FRASES = [
  'Cada día cuenta.',
  'Un paso a la vez.',
  'La constancia es la clave.',
  'Hoy es un buen día para avanzar.',
  'Pequeñas acciones, grandes resultados.',
  'No rompas la cadena.',
  'El progreso, no la perfección.',
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Header() {
  const fecha = getFormattedDate()
  const frase = FRASES[new Date().getDay() % FRASES.length]
  const greeting = getGreeting()

  return (
    <header className="px-5 pt-4 pb-3 safe-top">
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-medium text-indigo-400 tracking-wide mb-0.5"
      >
        {greeting}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-2xl font-bold text-white capitalize"
      >
        {fecha}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-slate-500 mt-1 italic"
      >
        {frase}
      </motion.p>
    </header>
  )
}
