
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppTheme } from '@/constants/AppTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descrizione: '',
    durata: '',
    difficolta: 'principiante',
    categoria: 'cardio',
    is_public: true
  });

  const difficoltaOptions = ['principiante', 'intermedio', 'avanzato'];
  const categoriaOptions = ['cardio', 'forza', 'yoga', 'boxing', 'stretching'];

  const handleCreate = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Errore', 'Il nome dell\'allenamento è obbligatorio');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('workouts')
        .insert({
          nome: formData.nome.trim(),
          descrizione: formData.descrizione.trim(),
          durata: parseInt(formData.durata) || 30,
          difficolta: formData.difficolta,
          categoria: formData.categoria,
          coach_id: user.id,
          is_public: formData.is_public
        });

      if (error) {
        Alert.alert('Errore', 'Impossibile creare l\'allenamento');
        return;
      }

      Alert.alert('Successo', 'Allenamento creato!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Crea Nuovo Allenamento</ThemedText>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nome Allenamento *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.nome}
              onChangeText={(text) => setFormData({...formData, nome: text})}
              placeholder="Es. Full Body Workout"
              placeholderTextColor={AppTheme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Descrizione</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descrizione}
              onChangeText={(text) => setFormData({...formData, descrizione: text})}
              placeholder="Descrivi l'allenamento..."
              placeholderTextColor={AppTheme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Durata (minuti)</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.durata}
              onChangeText={(text) => setFormData({...formData, durata: text})}
              placeholder="30"
              placeholderTextColor={AppTheme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Difficoltà</ThemedText>
            <View style={styles.optionsContainer}>
              {difficoltaOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.difficolta === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({...formData, difficolta: option})}
                >
                  <ThemedText style={[
                    styles.optionText,
                    formData.difficolta === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Categoria</ThemedText>
            <View style={styles.optionsContainer}>
              {categoriaOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.categoria === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({...formData, categoria: option})}
                >
                  <ThemedText style={[
                    styles.optionText,
                    formData.categoria === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.is_public && styles.checkboxChecked
                ]}
                onPress={() => setFormData({...formData, is_public: !formData.is_public})}
              >
                {formData.is_public && <ThemedText style={styles.checkmark}>✓</ThemedText>}
              </TouchableOpacity>
              <ThemedText style={styles.checkboxLabel}>Allenamento pubblico</ThemedText>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreate}
            disabled={loading}
          >
            <ThemedText style={styles.createButtonText}>
              {loading ? 'Creazione...' : 'Crea Allenamento'}
            </ThemedText>
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.xl,
  },
  form: {
    gap: AppTheme.spacing.lg,
  },
  inputGroup: {
    gap: AppTheme.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppTheme.colors.text,
    backgroundColor: AppTheme.colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppTheme.spacing.sm,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
  },
  optionButtonSelected: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: AppTheme.colors.text,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: AppTheme.colors.text,
  },
  createButton: {
    backgroundColor: AppTheme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: AppTheme.spacing.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
