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
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-800/80 safe-bottom z-50">
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
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-px left-3 right-3 h-[3px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={22}
                className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-600'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-600'
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
