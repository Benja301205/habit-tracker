import { Home, BarChart3, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Tab } from '../../types'

interface TabBarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'today', icon: Home, label: 'Hoy' },
  { id: 'stats', icon: BarChart3, label: 'Stats' },
  { id: 'settings', icon: Settings, label: 'Config' },
]

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-elevated border-t border-slate-800/50 safe-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center gap-0.5 px-6 py-2 relative"
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-x-2 inset-y-0.5 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={22}
                className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`relative z-10 text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-indigo-400' : 'text-slate-600'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
