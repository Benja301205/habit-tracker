import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Archive } from 'lucide-react'
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
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
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
      <div className="safe-top px-5 pt-4 pb-32">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Volver</span>
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {isEditing ? 'Editar hábito' : 'Nuevo hábito'}
        </h2>

        {/* Emoji + Name */}
        <div className="flex items-start gap-3 mb-6">
          <EmojiPicker value={emoji} onChange={setEmoji} />
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ejercicio, Meditación..."
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 outline-none focus:border-slate-600"
            />
          </div>
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="text-xs text-slate-500 mb-2 block">Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* Type */}
        <div className="mb-6">
          <label className="text-xs text-slate-500 mb-2 block">Tipo</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType('positive')}
              className={`py-3 rounded-xl text-sm font-medium border ${
                type === 'positive'
                  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              Quiero hacerlo
            </button>
            <button
              onClick={() => setType('abstinence')}
              className={`py-3 rounded-xl text-sm font-medium border ${
                type === 'abstinence'
                  ? 'border-red-500 bg-red-500/20 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              Quiero dejarlo
            </button>
          </div>
        </div>

        {/* Weekly goal (positive only) */}
        {type === 'positive' && (
          <div className="mb-6">
            <label className="text-xs text-slate-500 mb-2 block">
              Meta semanal
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setWeeklyGoal(n)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium ${
                    weeklyGoal === n
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {weeklyGoal} {weeklyGoal === 1 ? 'vez' : 'veces'} por semana
            </p>
          </div>
        )}

        {/* Reminders */}
        <div className="mb-6">
          <label className="text-xs text-slate-500 mb-2 block">
            Recordatorios
          </label>
          <div className="flex gap-2 mb-3">
            {DAYS.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium ${
                  reminderDays.includes(day.value)
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          {reminderDays.length > 0 && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Hora</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none"
              />
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full py-3.5 rounded-2xl bg-indigo-500 text-white font-semibold text-sm disabled:opacity-50 mb-4"
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear hábito'}
        </button>

        {/* Archive / Delete */}
        {isEditing && (
          <div className="flex gap-3">
            {onArchive && (
              <button
                onClick={onArchive}
                className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Archive size={16} />
                Archivar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-3 rounded-xl bg-slate-800 border border-red-500/30 text-red-400 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
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
