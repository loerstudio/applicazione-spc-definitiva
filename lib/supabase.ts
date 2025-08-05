
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

// Usa le variabili ambiente dai secrets di Replit
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://erpncdppanzdlwnrrshx.supabase.co"
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycG5jZHBwYW56ZGx3bnJyc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODg1OTMsImV4cCI6MjA2OTk2NDU5M30.IpLihFJ9Ca7w5Hlxo9SK-YK9YZfgE6us2KdN8Gir3pE"

// Configurazione migliorata per gestire meglio le sessioni
const authConfig = Platform.OS === 'web' 
  ? {
      autoRefreshToken: true,
      persistSession: true, // Cambiato da false a true
      detectSessionInUrl: true, // Cambiato da false a true per gestire OAuth
    }
  : {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: authConfig,
})

// Funzione helper per verificare la connessione
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    console.log('✅ Connessione Supabase OK')
    return true
  } catch (error) {
    console.error('❌ Errore connessione Supabase:', error)
    return false
  }
}
