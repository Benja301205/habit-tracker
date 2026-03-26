-- ============================================
-- Habit Tracker - Initial Schema
-- ============================================

-- Tabla de hábitos
CREATE TABLE habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  emoji           text NOT NULL DEFAULT '✅',
  color           text NOT NULL DEFAULT '#4F46E5',
  type            text NOT NULL CHECK (type IN ('positive', 'abstinence')),
  weekly_goal     integer CHECK (weekly_goal IS NULL OR (weekly_goal >= 1 AND weekly_goal <= 7)),
  start_date      date NOT NULL DEFAULT CURRENT_DATE,
  reminder_days   integer[],
  reminder_time   time,
  current_streak  integer NOT NULL DEFAULT 0,
  best_streak     integer NOT NULL DEFAULT 0,
  streak_unit     text NOT NULL CHECK (streak_unit IN ('weeks', 'days')),
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Índices para habits
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_active ON habits(user_id, active);

-- Tabla de check-ins (para hábitos positivos)
CREATE TABLE check_ins (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id        uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date            date NOT NULL,
  completed       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Índices para check_ins
CREATE INDEX idx_check_ins_habit_id ON check_ins(habit_id);
CREATE INDEX idx_check_ins_habit_date ON check_ins(habit_id, date);

-- Tabla de recaídas (para hábitos de abstinencia)
CREATE TABLE relapses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id            uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date                date NOT NULL,
  note                text,
  streak_at_relapse   integer NOT NULL,
  created_at          timestamptz DEFAULT now()
);

-- Índices para relapses
CREATE INDEX idx_relapses_habit_id ON relapses(habit_id);
CREATE INDEX idx_relapses_habit_date ON relapses(habit_id, date);

-- Tabla de suscripciones push
CREATE TABLE push_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint        text NOT NULL,
  p256dh          text NOT NULL,
  auth            text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies para habits
CREATE POLICY "Users can read own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para check_ins (a través de la relación con habits)
CREATE POLICY "Users can read own check_ins"
  ON check_ins FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own check_ins"
  ON check_ins FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own check_ins"
  ON check_ins FOR UPDATE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own check_ins"
  ON check_ins FOR DELETE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- Policies para relapses
CREATE POLICY "Users can read own relapses"
  ON relapses FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own relapses"
  ON relapses FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own relapses"
  ON relapses FOR DELETE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- Policies para push_subscriptions
CREATE POLICY "Users can read own push_subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push_subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push_subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Trigger para updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
