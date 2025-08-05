import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppTheme } from '@/constants/AppTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface ProgressEntry {
  id: string;
  data: string;
  peso?: number;
  massa_muscolare?: number;
  grasso_corporeo?: number;
  circonferenza_vita?: number;
  circonferenza_torace?: number;
  circonferenza_braccia?: number;
  note?: string;
}

export default function ProgressScreen() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    peso: '',
    massa_muscolare: '',
    grasso_corporeo: '',
    circonferenza_vita: '',
    circonferenza_torace: '',
    circonferenza_braccia: '',
    note: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/auth/login');
      return;
    }
    fetchProgressData();
  };

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('progressi')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Errore caricamento progressi:', error);
        return;
      }

      setProgressData(data || []);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProgressEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const entryData: any = {
        user_id: user.id,
        data: new Date().toISOString().split('T')[0]
      };

      // Aggiungi solo i campi compilati
      if (newEntry.peso) entryData.peso = parseFloat(newEntry.peso);
      if (newEntry.massa_muscolare) entryData.massa_muscolare = parseFloat(newEntry.massa_muscolare);
      if (newEntry.grasso_corporeo) entryData.grasso_corporeo = parseFloat(newEntry.grasso_corporeo);
      if (newEntry.circonferenza_vita) entryData.circonferenza_vita = parseInt(newEntry.circonferenza_vita);
      if (newEntry.circonferenza_torace) entryData.circonferenza_torace = parseInt(newEntry.circonferenza_torace);
      if (newEntry.circonferenza_braccia) entryData.circonferenza_braccia = parseInt(newEntry.circonferenza_braccia);
      if (newEntry.note) entryData.note = newEntry.note;

      const { error } = await supabase
        .from('progressi')
        .insert(entryData);

      if (error) {
        Alert.alert('Errore', 'Impossibile salvare i progressi');
        return;
      }

      setNewEntry({
        peso: '',
        massa_muscolare: '',
        grasso_corporeo: '',
        circonferenza_vita: '',
        circonferenza_torace: '',
        circonferenza_braccia: '',
        note: ''
      });
      setShowAddForm(false);
      fetchProgressData();
      Alert.alert('Successo', 'Progressi salvati!');
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Caricamento...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>I Miei Progressi</ThemedText>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <ThemedText style={styles.addButtonText}>+</ThemedText>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.addForm}>
            <ThemedText style={styles.formTitle}>Aggiungi Misurazione</ThemedText>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Peso (kg)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newEntry.peso}
                  onChangeText={(text) => setNewEntry({...newEntry, peso: text})}
                  placeholder="70.5"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Massa Muscolare (%)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newEntry.massa_muscolare}
                  onChangeText={(text) => setNewEntry({...newEntry, massa_muscolare: text})}
                  placeholder="25.0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Grasso Corporeo (%)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newEntry.grasso_corporeo}
                  onChangeText={(text) => setNewEntry({...newEntry, grasso_corporeo: text})}
                  placeholder="15.0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Vita (cm)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newEntry.circonferenza_vita}
                  onChangeText={(text) => setNewEntry({...newEntry, circonferenza_vita: text})}
                  placeholder="80"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Torace (cm)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newEntry.circonferenza_torace}
                  onChangeText={(text) => setNewEntry({...newEntry, circonferenza_torace: text})}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Braccia (cm)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newEntry.circonferenza_braccia}
                  onChangeText={(text) => setNewEntry({...newEntry, circonferenza_braccia: text})}
                  placeholder="35"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.fullInputGroup}>
              <ThemedText style={styles.label}>Note</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEntry.note}
                onChangeText={(text) => setNewEntry({...newEntry, note: text})}
                placeholder="Note aggiuntive..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Annulla</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addProgressEntry}
              >
                <ThemedText style={styles.saveButtonText}>Salva</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.progressList}>
          {progressData.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyTitle}>Nessun progresso registrato</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Inizia a tracciare i tuoi progressi per vedere l'evoluzione del tuo corpo nel tempo
              </ThemedText>
            </View>
          ) : (
            progressData.map((entry) => (
              <View key={entry.id} style={styles.progressCard}>
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.cardDate}>
                    {new Date(entry.data).toLocaleDateString('it-IT')}
                  </ThemedText>
                </View>

                <View style={styles.cardContent}>
                  {entry.peso && (
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricLabel}>Peso</ThemedText>
                      <ThemedText style={styles.metricValue}>{entry.peso} kg</ThemedText>
                    </View>
                  )}

                  {entry.massa_muscolare && (
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricLabel}>Massa Muscolare</ThemedText>
                      <ThemedText style={styles.metricValue}>{entry.massa_muscolare}%</ThemedText>
                    </View>
                  )}

                  {entry.grasso_corporeo && (
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricLabel}>Grasso Corporeo</ThemedText>
                      <ThemedText style={styles.metricValue}>{entry.grasso_corporeo}%</ThemedText>
                    </View>
                  )}

                  {entry.circonferenza_vita && (
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricLabel}>Vita</ThemedText>
                      <ThemedText style={styles.metricValue}>{entry.circonferenza_vita} cm</ThemedText>
                    </View>
                  )}

                  {entry.circonferenza_torace && (
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricLabel}>Torace</ThemedText>
                      <ThemedText style={styles.metricValue}>{entry.circonferenza_torace} cm</ThemedText>
                    </View>
                  )}

                  {entry.circonferenza_braccia && (
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricLabel}>Braccia</ThemedText>
                      <ThemedText style={styles.metricValue}>{entry.circonferenza_braccia} cm</ThemedText>
                    </View>
                  )}

                  {entry.note && (
                    <View style={styles.noteSection}>
                      <ThemedText style={styles.noteLabel}>Note:</ThemedText>
                      <ThemedText style={styles.noteText}>{entry.note}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  content: {
    padding: AppTheme.spacing.lg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    padding: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.xl,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    gap: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  fullInputGroup: {
    marginBottom: AppTheme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: AppTheme.colors.text,
    backgroundColor: AppTheme.colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: AppTheme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressList: {
    gap: AppTheme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: AppTheme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    padding: AppTheme.spacing.lg,
  },
  cardHeader: {
    marginBottom: AppTheme.spacing.md,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
  },
  cardContent: {
    gap: AppTheme.spacing.sm,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  noteSection: {
    marginTop: AppTheme.spacing.sm,
    paddingTop: AppTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.xs,
  },
  noteText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
});