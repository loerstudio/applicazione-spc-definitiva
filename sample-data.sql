-- Inserimento dati di esempio

-- NOTA: I profili utente verranno creati automaticamente quando gli utenti si registrano
-- tramite l'autenticazione Supabase. Questo file contiene solo i dati di base
-- che non dipendono da utenti specifici.

-- Esercizi di base (questi non dipendono da utenti specifici)
INSERT INTO exercises (nome, descrizione, durata, ripetizioni, serie, categoria, difficolta, muscoli_target) VALUES 
('Push-up', 'Flessioni classiche per pettorali e tricipiti', 0, 15, 3, 'forza', 'principiante', ARRAY['pettorali', 'tricipiti', 'core']),
('Squat', 'Squat a corpo libero per gambe e glutei', 0, 20, 3, 'forza', 'principiante', ARRAY['quadricipiti', 'glutei', 'polpacci']),
('Plank', 'Plank isometrico per il core', 30, 1, 3, 'forza', 'principiante', ARRAY['core', 'spalle']),
('Burpees', 'Esercizio completo cardio-forza', 0, 10, 3, 'cardio', 'intermedio', ARRAY['tutto il corpo']),
('Mountain Climbers', 'Scalatori per cardio e core', 30, 1, 3, 'cardio', 'intermedio', ARRAY['core', 'gambe', 'spalle']),
('Yoga Flow', 'Sequenza yoga base', 300, 1, 1, 'yoga', 'principiante', ARRAY['tutto il corpo']),
('Boxing Combo', 'Combinazione di pugni base', 180, 1, 3, 'boxing', 'intermedio', ARRAY['braccia', 'core', 'gambe']),
('Stretching Completo', 'Stretching total body', 600, 1, 1, 'stretching', 'principiante', ARRAY['tutto il corpo']);

-- NOTA: Gli allenamenti, le sessioni, i progressi e gli obiettivi verranno creati
-- quando gli utenti effettivi si registreranno e utilizzeranno l'app.
-- Per ora, vengono inseriti solo gli esercizi di base che sono indipendenti dagli utenti.