import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Habit } from '../../types'

interface RelapseModalProps {
  open: boolean
  habit: Habit | null
  currentStreak: number
  onConfirm: (note: string | null) => Promise<void>
  onClose: () => void
}

export default function RelapseModal({
  open,
  habit,
  currentStreak,
  onConfirm,
  onClose,
}: RelapseModalProps) {
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleConfirm = async (withNote: boolean) => {
    setSaving(true)
    await onConfirm(withNote && note.trim() ? note.trim() : null)
    setSaving(false)
    setConfirmed(true)
  }

  const handleClose = () => {
    setNote('')
    setConfirmed(false)
    onClose()
  }

  if (!habit) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            className="relative w-full max-w-lg mx-4 mb-8 rounded-2xl glass-card border border-slate-700/30 p-6 shadow-xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {!confirmed ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Registrar recaída
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  ¿Querés agregar una nota?
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Opcional: ¿qué pasó?"
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 resize-none h-24 mb-4 outline-none focus:border-slate-600"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(false)}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-slate-700/50 text-slate-300 font-medium text-sm"
                  >
                    Solo registrar
                  </button>
                  <button
                    onClick={() => handleConfirm(true)}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-indigo-500/80 text-white font-medium text-sm"
                  >
                    Guardar con nota
                  </button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <p className="text-2xl mb-3">💙</p>
                <p className="text-white font-medium mb-1">
                  Llevabas {currentStreak} {currentStreak === 1 ? 'día' : 'días'}.
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  Cada día es un nuevo comienzo.
                </p>
                <button
                  onClick={handleClose}
                  className="py-3 px-8 rounded-xl bg-slate-700/50 text-white font-medium text-sm"
                >
                  Cerrar
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
