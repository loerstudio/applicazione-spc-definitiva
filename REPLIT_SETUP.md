# 🚀 Setup Replit per SPC Fitness Coach

## Problema risolto: Errore ngrok tunnel

### ✅ Correzioni applicate:

1. **Dipendenza ngrok locale** aggiunta in `package.json`
2. **Script ottimizzati** per tunnel
3. **Configurazione Replit** in `.replitrc`

### 📋 Setup su Replit:

#### 1. Secrets da configurare:
```
EXPO_PUBLIC_SUPABASE_URL = https://erpncdppanzdlwnrrshx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycG5jZHBwYW56ZGx3bnJyc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODg1OTMsImV4cCI6MjA2OTk2NDU5M30.IpLihFJ9Ca7w5Hlxo9SK-YK9YZfgE6us2KdN8Gir3pE
```

#### 2. Comandi da eseguire:
```bash
# Installa dipendenze (include ngrok locale)
npm install

# Avvia app con tunnel (dovrebbe funzionare senza errori)
npm start
```

#### 3. Comandi alternativi se necessario:
```bash
# Solo locale (stesso WiFi)
npm run start:local

# Solo web browser
npm run start:web
```

### 🎯 Risultato atteso:
- ✅ Nessun errore ngrok
- ✅ QR code visualizzato
- ✅ App funzionante su Expo Go mobile

### 🔧 Se ancora problemi:
1. Cancella `node_modules`: `rm -rf node_modules`
2. Reinstalla: `npm install`
3. Riavvia: `npm start`