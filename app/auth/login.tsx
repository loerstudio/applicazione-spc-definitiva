import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { supabase } from '@/lib/supabase'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { AppTheme } from '@/constants/AppTheme'
import { useRouter } from 'expo-router'

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Errore', 'Inserisci email e password')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    if (error) {
      Alert.alert('Errore di accesso', error.message)
      setLoading(false)
      return
    }

    // Verifica se l'utente è attivo
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('attivo, data_disattivazione, giorni_disattivazione')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        Alert.alert('Errore', 'Impossibile verificare lo stato dell\'account')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (!profile.attivo) {
        Alert.alert(
          'Account disattivato', 
          profile.data_disattivazione && profile.giorni_disattivazione
            ? `Il tuo account è temporaneamente disattivato fino al ${new Date(
                new Date(profile.data_disattivazione).getTime() + 
                profile.giorni_disattivazione * 24 * 60 * 60 * 1000
              ).toLocaleDateString('it-IT')}`
            : 'Il tuo account è stato disattivato. Contatta il tuo coach.'
        )
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
    }

    setLoading(false)
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Accedi</ThemedText>
        <ThemedText style={styles.subtitle}>
          Benvenuto nella tua app fitness
        </ThemedText>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Email *</ThemedText>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="email@esempio.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Password *</ThemedText>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
          />
        </ThemedView>

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]} 
          disabled={loading} 
          onPress={signInWithEmail}
        >
          <ThemedText style={styles.primaryButtonText}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.helpText}>
          Non hai un account? Contatta il tuo coach per la registrazione.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: AppTheme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: AppTheme.colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: AppTheme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: AppTheme.colors.surface,
    color: AppTheme.colors.text,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  roleButtonText: {
    fontSize: 16,
    color: AppTheme.colors.text,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: AppTheme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: AppTheme.colors.primary,
    fontSize: 16,
  },
  helpText: {
    textAlign: 'center',
    marginTop: 20,
    color: AppTheme.colors.textSecondary,
    fontSize: 14,
  },
})