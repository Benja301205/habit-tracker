import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim() || !password.trim()) {
      setError('Completá todos los campos')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email.trim(), password)
      if (error) {
        setError(error)
      } else {
        setSuccess('¡Cuenta creada! Revisá tu email para confirmar.')
      }
    } else {
      const { error } = await signIn(email.trim(), password)
      if (error) {
        setError(error)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative"
      >
        <motion.div
          className="text-6xl mb-4 inline-block"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))' }}
        >
          🔥
        </motion.div>
        <h1 className="text-3xl font-extrabold text-white mb-2 font-display">
          Habit Tracker
        </h1>
        <p className="text-slate-400 text-sm max-w-[240px]">
          Construí hábitos, mantené rachas, mejorá cada día.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 relative"
        autoComplete="on"
      >
        {/* Email */}
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-white text-sm placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full pl-11 pr-12 py-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-white text-sm placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 active:scale-90 transition-transform"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs text-center px-2"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-emerald-400 text-xs text-center px-2"
          >
            {success}
          </motion.p>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          {loading
            ? 'Cargando...'
            : isSignUp
            ? 'Crear cuenta'
            : 'Iniciar sesión'}
        </motion.button>

        {/* Toggle sign in / sign up */}
        <p className="text-center text-slate-500 text-xs pt-2">
          {isSignUp ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setSuccess(null)
            }}
            className="text-indigo-400 font-medium"
          >
            {isSignUp ? 'Iniciá sesión' : 'Creá una'}
          </button>
        </p>
      </motion.form>
    </div>
  )
}
