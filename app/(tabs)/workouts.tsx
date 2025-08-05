
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppTheme } from '@/constants/AppTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface Workout {
  id: string;
  nome: string;
  descrizione: string;
  durata: number;
  difficolta: string;
  categoria: string;
  is_public: boolean;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [userProfile, setUserProfile] = useState<any>(null);

  const categories = [
    { key: 'tutti', name: 'Tutti', icon: '🏋️‍♂️' },
    { key: 'cardio', name: 'Cardio', icon: '🏃‍♂️' },
    { key: 'forza', name: 'Forza', icon: '💪' },
    { key: 'yoga', name: 'Yoga', icon: '🧘‍♀️' },
    { key: 'boxing', name: 'Boxing', icon: '🥊' },
    { key: 'stretching', name: 'Stretching', icon: '🤸‍♀️' },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [selectedCategory, searchQuery]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/auth/login');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    setUserProfile(profile);
  };

  const fetchWorkouts = async () => {
    try {
      let query = supabase
        .from('workouts')
        .select('*')
        .eq('is_public', true);

      if (selectedCategory !== 'tutti') {
        query = query.eq('categoria', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('nome', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Errore caricamento workouts:', error);
        return;
      }

      setWorkouts(data || []);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async (workout: Workout) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          data_inizio: new Date().toISOString(),
          completato: false
        });

      if (error) {
        Alert.alert('Errore', 'Impossibile avviare l\'allenamento');
        return;
      }

      Alert.alert('Allenamento Avviato!', `Hai iniziato: ${workout.nome}`);
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante': return '#4CAF50';
      case 'intermedio': return '#FF9800';
      case 'avanzato': return '#F44336';
      default: return AppTheme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.key === category);
    return cat?.icon || '🏋️‍♂️';
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Caricamento allenamenti...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Allenamenti</ThemedText>
        {userProfile?.ruolo === 'coach' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/workouts/create')}
          >
            <ThemedText style={styles.addButtonText}>+</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca allenamenti..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={AppTheme.colors.textSecondary}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        <View style={styles.categoriesContent}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.categoryChipSelected
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <ThemedText style={[
                styles.categoryText,
                selectedCategory === category.key && styles.categoryTextSelected
              ]}>
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Workouts List */}
      <ScrollView style={styles.workoutsList} showsVerticalScrollIndicator={false}>
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️‍♂️</Text>
            <ThemedText style={styles.emptyTitle}>Nessun allenamento trovato</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Prova a cambiare categoria o cerca qualcosa di diverso
            </ThemedText>
          </View>
        ) : (
          workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <View style={styles.workoutTitleRow}>
                    <Text style={styles.categoryIconLarge}>
                      {getCategoryIcon(workout.categoria)}
                    </Text>
                    <ThemedText style={styles.workoutTitle}>{workout.nome}</ThemedText>
                  </View>
                  
                  <ThemedText style={styles.workoutDescription}>
                    {workout.descrizione || 'Nessuna descrizione disponibile'}
                  </ThemedText>
                  
                  <View style={styles.workoutMeta}>
                    <View style={styles.metaItem}>
                      <ThemedText style={styles.metaLabel}>Durata</ThemedText>
                      <ThemedText style={styles.metaValue}>{workout.durata} min</ThemedText>
                    </View>
                    
                    <View style={styles.metaItem}>
                      <ThemedText style={styles.metaLabel}>Difficoltà</ThemedText>
                      <ThemedText style={[
                        styles.metaValue,
                        { color: getDifficultyColor(workout.difficolta) }
                      ]}>
                        {workout.difficolta}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.metaItem}>
                      <ThemedText style={styles.metaLabel}>Categoria</ThemedText>
                      <ThemedText style={styles.metaValue}>{workout.categoria}</ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.workoutActions}>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => startWorkout(workout)}
                >
                  <ThemedText style={styles.startButtonText}>▶ Inizia</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.detailsButton}>
                  <ThemedText style={styles.detailsButtonText}>Dettagli</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: AppTheme.spacing.md,
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
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.md,
  },
  searchInput: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: AppTheme.colors.text,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  categoriesContainer: {
    marginBottom: AppTheme.spacing.lg,
  },
  categoriesContent: {
    flexDirection: 'row',
    paddingHorizontal: AppTheme.spacing.lg,
    gap: AppTheme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  workoutsList: {
    flex: 1,
    paddingHorizontal: AppTheme.spacing.lg,
  },
  workoutCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    padding: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  workoutHeader: {
    marginBottom: AppTheme.spacing.md,
  },
  workoutInfo: {
    gap: AppTheme.spacing.sm,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.sm,
  },
  categoryIconLarge: {
    fontSize: 24,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    flex: 1,
  },
  workoutDescription: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    lineHeight: 20,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: AppTheme.spacing.lg,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: AppTheme.spacing.md,
  },
  startButton: {
    flex: 1,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: AppTheme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: AppTheme.spacing.lg,
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
  },
});
