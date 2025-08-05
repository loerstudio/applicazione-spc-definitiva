import { supabase } from './supabase'
import { Alert } from 'react-native'

export interface AuthUser {
  id: string
  email?: string
  nome?: string
  cognome?: string
  ruolo?: 'cliente' | 'coach'
}

export const authService = {
  // Login con email e password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Registrazione
  async signUp(email: string, password: string, userData: {
    nome: string
    cognome: string
    ruolo: 'cliente' | 'coach'
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      // Crea il profilo utente
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            ...userData,
          })
        
        if (profileError) throw profileError
      }
      
      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Ottieni profilo utente
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { profile: data, error: null }
    } catch (error: any) {
      return { profile: null, error: error.message }
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Listener per cambiamenti di autenticazione
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}