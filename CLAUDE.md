# Habit Tracker PWA

## Qué es
App PWA de tracking de hábitos personales. Se instala en iPhone vía Safari (iOS 16.4+). Pantalla completa, sin barra de Safari, dark mode, interfaz en español.

## Stack
- **Frontend:** React + Vite + TypeScript + Tailwind CSS v4
- **Backend/DB/Auth:** Supabase (PostgreSQL, Auth email+password, RLS)
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Fechas:** date-fns
- **Push:** Web Push API vía Service Worker
- **Hosting:** Vercel
- **Fonts:** Outfit (display/títulos), DM Sans (body)

## Supabase
- **URL:** `https://dvqugiwaqugqvvsmxtls.supabase.co`
- Credenciales en `.env` (no commitear)
- Auth por **email + password** (no Apple Sign In, no hay Developer Account)
- El formulario de login usa `autocomplete="username"` y `autocomplete="current-password"` para que iOS ofrezca guardar contraseñas con Face ID

## Zona horaria
**America/Argentina/Buenos_Aires (UTC-3)**. Todas las evaluaciones de fecha/hora deben usar esta zona. No usar `new Date()` directo para obtener "hoy", usar `getTodayArgentina()` de `lib/streak-calculator.ts`.

## Idioma
Toda la interfaz en **español argentino** (voseo: "Creá", "Iniciá", "Completá").

## Modelo de datos

### `habits`
- `id`, `user_id`, `name`, `emoji`, `color`, `type` (positive|abstinence)
- `weekly_goal` (solo positivos, 1-7), `start_date`, `reminder_days` (int[]), `reminder_time`
- `current_streak`, `best_streak`, `streak_unit` (weeks|days), `active`
- RLS: cada usuario solo ve/modifica sus propios hábitos

### `check_ins`
- `id`, `habit_id`, `date`, `completed` (boolean)
- Solo para hábitos positivos. UNIQUE(habit_id, date)
- RLS: vía relación con habits.user_id

### `relapses`
- `id`, `habit_id`, `date`, `note` (opcional), `streak_at_relapse`
- Solo para hábitos de abstinencia
- RLS: vía relación con habits.user_id

### `push_subscriptions`
- `id`, `user_id`, `endpoint`, `p256dh`, `auth`

## Lógica de rachas

### Positivos (racha en semanas)
- Se evalúa lunes a domingo. Si check_ins >= weekly_goal → streak +1
- Si no → streak = 0 (guardando best_streak si correspondía)
- Evaluado por Edge Function `evaluate-weekly-streaks` (cron lunes 03:05 UTC)

### Abstinencia (racha en días)
- Se calcula DINÁMICAMENTE con `calculateAbstinenceStreak()` → diferencia en días desde última recaída o start_date
- Al registrar recaída: se guarda streak_at_relapse, se actualiza best_streak si corresponde, se resetea current_streak a 0

## Estructura del proyecto

```
src/
├── App.tsx                    # Router principal, DemoApp vs SupabaseApp
├── main.tsx                   # Entry point, AuthProvider
├── types/index.ts             # Tipos: Habit, CheckIn, Relapse, Tab
├── lib/
│   ├── supabase.ts            # Cliente Supabase + flag isDemo
│   ├── auth-context.tsx       # Context de auth (email+password)
│   ├── streak-calculator.ts   # getTodayArgentina, getWeekStart, calculateAbstinenceStreak
│   ├── default-habits.ts      # 5 hábitos default para primer login
│   ├── demo-store.ts          # Store en memoria/localStorage cuando no hay Supabase
│   └── push.ts                # Registro de Service Worker
├── hooks/
│   ├── useHabits.ts           # CRUD de hábitos (Supabase)
│   ├── useCheckIns.ts         # Check-ins + toggle (Supabase)
│   ├── useStreaks.ts          # Relapses + registerRelapse (Supabase)
│   └── usePushNotifications.ts # Push subscription
├── pages/
│   ├── Login.tsx              # Email + password con autocomplete iOS
│   ├── Today.tsx              # Vista diaria principal
│   ├── Stats.tsx              # Toggle semanal/mensual
│   └── Settings.tsx           # Lista de hábitos + editar + cerrar sesión
├── components/
│   ├── layout/
│   │   ├── TabBar.tsx         # 3 tabs fijos: Hoy, Stats, Config
│   │   └── Header.tsx         # Fecha + frase motivacional
│   ├── habits/
│   │   ├── HabitCard.tsx      # Card para positivo (checkbox) o abstinencia (contador)
│   │   ├── HabitDetail.tsx    # Detalle con calendario, rachas, historial
│   │   ├── HabitForm.tsx      # Crear/editar hábito (emoji, color, tipo, meta, reminders)
│   │   ├── CheckInButton.tsx  # Checkbox animado con pop
│   │   ├── RelapseModal.tsx   # Modal "Tuve una recaída" con nota opcional
│   │   └── StreakBadge.tsx    # Badge "🔥 N semanas/días"
│   ├── stats/
│   │   ├── WeeklyStats.tsx    # Progreso semanal por hábito
│   │   ├── MonthlyStats.tsx   # Progreso mensual + resumen general
│   │   └── ContributionGraph.tsx # Calendario tipo GitHub
│   └── ui/
│       ├── EmojiPicker.tsx    # Selector de emoji
│       ├── ColorPicker.tsx    # Paleta de 10 colores
│       └── ConfirmModal.tsx   # Modal de confirmación genérico
supabase/
├── migrations/001_initial_schema.sql   # Tablas, RLS, índices, trigger
└── functions/
    ├── evaluate-weekly-streaks/        # Cron lunes: evaluar metas semanales
    └── send-push-reminders/            # Cron cada 15min: enviar push
public/
├── manifest.json              # PWA manifest
└── sw.js                      # Service Worker (cache + push)
```

## Modo demo
Cuando no hay `.env` con credenciales de Supabase, la app corre en modo demo:
- `isDemo` flag en `lib/supabase.ts`
- Auto-login sin auth real
- `DemoApp` en App.tsx usa `demo-store.ts` (localStorage) en vez de Supabase
- Los hooks de Supabase NO se ejecutan en modo demo

## Diseño
- **Dark mode** siempre. Fondo slate-950, cards con glassmorphism (`glass` class en CSS)
- Mobile-first, todo táctil-friendly
- Animaciones con Framer Motion: pop en check-in, slide en transiciones, spring en tabs
- Skeletons para loading (no spinners)
- Safe areas de iPhone con `env(safe-area-inset-*)`
- Sin bordes agresivos, sombras suaves, separación por espaciado

## Hábitos default (primer login)
1. Ejercicio 🏃 — positivo — 3/semana — #10B981
2. Lectura 📖 — positivo — 5/semana — #6366F1
3. Meditación 🧘 — positivo — 4/semana — #8B5CF6
4. No alcohol 🚫🍷 — abstinencia — #EF4444
5. No fap 💪 — abstinencia — #F59E0B

## Comandos
```bash
npm run dev     # Servidor de desarrollo
npm run build   # Build de producción
npx tsc --noEmit # Type check
```
