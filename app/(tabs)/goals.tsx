
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { AppTheme } from '@/constants/AppTheme';

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('obiettivi')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGoals(data || []);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (startDate, targetDate) => {
    const start = new Date(startDate);
    const target = new Date(targetDate);
    const today = new Date();
    
    const totalDays = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const toggleGoalComplete = async (goalId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('obiettivi')
        .update({ completato: !currentStatus })
        .eq('id', goalId);

      if (error) throw error;
      
      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, completato: !currentStatus }
          : goal
      ));
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aggiornare l\'obiettivo');
    }
  };

  const renderGoalCard = (goal) => {
    const daysRemaining = calculateDaysRemaining(goal.data_scadenza);
    const progress = calculateProgress(goal.data_inizio, goal.data_scadenza);
    
    return (
      <View key={goal.id} style={[
        styles.goalCard,
        goal.completato && styles.goalCardCompleted
      ]}>
        <View style={styles.goalHeader}>
          <Text style={[
            styles.goalName,
            goal.completato && styles.goalNameCompleted
          ]}>
            {goal.nome}
          </Text>
          <TouchableOpacity
            style={[
              styles.statusButton,
              goal.completato && styles.statusButtonCompleted
            ]}
            onPress={() => toggleGoalComplete(goal.id, goal.completato)}
          >
            <Text style={styles.statusIcon}>
              {goal.completato ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        </View>

        {goal.note && (
          <Text style={styles.goalNotes}>{goal.note}</Text>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${progress}%` }
            ]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% completato</Text>
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.dateText}>
            Inizio: {new Date(goal.data_inizio).toLocaleDateString('it-IT')}
          </Text>
          <Text style={[
            styles.dateText,
            daysRemaining < 0 && styles.overdueText,
            goal.completato && styles.completedText
          ]}>
            {goal.completato 
              ? 'Completato!' 
              : daysRemaining < 0 
                ? `${Math.abs(daysRemaining)} giorni in ritardo`
                : `${daysRemaining} giorni rimanenti`
            }
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.viewProgressButton}
          onPress={() => router.push(`/goals/${goal.id}/timeline`)}
        >
          <Text style={styles.viewProgressText}>📊 Visualizza Timeline</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Caricamento obiettivi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>I Miei Obiettivi</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/goals/create')}
        >
          <Text style={styles.addButtonText}>+ Nuovo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>Nessun Obiettivo</Text>
            <Text style={styles.emptyStateText}>
              Crea il tuo primo obiettivo per iniziare il tuo percorso di trasformazione
            </Text>
            <TouchableOpacity 
              style={styles.createFirstGoalButton}
              onPress={() => router.push('/goals/create')}
            >
              <Text style={styles.createFirstGoalText}>Crea Primo Obiettivo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalsContainer}>
            {goals.map(renderGoalCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  headerTitle: {
    fontSize: AppTheme.fontSize.xxl,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  addButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.md,
  },
  addButtonText: {
    fontSize: AppTheme.fontSize.sm,
    fontWeight: 'bold',
    color: AppTheme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  goalsContainer: {
    padding: AppTheme.spacing.md,
  },
  goalCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  goalCardCompleted: {
    borderColor: AppTheme.colors.success,
    backgroundColor: AppTheme.colors.success + '10',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  goalName: {
    fontSize: AppTheme.fontSize.lg,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    flex: 1,
  },
  goalNameCompleted: {
    textDecorationLine: 'line-through',
    color: AppTheme.colors.textSecondary,
  },
  statusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonCompleted: {
    backgroundColor: AppTheme.colors.success,
    borderColor: AppTheme.colors.success,
  },
  statusIcon: {
    fontSize: 16,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
  },
  goalNotes: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.md,
    fontStyle: 'italic',
  },
  progressSection: {
    marginBottom: AppTheme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: AppTheme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: AppTheme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppTheme.colors.primary,
  },
  progressText: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: AppTheme.spacing.md,
  },
  dateText: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
  },
  overdueText: {
    color: AppTheme.colors.error,
    fontWeight: 'bold',
  },
  completedText: {
    color: AppTheme.colors.success,
    fontWeight: 'bold',
  },
  viewProgressButton: {
    backgroundColor: AppTheme.colors.primary + '20',
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.sm,
    alignItems: 'center',
  },
  viewProgressText: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: AppTheme.spacing.xl,
    paddingVertical: AppTheme.spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: AppTheme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: AppTheme.fontSize.xl,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.sm,
  },
  emptyStateText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: AppTheme.spacing.xl,
  },
  createFirstGoalButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
  },
  createFirstGoalText: {
    fontSize: AppTheme.fontSize.md,
    fontWeight: 'bold',
    color: AppTheme.colors.white,
  },
});
