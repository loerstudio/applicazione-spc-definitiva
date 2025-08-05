
import React, { useState } from 'react'
import { Alert, StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { supabase } from '@/lib/supabase'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { AppTheme } from '@/constants/AppTheme'
import { useRouter } from 'expo-router'

export default function RegisterCoachScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpCoach() {
    if (!email.trim() || !password.trim() || !nome.trim() || !cognome.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi')
      return
    }

    setLoading(true)

    try {
      // Registra l'utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            nome: nome.trim(),
            cognome: cognome.trim(),
            ruolo: 'coach'
          }
        }
      })

      if (authError) {
        Alert.alert('Errore di registrazione', authError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        // Crea il profilo coach
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email.trim(),
            nome: nome.trim(),
            cognome: cognome.trim(),
            ruolo: 'coach',
            attivo: true
          })

        if (profileError) {
          console.error('Errore creazione profilo:', profileError)
          Alert.alert('Errore', 'Errore nella creazione del profilo')
          setLoading(false)
          return
        }

        Alert.alert(
          'Registrazione completata!', 
          'Controlla la tua email per confermare l\'account, poi potrai accedere.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        )
      }
    } catch (error) {
      console.error('Errore:', error)
      Alert.alert('Errore', 'Si è verificato un errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Registrazione Coach</ThemedText>
        <ThemedText style={styles.subtitle}>
          Crea il tuo account coach
        </ThemedText>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Nome *</ThemedText>
          <TextInput
            style={styles.input}
            onChangeText={setNome}
            value={nome}
            placeholder="Il tuo nome"
            autoCapitalize="words"
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Cognome *</ThemedText>
          <TextInput
            style={styles.input}
            onChangeText={setCognome}
            value={cognome}
            placeholder="Il tuo cognome"
            autoCapitalize="words"
          />
        </ThemedView>

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
            placeholder="Password (min 6 caratteri)"
            autoCapitalize="none"
          />
        </ThemedView>

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]} 
          disabled={loading} 
          onPress={signUpCoach}
        >
          <ThemedText style={styles.primaryButtonText}>
            {loading ? 'Registrazione in corso...' : 'Registrati come Coach'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => router.replace('/auth/login')}
        >
          <ThemedText style={styles.switchButtonText}>
            Hai già un account? Accedi
          </ThemedText>
        </TouchableOpacity>
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
})
