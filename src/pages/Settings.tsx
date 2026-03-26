import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, LogOut, Bell, BellOff } from 'lucide-react'
import type { Habit } from '../types'
import HabitForm from '../components/habits/HabitForm'
import { useAuth } from '../lib/auth-context'
import { usePushNotifications } from '../hooks/usePushNotifications'

interface SettingsProps {
  habits: Habit[]
  onUpdateHabit: (id: string, data: Partial<Habit>) => Promise<void>
  onArchiveHabit: (id: string) => Promise<void>
  onDeleteHabit: (id: string) => Promise<void>
  onRefresh: () => void
}

export default function Settings({
  habits,
  onUpdateHabit,
  onArchiveHabit,
  onDeleteHabit,
  onRefresh,
}: SettingsProps) {
  const { signOut } = useAuth()
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()
  const [pushLoading, setPushLoading] = useState(false)

  const handlePushToggle = async () => {
    setPushLoading(true)
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
    setPushLoading(false)
  }

  return (
    <div className="px-5 pt-4 pb-24 safe-top">
      <h2 className="text-2xl font-bold text-white mb-4 font-display">
        Configuración
      </h2>

      {/* Habits list */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Mis hábitos
        </h3>
        <div className="space-y-2">
          {habits.map((habit) => (
            <motion.button
              key={habit.id}
              layout
              onClick={() => setEditingHabit(habit)}
              className="w-full glass-card rounded-2xl p-4 border border-slate-700/20 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <span className="text-xl">{habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white block">
                  {habit.name}
                </span>
                <span className="text-xs text-slate-500">
                  {habit.type === 'positive'
                    ? `${habit.weekly_goal}x/semana`
                    : 'Abstinencia'}
                </span>
              </div>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              <ChevronRight size={16} className="text-slate-600" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Push notifications */}
      {isSupported && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Notificaciones
          </h3>
          <button
            onClick={handlePushToggle}
            disabled={pushLoading}
            className="w-full glass-card rounded-2xl p-4 border border-slate-700/20 flex items-center gap-3"
          >
            {isSubscribed ? (
              <Bell size={20} className="text-emerald-400" />
            ) : (
              <BellOff size={20} className="text-slate-500" />
            )}
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-white block">
                Recordatorios push
              </span>
              <span className="text-xs text-slate-500">
                {isSubscribed ? 'Activadas' : 'Desactivadas'}
              </span>
            </div>
            <div
              className={`w-11 h-6 rounded-full relative transition-colors ${
                isSubscribed ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                animate={{ left: isSubscribed ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full py-3.5 rounded-2xl glass-card border border-red-500/10 text-red-400 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>

      {/* Edit habit form overlay */}
      <AnimatePresence>
        {editingHabit && (
          <HabitForm
            habit={editingHabit}
            onSave={async (data) => {
              await onUpdateHabit(editingHabit.id, data)
              onRefresh()
            }}
            onArchive={async () => {
              await onArchiveHabit(editingHabit.id)
              setEditingHabit(null)
              onRefresh()
            }}
            onDelete={async () => {
              await onDeleteHabit(editingHabit.id)
              setEditingHabit(null)
              onRefresh()
            }}
            onBack={() => setEditingHabit(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
