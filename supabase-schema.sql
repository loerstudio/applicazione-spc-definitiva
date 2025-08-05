
-- Schema per l'app fitness

-- Prima elimina la funzione esistente se presente
DROP FUNCTION IF EXISTS riattiva_utenti_automaticamente();

-- Tabella profili utenti
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  nome TEXT,
  cognome TEXT,
  ruolo TEXT CHECK (ruolo IN ('cliente', 'coach')) DEFAULT 'cliente',
  data_nascita DATE,
  altezza INTEGER,
  peso DECIMAL,
  obiettivi TEXT,
  attivo BOOLEAN DEFAULT true,
  data_disattivazione DATE,
  giorni_disattivazione INTEGER,
  created_by UUID REFERENCES profiles(id), -- Coach che ha creato l'utente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella allenamenti
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  durata INTEGER, -- in minuti
  difficolta TEXT CHECK (difficolta IN ('principiante', 'intermedio', 'avanzato')),
  categoria TEXT CHECK (categoria IN ('cardio', 'forza', 'yoga', 'boxing', 'stretching')),
  coach_id UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella esercizi
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  video_url TEXT,
  immagine_url TEXT,
  durata INTEGER, -- in secondi
  ripetizioni INTEGER,
  serie INTEGER,
  categoria TEXT,
  difficolta TEXT CHECK (difficolta IN ('principiante', 'intermedio', 'avanzato')),
  muscoli_target TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella relazione workout-esercizi
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  ordine INTEGER NOT NULL,
  ripetizioni INTEGER,
  serie INTEGER,
  tempo_riposo INTEGER, -- in secondi
  UNIQUE(workout_id, exercise_id, ordine)
);

-- Tabella sessioni allenamento
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  workout_id UUID REFERENCES workouts(id),
  data_inizio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fine TIMESTAMP WITH TIME ZONE,
  completato BOOLEAN DEFAULT false,
  durata_effettiva INTEGER,
  calorie_bruciate INTEGER,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella progressi (aggiorna la struttura esistente)
DO $$
BEGIN
  -- Aggiungi le colonne mancanti se non esistono
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progressi' AND column_name = 'peso') THEN
    ALTER TABLE progressi ADD COLUMN peso DECIMAL(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progressi' AND column_name = 'massa_muscolare') THEN
    ALTER TABLE progressi ADD COLUMN massa_muscolare DECIMAL(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progressi' AND column_name = 'percentuale_grasso') THEN
    ALTER TABLE progressi ADD COLUMN percentuale_grasso DECIMAL(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progressi' AND column_name = 'data_registrazione') THEN
    ALTER TABLE progressi ADD COLUMN data_registrazione DATE DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progressi' AND column_name = 'note') THEN
    ALTER TABLE progressi ADD COLUMN note TEXT;
  END IF;
END $$;

-- Se la tabella progressi non esiste, creala
CREATE TABLE IF NOT EXISTS progressi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  peso DECIMAL(5,2),
  massa_muscolare DECIMAL(5,2),
  percentuale_grasso DECIMAL(5,2),
  note TEXT,
  data_registrazione DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella obiettivi
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  titolo TEXT NOT NULL,
  descrizione TEXT,
  tipo TEXT CHECK (tipo IN ('peso', 'forza', 'resistenza', 'altro')),
  valore_target DECIMAL,
  valore_attuale DECIMAL DEFAULT 0,
  unita_misura TEXT,
  data_target DATE,
  completato BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella relazione coach-clienti
CREATE TABLE IF NOT EXISTS coach_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id),
  data_inizio DATE DEFAULT CURRENT_DATE,
  attivo BOOLEAN DEFAULT true,
  UNIQUE(coach_id, client_id)
);

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressi ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_clients ENABLE ROW LEVEL SECURITY;

-- Elimina le policy esistenti se presenti
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can manage users" ON profiles;
DROP POLICY IF EXISTS "Users can view public workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can manage own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can view own progress" ON progressi;
DROP POLICY IF EXISTS "Users can manage own progress" ON progressi;
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
DROP POLICY IF EXISTS "Coaches can manage their clients" ON coach_clients;
DROP POLICY IF EXISTS "Clients can view their coach relation" ON coach_clients;

-- Policy per profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Coaches can manage users" ON profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND ruolo = 'coach'
  )
);

-- Policy per workouts
CREATE POLICY "Users can view public workouts" ON workouts FOR SELECT USING (is_public = true OR coach_id = auth.uid());
CREATE POLICY "Coaches can manage own workouts" ON workouts FOR ALL USING (coach_id = auth.uid());

-- Policy per workout_sessions
CREATE POLICY "Users can view own sessions" ON workout_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own sessions" ON workout_sessions FOR ALL USING (user_id = auth.uid());

-- Policy per progressi
CREATE POLICY "Users can view own progress" ON progressi FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own progress" ON progressi FOR ALL USING (user_id = auth.uid());

-- Policy per goals
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (user_id = auth.uid());

-- Policy per coach_clients
CREATE POLICY "Coaches can manage their clients" ON coach_clients FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Clients can view their coach relation" ON coach_clients FOR SELECT USING (client_id = auth.uid());

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Elimina i trigger esistenti se presenti
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
DROP TRIGGER IF EXISTS update_progressi_updated_at ON progressi;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progressi_updated_at BEFORE UPDATE ON progressi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per riattivare automaticamente gli utenti disattivati temporaneamente
CREATE OR REPLACE FUNCTION riattiva_utenti_automaticamente()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET attivo = true, 
      data_disattivazione = NULL, 
      giorni_disattivazione = NULL
  WHERE attivo = false 
    AND data_disattivazione IS NOT NULL 
    AND giorni_disattivazione IS NOT NULL
    AND data_disattivazione + INTERVAL '1 day' * giorni_disattivazione <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
