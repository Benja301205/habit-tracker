import { motion } from 'framer-motion'

interface IllustrationProps {
  size?: number
  className?: string
}

/** Animated flame icon for streaks - replaces 🔥 emoji */
export function FlameIcon({ size = 24, className = '' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="flame-grad" x1="12" y1="22" x2="12" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="12" y1="20" x2="12" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 4 9 4 14.5C4 18.64 7.58 22 12 22C16.42 22 20 18.64 20 14.5C20 9 12 2 12 2Z"
        fill="url(#flame-grad)"
      />
      <path
        d="M12 9C12 9 8.5 13 8.5 15.5C8.5 17.43 10.07 19 12 19C13.93 19 15.5 17.43 15.5 15.5C15.5 13 12 9 12 9Z"
        fill="url(#flame-inner)"
      />
      <ellipse cx="12" cy="16.5" rx="2" ry="2.5" fill="#fde68a" opacity="0.6" />
    </svg>
  )
}

/** Animated flame with motion for large displays */
export function AnimatedFlame({ size = 48, className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.06, 1], y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))' }}
    >
      <FlameIcon size={size} />
    </motion.div>
  )
}

/** Sprout/seedling illustration for empty states - replaces 🌱 */
export function SproutIllustration({ size = 64, className = '' }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="leaf-grad" x1="20" y1="40" x2="40" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="stem-grad" x1="32" y1="50" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <radialGradient id="glow-green" cx="32" cy="32" r="28">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Background glow */}
      <circle cx="32" cy="32" r="28" fill="url(#glow-green)" />
      {/* Stem */}
      <motion.path
        d="M32 52V30"
        stroke="url(#stem-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Left leaf */}
      <motion.path
        d="M32 36C32 36 22 32 18 24C18 24 28 22 32 30"
        fill="url(#leaf-grad)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: '32px 33px' }}
      />
      {/* Right leaf */}
      <motion.path
        d="M32 30C32 30 42 26 46 18C46 18 36 16 32 24"
        fill="url(#leaf-grad)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: '32px 27px' }}
      />
      {/* Sparkle dots */}
      <motion.circle
        cx="24" cy="18" r="1.5"
        fill="#34d399"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="44" cy="14" r="1"
        fill="#6ee7b7"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
      />
      <motion.circle
        cx="40" cy="38" r="1.2"
        fill="#a7f3d0"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
      />
    </motion.svg>
  )
}

/** Celebration/trophy illustration - replaces 🎉 */
export function CelebrationIllustration({ size = 56, className = '' }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
    >
      <defs>
        <linearGradient id="trophy-grad" x1="28" y1="44" x2="28" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="star-grad" x1="28" y1="28" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      {/* Trophy body */}
      <path
        d="M20 16H36V30C36 34.42 32.42 38 28 38C23.58 38 20 34.42 20 30V16Z"
        fill="url(#trophy-grad)"
      />
      {/* Left handle */}
      <path
        d="M20 18H16C14.9 18 14 18.9 14 20V22C14 24.21 15.79 26 18 26H20"
        stroke="#fbbf24"
        strokeWidth="2"
        fill="none"
      />
      {/* Right handle */}
      <path
        d="M36 18H40C41.1 18 42 18.9 42 20V22C42 24.21 40.21 26 38 26H36"
        stroke="#fbbf24"
        strokeWidth="2"
        fill="none"
      />
      {/* Base */}
      <rect x="24" y="38" width="8" height="3" rx="1" fill="#d97706" />
      <rect x="22" y="41" width="12" height="3" rx="1.5" fill="#b45309" />
      {/* Star on trophy */}
      <path
        d="M28 20L29.5 23.1L33 23.6L30.5 26L31.1 29.5L28 27.8L24.9 29.5L25.5 26L23 23.6L26.5 23.1L28 20Z"
        fill="url(#star-grad)"
      />
      {/* Confetti particles */}
      {[
        { cx: 10, cy: 12, color: '#818cf8', delay: 0 },
        { cx: 46, cy: 10, color: '#f472b6', delay: 0.2 },
        { cx: 8, cy: 28, color: '#34d399', delay: 0.4 },
        { cx: 48, cy: 26, color: '#fbbf24', delay: 0.6 },
        { cx: 14, cy: 40, color: '#f97316', delay: 0.3 },
        { cx: 44, cy: 38, color: '#6366f1', delay: 0.5 },
      ].map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r="2"
          fill={p.color}
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.svg>
  )
}

/** App logo flame for login screen - replaces 🔥 emoji */
export function LogoFlame({ size = 72, className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'drop-shadow(0 0 24px rgba(251, 191, 36, 0.35))' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
      >
        <defs>
          <linearGradient id="logo-flame-outer" x1="36" y1="64" x2="36" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="70%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="logo-flame-mid" x1="36" y1="60" x2="36" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="logo-flame-core" x1="36" y1="56" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
          <radialGradient id="logo-glow" cx="36" cy="40" r="32">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Background glow */}
        <circle cx="36" cy="40" r="32" fill="url(#logo-glow)" />
        {/* Outer flame */}
        <path
          d="M36 6C36 6 10 24 10 42C10 56.36 21.64 64 36 64C50.36 64 62 56.36 62 42C62 24 36 6 36 6Z"
          fill="url(#logo-flame-outer)"
        />
        {/* Mid flame */}
        <path
          d="M36 24C36 24 22 34 22 44C22 51.73 28.27 58 36 58C43.73 58 50 51.73 50 44C50 34 36 24 36 24Z"
          fill="url(#logo-flame-mid)"
        />
        {/* Inner core */}
        <ellipse cx="36" cy="48" rx="8" ry="10" fill="url(#logo-flame-core)" />
        {/* Highlight */}
        <ellipse cx="36" cy="44" rx="4" ry="5" fill="#fef9c3" opacity="0.5" />
      </svg>
    </motion.div>
  )
}

/** Streak fire icon for inline use in cards (small) */
export function StreakFlame({ size = 18, className = '' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="sf-grad" x1="9" y1="16" x2="9" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <path
        d="M9 1.5C9 1.5 3 6.75 3 10.875C3 13.98 5.69 16.5 9 16.5C12.31 16.5 15 13.98 15 10.875C15 6.75 9 1.5 9 1.5Z"
        fill="url(#sf-grad)"
      />
      <ellipse cx="9" cy="12" rx="2.5" ry="3" fill="#fde68a" opacity="0.6" />
    </svg>
  )
}
