
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { AppTheme } from '@/constants/AppTheme';
import { router } from 'expo-router';

export default function CreateGoalScreen() {
  const [goalName, setGoalName] = useState('');
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert('Errore', 'Inserisci il nome dell\'obiettivo');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Errore', 'Utente non autenticato');
        return;
      }

      const { error } = await supabase
        .from('obiettivi')
        .insert({
          user_id: user.id,
          nome: goalName,
          note: notes,
          data_inizio: new Date().toISOString(),
          data_scadenza: targetDate.toISOString(),
          completato: false,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Successo', 'Obiettivo creato con successo!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile creare l\'obiettivo');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  const daysDifference = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Indietro</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuovo Obiettivo</Text>
          <View />
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Obiettivo</Text>
            <TextInput
              style={styles.input}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="Es. Perdere 5kg, Correre 10km..."
              placeholderTextColor={AppTheme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note (Opzionale)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Aggiungi dettagli sul tuo obiettivo..."
              placeholderTextColor={AppTheme.colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data Scadenza</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {targetDate.toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <Text style={styles.dateIcon}>📅</Text>
            </TouchableOpacity>

            {daysDifference > 0 && (
              <Text style={styles.daysRemaining}>
                {daysDifference} giorni rimanenti
              </Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.imageSection}>
            <Text style={styles.label}>Foto Prima/Dopo</Text>
            <TouchableOpacity style={styles.imageButton}>
              <Text style={styles.imageButtonText}>📷 Aggiungi Foto</Text>
            </TouchableOpacity>
            <Text style={styles.imageHint}>
              Potrai aggiungere foto di progresso durante il tuo percorso
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateGoal}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creazione...' : 'Crea Obiettivo'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  backButton: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.primary,
  },
  headerTitle: {
    fontSize: AppTheme.fontSize.lg,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  content: {
    padding: AppTheme.spacing.md,
  },
  inputGroup: {
    marginBottom: AppTheme.spacing.lg,
  },
  label: {
    fontSize: AppTheme.fontSize.md,
    fontWeight: '600',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.sm,
  },
  input: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.text,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.text,
  },
  dateIcon: {
    fontSize: 20,
  },
  daysRemaining: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.primary,
    marginTop: AppTheme.spacing.sm,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: AppTheme.spacing.xl,
  },
  imageButton: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.lg,
    borderWidth: 2,
    borderColor: AppTheme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.textSecondary,
  },
  imageHint: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: AppTheme.spacing.sm,
  },
  createButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.lg,
    alignItems: 'center',
    marginTop: AppTheme.spacing.lg,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: AppTheme.fontSize.lg,
    fontWeight: 'bold',
    color: AppTheme.colors.white,
  },
});
