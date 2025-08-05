
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppTheme } from '@/constants/AppTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface UserProfile {
  nome: string;
  cognome: string;
  ruolo: string;
}

interface TodayWorkout {
  id: string;
  nome: string;
  durata: number;
  categoria: string;
  difficolta: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/auth/login');
      return;
    }
    fetchUserData();
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, cognome, ruolo')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Fetch a random workout for today
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('is_public', true)
        .limit(1);

      if (workouts && workouts.length > 0) {
        setTodayWorkout(workouts[0]);
      }

    } catch (error) {
      console.error('Errore caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Cardio', icon: '🏃‍♂️', color: '#FF6B6B' },
    { name: 'Yoga', icon: '🧘‍♀️', color: '#4ECDC4' },
    { name: 'Boxing', icon: '🥊', color: '#45B7D1' },
    { name: 'Forza', icon: '💪', color: '#96CEB4' },
  ];

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Caricamento...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Ciao, {userProfile?.nome || 'Utente'}!</ThemedText>
            <ThemedText style={styles.subGreeting}>
              {userProfile?.ruolo === 'coach' ? 'Allenatore' : 'Pronti per allenarci?'}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <ThemedText style={styles.profileInitial}>
              {userProfile?.nome?.[0] || 'U'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Today's Workout Card */}
        {todayWorkout && (
          <View style={styles.todayWorkoutCard}>
            <View style={styles.workoutHeader}>
              <View>
                <ThemedText style={styles.workoutLabel}>ALLENAMENTO DI OGGI</ThemedText>
                <ThemedText style={styles.workoutTitle}>{todayWorkout.nome}</ThemedText>
                <View style={styles.workoutMeta}>
                  <ThemedText style={styles.workoutDuration}>
                    {todayWorkout.durata} min
                  </ThemedText>
                  <View style={styles.workoutDot} />
                  <ThemedText style={styles.workoutCalories}>
                    ~{Math.round(todayWorkout.durata * 8)} kcal
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <ThemedText style={styles.playIcon}>▶</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.workoutImageContainer}>
              <View style={styles.workoutImage}>
                <ThemedText style={styles.workoutImageIcon}>
                  {todayWorkout.categoria === 'cardio' ? '🏃‍♂️' :
                   todayWorkout.categoria === 'yoga' ? '🧘‍♀️' :
                   todayWorkout.categoria === 'boxing' ? '🥊' : '💪'}
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Categorie</ThemedText>
          
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.categoryCard, { backgroundColor: category.color + '20' }]}
                onPress={() => router.push('/workouts')}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Popolari</ThemedText>
            <TouchableOpacity onPress={() => router.push('/workouts')}>
              <ThemedText style={styles.viewAllText}>Vedi tutti</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.popularWorkouts}>
              {[1, 2, 3].map((item) => (
                <TouchableOpacity key={item} style={styles.popularWorkoutCard}>
                  <View style={styles.popularWorkoutImage}>
                    <ThemedText style={styles.popularWorkoutIcon}>💪</ThemedText>
                  </View>
                  <ThemedText style={styles.popularWorkoutTitle}>
                    Allenamento {item}
                  </ThemedText>
                  <ThemedText style={styles.popularWorkoutSubtitle}>
                    15 min • Principiante
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  todayWorkoutCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 20,
    padding: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.xl,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppTheme.spacing.md,
  },
  workoutLabel: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDuration: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppTheme.colors.textSecondary,
    marginHorizontal: 8,
  },
  workoutCalories: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
  workoutImageContainer: {
    alignItems: 'center',
  },
  workoutImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppTheme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutImageIcon: {
    fontSize: 32,
  },
  section: {
    marginBottom: AppTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppTheme.spacing.md,
  },
  categoryCard: {
    width: '47%',
    padding: AppTheme.spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  popularWorkouts: {
    flexDirection: 'row',
    gap: AppTheme.spacing.md,
  },
  popularWorkoutCard: {
    width: 140,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    padding: AppTheme.spacing.md,
  },
  popularWorkoutImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  popularWorkoutIcon: {
    fontSize: 24,
  },
  popularWorkoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.text,
    marginBottom: 4,
  },
  popularWorkoutSubtitle: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
  },
});
