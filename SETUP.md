# SPC Fitness Coach App - Setup

## 🚀 App React Native con Expo e Supabase

App per fitness coaching con gestione utenti coach/clienti, allenamenti, progressi e obiettivi.

## 📋 Configurazione Replit

### 1. Secrets necessari (icona chiave in Replit):

```
SUPABASE_PROJECT_URL = https://erpncdppanzdlwnrrshx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycG5jZHBwYW56ZGx3bnJyc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODg1OTMsImV4cCI6MjA2OTk2NDU5M30.IpLihFJ9Ca7w5Hlxo9SK-YK9YZfgE6us2KdN8Gir3pE
```

### 2. Installazione dipendenze:

```bash
npm install
```

### 3. Avvio app:

```bash
npm start
```

## 🔧 Funzionalità principali:

- ✅ **Autenticazione**: Login/registrazione sicura
- ✅ **Gestione utenti**: Coach e clienti
- ✅ **Allenamenti**: Creazione e gestione workout
- ✅ **Progressi**: Tracking peso, massa muscolare, grasso
- ✅ **Obiettivi**: Sistema di goals personalizzabili
- ✅ **Database**: Supabase con RLS (Row Level Security)

## 📁 Struttura files importanti:

- `lib/supabase.ts` - Configurazione database
- `lib/auth.ts` - Servizi autenticazione
- `supabase-schema.sql` - Schema completo database
- `app/` - Pages e routing con Expo Router

## 🛡️ Sicurezza:

- Variabili ambiente per chiavi sensibili
- RLS policies per controllo accessi
- Autenticazione JWT con Supabase

## 🔄 Modifiche applicate:

1. **Sicurezza migliorata**: Chiavi non più hardcoded
2. **Auth configuration**: Sessioni persistenti corrette
3. **Helper functions**: Test connessione e auth service
4. **App config**: Configurazione Expo corretta
5. **Database schema**: Struttura ottimizzata con policies

## 📱 Test app:

L'app include una funzione `testConnection()` per verificare la connessione a Supabase al primo avvio.