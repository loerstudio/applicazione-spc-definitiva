
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { supabase } from '@/lib/supabase';
import { AppTheme } from '@/constants/AppTheme';

const { width, height } = Dimensions.get('window');

// Lista completa degli esercizi con i tuoi video YouTube
const EXERCISES_DATA = [
  {
    id: 1,
    nome: 'Kickback con Manubri',
    video_url: 'https://www.youtube.com/watch?v=fY0GtRAcRY4',
    categoria: 'Glutei',
    durata: '45 secondi',
    difficolta: 'Medio',
    descrizione: 'Esercizio per rafforzare e tonificare i glutei'
  },
  {
    id: 2,
    nome: 'Hip Thrust Gamba Singola',
    video_url: 'https://www.youtube.com/watch?v=4c2K9nefRBY',
    categoria: 'Glutei',
    durata: '30 secondi',
    difficolta: 'Avanzato',
    descrizione: 'Hip thrust monopodalico per massima attivazione'
  },
  {
    id: 3,
    nome: 'Back Extensions',
    video_url: 'https://www.youtube.com/watch?v=Sxihv3Boq-w',
    categoria: 'Schiena',
    durata: '60 secondi',
    difficolta: 'Facile',
    descrizione: 'Rinforzo della catena posteriore'
  },
  {
    id: 4,
    nome: 'Spider Curl con Manubri',
    video_url: 'https://www.youtube.com/watch?v=Up20V_lWZ_k',
    categoria: 'Bicipiti',
    durata: '45 secondi',
    difficolta: 'Medio',
    descrizione: 'Isolamento perfetto per i bicipiti'
  },
  {
    id: 5,
    nome: 'Side Plank Hand to Toe',
    video_url: 'https://www.youtube.com/watch?v=uSu1j4tbqDI',
    categoria: 'Core',
    durata: '30 secondi',
    difficolta: 'Avanzato',
    descrizione: 'Plank laterale dinamico per core e stabilità'
  },
  {
    id: 6,
    nome: 'Leg Extension',
    video_url: 'https://www.youtube.com/watch?v=0XkWLaudDJc',
    categoria: 'Quadricipiti',
    durata: '45 secondi',
    difficolta: 'Medio',
    descrizione: 'Isolamento dei quadricipiti'
  },
  {
    id: 7,
    nome: 'Rematore con Manubrio Singolo',
    video_url: 'https://www.youtube.com/watch?v=hA5cIMNxdEU',
    categoria: 'Schiena',
    durata: '45 secondi',
    difficolta: 'Medio',
    descrizione: 'Sviluppo dorsali e romboidi'
  },
  {
    id: 8,
    nome: 'Chest Press',
    video_url: 'https://www.youtube.com/watch?v=Mqt7UKD5cwM',
    categoria: 'Petto',
    durata: '45 secondi',
    difficolta: 'Facile',
    descrizione: 'Esercizio base per il petto'
  },
  {
    id: 9,
    nome: 'LLPPT Plank',
    video_url: 'https://www.youtube.com/watch?v=LioOOJVIbMw',
    categoria: 'Core',
    durata: '60 secondi',
    difficolta: 'Avanzato',
    descrizione: 'Long lever posterior pelvic tilt plank'
  },
  {
    id: 10,
    nome: 'Curl Manubri Supinazione',
    video_url: 'https://www.youtube.com/watch?v=lFAPH2liNUo',
    categoria: 'Bicipiti',
    durata: '45 secondi',
    difficolta: 'Medio',
    descrizione: 'Curl con rotazione per massima contrazione'
  },
];

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState(EXERCISES_DATA);
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const categories = ['Tutti', 'Glutei', 'Schiena', 'Bicipiti', 'Core', 'Quadricipiti', 'Petto'];

  const filteredExercises = selectedCategory === 'Tutti' 
    ? exercises 
    : exercises.filter(exercise => exercise.categoria === selectedCategory);

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`;
  };

  const getDifficultyColor = (difficolta) => {
    switch (difficolta) {
      case 'Facile': return AppTheme.colors.success;
      case 'Medio': return AppTheme.colors.warning;
      case 'Avanzato': return AppTheme.colors.error;
      default: return AppTheme.colors.textSecondary;
    }
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => {
        setSelectedExercise(item);
        setShowVideoModal(true);
      }}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.nome}</Text>
        <Text style={styles.exerciseDescription}>{item.descrizione}</Text>
        
        <View style={styles.exerciseStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Categoria</Text>
            <Text style={styles.statValue}>{item.categoria}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Durata</Text>
            <Text style={styles.statValue}>{item.durata}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Difficoltà</Text>
            <Text style={[styles.statValue, { color: getDifficultyColor(item.difficolta) }]}>
              {item.difficolta}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.playButtonContainer}>
        <TouchableOpacity style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item && styles.categoryButtonTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Esercizi</Text>
        <Text style={styles.headerSubtitle}>{filteredExercises.length} esercizi disponibili</Text>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Exercises List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.exercisesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowVideoModal(false)}
            >
              <Text style={styles.closeButtonText}>✕ Chiudi</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedExercise?.nome}
            </Text>
            <View />
          </View>

          {selectedExercise && (
            <View style={styles.videoContainer}>
              <WebView
                source={{ uri: getYouTubeEmbedUrl(selectedExercise.video_url) }}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
              
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseDetailTitle}>Dettagli Esercizio</Text>
                <Text style={styles.exerciseDetailText}>{selectedExercise.descrizione}</Text>
                
                <View style={styles.exerciseDetailStats}>
                  <View style={styles.detailStatItem}>
                    <Text style={styles.detailStatLabel}>⏱ Durata</Text>
                    <Text style={styles.detailStatValue}>{selectedExercise.durata}</Text>
                  </View>
                  <View style={styles.detailStatItem}>
                    <Text style={styles.detailStatLabel}>📊 Difficoltà</Text>
                    <Text style={[
                      styles.detailStatValue, 
                      { color: getDifficultyColor(selectedExercise.difficolta) }
                    ]}>
                      {selectedExercise.difficolta}
                    </Text>
                  </View>
                  <View style={styles.detailStatItem}>
                    <Text style={styles.detailStatLabel}>🏷 Categoria</Text>
                    <Text style={styles.detailStatValue}>{selectedExercise.categoria}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
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
  headerSubtitle: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginTop: AppTheme.spacing.xs,
  },
  categoriesContainer: {
    paddingVertical: AppTheme.spacing.md,
  },
  categoriesList: {
    paddingHorizontal: AppTheme.spacing.md,
  },
  categoryButton: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    marginRight: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  categoryButtonActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  categoryButtonText: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.text,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: AppTheme.colors.white,
    fontWeight: 'bold',
  },
  exercisesList: {
    paddingHorizontal: AppTheme.spacing.md,
  },
  exerciseCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: AppTheme.fontSize.lg,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.xs,
  },
  exerciseDescription: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.md,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: AppTheme.fontSize.xs,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.xs,
  },
  statValue: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.text,
    fontWeight: '600',
  },
  playButtonContainer: {
    marginLeft: AppTheme.spacing.md,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 18,
    color: AppTheme.colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  closeButton: {
    padding: AppTheme.spacing.sm,
  },
  closeButtonText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.primary,
  },
  modalTitle: {
    fontSize: AppTheme.fontSize.lg,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    textAlign: 'center',
    flex: 1,
  },
  videoContainer: {
    flex: 1,
  },
  webView: {
    height: 250,
    backgroundColor: AppTheme.colors.background,
  },
  exerciseDetails: {
    padding: AppTheme.spacing.md,
    flex: 1,
  },
  exerciseDetailTitle: {
    fontSize: AppTheme.fontSize.lg,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.md,
  },
  exerciseDetailText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: AppTheme.spacing.lg,
  },
  exerciseDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
  },
  detailStatItem: {
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.xs,
  },
  detailStatValue: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.text,
    fontWeight: 'bold',
  },
});
