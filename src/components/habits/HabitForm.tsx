import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Archive, Zap, ShieldOff } from 'lucide-react'
import type { Habit, HabitType } from '../../types'
import EmojiPicker from '../ui/EmojiPicker'
import ColorPicker from '../ui/ColorPicker'
import ConfirmModal from '../ui/ConfirmModal'
import { getTodayArgentina } from '../../lib/streak-calculator'

interface HabitFormProps {
  habit?: Habit | null
  onSave: (data: Partial<Habit>) => Promise<void>
  onArchive?: () => Promise<void>
  onDelete?: () => Promise<void>
  onBack: () => void
}

const DAYS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 7, label: 'D' },
]

export default function HabitForm({
  habit,
  onSave,
  onArchive,
  onDelete,
  onBack,
}: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? '✅')
  const [color, setColor] = useState(habit?.color ?? '#6366F1')
  const [type, setType] = useState<HabitType>(habit?.type ?? 'positive')
  const [weeklyGoal, setWeeklyGoal] = useState(habit?.weekly_goal ?? 3)
  const [reminderDays, setReminderDays] = useState<number[]>(
    habit?.reminder_days ?? []
  )
  const [reminderTime, setReminderTime] = useState(
    habit?.reminder_time ?? '09:00'
  )
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditing = !!habit

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      name: name.trim(),
      emoji,
      color,
      type,
      weekly_goal: type === 'positive' ? weeklyGoal : null,
      streak_unit: type === 'positive' ? 'weeks' : 'days',
      reminder_days: reminderDays.length > 0 ? reminderDays : null,
      reminder_time: reminderDays.length > 0 ? reminderTime : null,
      ...(isEditing ? {} : { start_date: getTodayArgentina() }),
    })
    setSaving(false)
    onBack()
  }

  const toggleDay = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto"
    >
      {/* Hero gradient */}
      <div
        className="absolute inset-x-0 top-0 h-48 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${color}50 0%, transparent 70%)`,
        }}
      />

      <div className="relative safe-top px-5 pt-4 pb-32">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 mb-6 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Volver</span>
        </button>

        <h2 className="text-xl font-bold text-white mb-6 font-display">
          {isEditing ? 'Editar hábito' : 'Nuevo hábito'}
        </h2>

        {/* Emoji + Name */}
        <div className="flex items-start gap-3 mb-6">
          <EmojiPicker value={emoji} onChange={setEmoji} />
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1.5 block font-medium">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ejercicio, Meditación..."
              className="w-full p-3.5 rounded-2xl glass-card border border-slate-700/30 text-white text-sm placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="text-xs text-slate-500 mb-2.5 block font-medium">
            Color
          </label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* Type */}
        <div className="mb-6">
          <label className="text-xs text-slate-500 mb-2.5 block font-medium">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setType('positive')}
              className={`py-3.5 rounded-2xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                type === 'positive'
                  ? 'border-indigo-500/50 bg-indigo-500/15 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'border-slate-700/30 glass-card text-slate-400'
              }`}
            >
              <Zap size={16} className={type === 'positive' ? 'text-indigo-400' : ''} />
              Quiero hacerlo
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setType('abstinence')}
              className={`py-3.5 rounded-2xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                type === 'abstinence'
                  ? 'border-red-500/50 bg-red-500/15 text-white shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'border-slate-700/30 glass-card text-slate-400'
              }`}
            >
              <ShieldOff size={16} className={type === 'abstinence' ? 'text-red-400' : ''} />
              Quiero dejarlo
            </motion.button>
          </div>
        </div>

        {/* Weekly goal (positive only) */}
        {type === 'positive' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <label className="text-xs text-slate-500 mb-2.5 block font-medium">
              Meta semanal
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setWeeklyGoal(n)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    weeklyGoal === n
                      ? 'text-white shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'glass-card text-slate-400 border border-slate-700/30'
                  }`}
                  style={
                    weeklyGoal === n
                      ? {
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        }
                      : undefined
                  }
                >
                  {n}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {weeklyGoal} {weeklyGoal === 1 ? 'vez' : 'veces'} por semana
            </p>
          </motion.div>
        )}

        {/* Reminders */}
        <div className="mb-8">
          <label className="text-xs text-slate-500 mb-2.5 block font-medium">
            Recordatorios
          </label>
          <div className="flex gap-2 mb-3">
            {DAYS.map((day) => (
              <motion.button
                key={day.value}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleDay(day.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  reminderDays.includes(day.value)
                    ? 'text-white'
                    : 'glass-card text-slate-400 border border-slate-700/30'
                }`}
                style={
                  reminderDays.includes(day.value)
                    ? {
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      }
                    : undefined
                }
              >
                {day.label}
              </motion.button>
            ))}
          </div>
          {reminderDays.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                Hora
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="p-3.5 rounded-2xl glass-card border border-slate-700/30 text-white text-sm outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </motion.div>
          )}
        </div>

        {/* Save */}
        <motion.button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-semibold text-sm text-white disabled:opacity-50 mb-4 transition-all"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear hábito'}
        </motion.button>

        {/* Archive / Delete */}
        {isEditing && (
          <div className="flex gap-3">
            {onArchive && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onArchive}
                className="flex-1 py-3.5 rounded-2xl glass-card border border-slate-700/20 text-slate-400 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Archive size={16} />
                Archivar
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-3.5 rounded-2xl glass-card border border-red-500/20 text-red-400 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Trash2 size={16} />
                Eliminar
              </motion.button>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Eliminar hábito"
        message={`¿Estás seguro de que querés eliminar "${habit?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (onDelete) await onDelete()
          setShowDeleteConfirm(false)
          onBack()
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        danger
      />
    </motion.div>
  )
}
